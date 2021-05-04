using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using API.DTOs;
using API.Services;
using Domain;
using Infrastructure.Email;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly TokenService _tokenService;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly EmailSender _emailSender;
        public AccountController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager,
        TokenService tokenService, IConfiguration configuration, EmailSender emailSender)
        {
            this._userManager = userManager;
            this._signInManager = signInManager;
            this._tokenService = tokenService;
            this._configuration = configuration;
            this._httpClient = new HttpClient
            {
                BaseAddress = new System.Uri("https://graph.facebook.com")
            };
            this._emailSender = emailSender;
        }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await this._userManager.Users
            .Include(appUser => appUser.Photos)
            .FirstOrDefaultAsync(appUser => appUser.Email == loginDto.Email);
        if (user == null) return Unauthorized("Invalid Email");

        // if (user.UserName == "bob") user.EmailConfirmed = true;

        if (!user.EmailConfirmed) return Unauthorized("Email Not Confimed");

        var result = await this._signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

        if (result.Succeeded)
        {
            await this.SetRefreshToken(user);
            return this.CreateUser(user);
        }
        else
        {
            return Unauthorized("Invalid Password");
        }
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        if (await this._userManager.Users.AnyAsync(user => user.Email == registerDto.Email))
        {
            ModelState.AddModelError("email", "Email already taken");
            return ValidationProblem();
        }

        if (await this._userManager.Users.AnyAsync(user => user.UserName == registerDto.Username))
        {
            ModelState.AddModelError("username", "Username already registered");
            return ValidationProblem();
        }

        var user = new AppUser
        {
            DisplayName = registerDto.DisplayName,
            Email = registerDto.Email,
            UserName = registerDto.Username
        };

        var result = await this._userManager.CreateAsync(user, registerDto.Password);
        if (result.Succeeded)
        {
            var origin = Request.Headers["origin"];
            var emailVerificationToken = await this._userManager.GenerateEmailConfirmationTokenAsync(user);
            emailVerificationToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(emailVerificationToken));

            var verifyUrl = $"{origin}/account/verifyEmail?emailVerificationToken={emailVerificationToken}&email={user.Email}";
            var message = $"<p>Please click the below link to verify your email address:</p><p><a href='{verifyUrl}'>Click to verify email</a></p>";

            await this._emailSender.SendEmailAsync(user.Email, "Please verify email", message);
            return Ok("Registration success! Please, verify your email");
        }
        else
        {
            return BadRequest("Error registering user");
        }
    }

    [AllowAnonymous]
    [HttpPost("verifyEmail")]
    public async Task<ActionResult<UserDto>> VerifyEmail(string emailVerificationToken, string email)
    {
        var user = await this._userManager.FindByEmailAsync(email);
        if (user == null) return Unauthorized();

        var decodedTokenBytes = WebEncoders.Base64UrlDecode(emailVerificationToken);
        var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);

        var result = await this._userManager.ConfirmEmailAsync(user, decodedToken);

        if (result.Succeeded)
        {
            return Ok("Email Confirmed! You can now login");
        }
        else
        {
            return BadRequest("Error verifying email");
        }
    }

    [AllowAnonymous]
    [HttpGet("resendEmailConfirmationLink")]
    public async Task<IActionResult> ResendEmailConfirmationLink(string email)
    {
        var user = await this._userManager.FindByEmailAsync(email);
        if (user == null) return Unauthorized();

        var origin = Request.Headers["origin"];
        var token = await this._userManager.GenerateEmailConfirmationTokenAsync(user);
        token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

        var verifyUrl = $"{origin}/account/verifyEmail?emailVerificationToken={token}&email={user.Email}";
        var message = $"<p>Please click the below link to verify your email address:</p><p><a href='{verifyUrl}'>Click to verify email</a></p>";

        await _emailSender.SendEmailAsync(user.Email, "Please verify email", message);

        return Ok("Email verification link resent");
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var user = await this._userManager.Users
            .Include(appUser => appUser.Photos)
            .FirstOrDefaultAsync(appUser => appUser.Email == User.FindFirstValue(ClaimTypes.Email));

        await this.SetRefreshToken(user);
        return this.CreateUser(user);
    }

    [AllowAnonymous]
    [HttpPost("fbLogin")]
    public async Task<ActionResult<UserDto>> FacebookLogin(string accessToken)
    {
        var facebookKeys = this._configuration["Facebook:AppId"] + "|" + this._configuration["Facebook:AppSecret"];
        var verifyToken = await this._httpClient.GetAsync($"debug_token?input_token={accessToken}&access_token={facebookKeys}");
        if (!verifyToken.IsSuccessStatusCode) return Unauthorized();

        var facebookUrl = $"me?access_token={accessToken}&fields=name,email,picture.width(100).height(100)";
        var response = await this._httpClient.GetAsync(facebookUrl);
        if (!response.IsSuccessStatusCode) return Unauthorized();

        var facebookData = JsonConvert.DeserializeObject<dynamic>(await response.Content.ReadAsStringAsync());

        var username = (string)facebookData.id;
        var user = await this._userManager.Users.Include(p => p.Photos)
            .FirstOrDefaultAsync(AppUser => AppUser.UserName == username);
        if (user != null) return this.CreateUser(user);

        user = new AppUser
        {
            DisplayName = (string)facebookData.name,
            Email = (string)facebookData.email,
            UserName = (string)facebookData.id,
            Photos = new List<Photo>
                {
                    new Photo
                    {
                        Id = "fb_" + (string)facebookData.id,
                        Url = (string)facebookData.picture.data.url,
                        IsMain = true
                    }
                }
        };

        user.EmailConfirmed = true;

        var result = await this._userManager.CreateAsync(user);
        if (!result.Succeeded) return BadRequest("Error creating user account with facebook");

        await this.SetRefreshToken(user);
        return this.CreateUser(user);
    }

    [Authorize]
    [HttpPost("refreshToken")]
    public async Task<ActionResult<UserDto>> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        var user = await this._userManager.Users
            .Include(appUser => appUser.RefreshTokens)
            .Include(appUser => appUser.Photos)
            .FirstOrDefaultAsync(appUser => appUser.UserName == User.FindFirstValue(ClaimTypes.Name));

        var oldToken = user.RefreshTokens.SingleOrDefault(x => x.Token == refreshToken);
        if (oldToken != null && !oldToken.IsActive) return Unauthorized();

        return this.CreateUser(user);
    }

    private async Task SetRefreshToken(AppUser appUser)
    {
        var refreshToken = this._tokenService.GenerateRefreshToken();

        appUser.RefreshTokens.Add(refreshToken);
        await this._userManager.UpdateAsync(appUser);

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Expires = DateTime.UtcNow.AddDays(7)
        };
        Response.Cookies.Append("refreshToken", refreshToken.Token, cookieOptions);
    }

    private UserDto CreateUser(AppUser user)
    {
        return new UserDto
        {
            Username = user.UserName,
            DisplayName = user.DisplayName,
            Image = user.Photos?.FirstOrDefault(photo => photo.IsMain)?.Url,
            Token = this._tokenService.CreateToken(user)
        };
    }
}
}