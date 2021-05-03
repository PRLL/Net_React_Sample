using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using API.DTOs;
using API.Services;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace API.Controllers
{
    [AllowAnonymous]
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly TokenService _tokenService;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        public AccountController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager,
        TokenService tokenService, IConfiguration configuration)
        {
            this._userManager = userManager;
            this._signInManager = signInManager;
            this._tokenService = tokenService;
            this._configuration = configuration;
            this._httpClient = new HttpClient
            {
                BaseAddress = new System.Uri("https://graph.facebook.com")
            };
        }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        // var user = await this._userManager.FindByEmailAsync(loginDto.Email);
        var user = await this._userManager.Users
            .Include(appUser => appUser.Photos)
            .FirstOrDefaultAsync(appUser => appUser.Email == loginDto.Email);
        if (user == null) return Unauthorized();

        var result = await this._signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
        return result.Succeeded
            ? this.CreateUser(user)
            : Unauthorized();
    }

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
        return result.Succeeded
            ? this.CreateUser(user)
            : BadRequest("Error registering user");
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var user = await this._userManager.Users
            .Include(appUser => appUser.Photos)
            .FirstOrDefaultAsync(appUser => appUser.Email == User.FindFirstValue(ClaimTypes.Email));

        return this.CreateUser(user);
    }

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

        var result = await this._userManager.CreateAsync(user);
        return result.Succeeded
            ? this.CreateUser(user)
            : BadRequest("Error creating user account with facebook");
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