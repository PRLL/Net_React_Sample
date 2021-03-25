using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Domain;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace API.Services
{
    public class TokenService
    {
        private readonly IConfiguration _config;
        public TokenService(IConfiguration config)
        {
            this._config = config;
        }

        public string CreateToken(AppUser user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            return tokenHandler.WriteToken(
                tokenHandler.CreateToken(
                    new SecurityTokenDescriptor
                    {
                        Subject = new ClaimsIdentity(
                            new List<Claim>
                                {
                                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                                    new Claim(ClaimTypes.Name, user.UserName),
                                    new Claim(ClaimTypes.Email, user.Email)
                                }),
                        Expires = DateTime.Now.AddDays(7),
                        SigningCredentials = new SigningCredentials(
                            new SymmetricSecurityKey(
                                Encoding.UTF8.GetBytes(this._config["TokenKey"])),
                                SecurityAlgorithms.HmacSha512Signature)
                    }));
        }
    }
}