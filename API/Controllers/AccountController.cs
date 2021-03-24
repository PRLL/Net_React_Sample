using System.Security.Claims;
using System.Threading.Tasks;
using API.DTOs;
using API.Services;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        public AccountController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, TokenService tokenService)
        {
            this._tokenService = tokenService;
            this._signInManager = signInManager;
            this._userManager = userManager;
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await this._userManager.FindByEmailAsync(loginDto.Email);

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
            var user = await this._userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email));

            return this.CreateUser(user);
        }

        private UserDto CreateUser(AppUser user)
        {
            return new UserDto
            {
                Username = user.UserName,
                DisplayName = user.DisplayName,
                Image = null,
                Token = this._tokenService.CreateToken(user)
            };
        }
    }
}