using System;
using System.Text;
using System.Threading.Tasks;
using API.Services;
using API.SignalR;
using Application.Activities;
using Application.Core;
using Application.Interfaces;
using Domain;
using FluentValidation.AspNetCore;
using Infrastructure.Email;
using Infrastructure.Photos;
using Infrastructure.Security;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Persistence;

namespace API
{
    public class Startup
    {
        private readonly IConfiguration _configuration;
        public Startup(IConfiguration configuration)
        {
            this._configuration = configuration;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers(mvcOptions => 
            {
                //makes all endpoint have to authenticate unless stated otherwise
                mvcOptions.Filters.Add(new AuthorizeFilter(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build()));
            })
            .AddFluentValidation(fluentValidationMvcConfiguration =>
            {
                fluentValidationMvcConfiguration.RegisterValidatorsFromAssemblyContaining<Create>();
            });

            services.AddSwaggerGen(swaggerGenOptions =>
            {
                swaggerGenOptions.SwaggerDoc("v1", new OpenApiInfo { Title = "API", Version = "v1" });
            });

            services.AddDbContext<DataContext>(options =>
            {
                var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

                string connectionString;

                // Depending on if in development or production, use either Heroku-provided
                // connection string, or development connection string from env var.
                if (env == "Development")
                {
                    // Use connection string from file.
                    connectionString = this._configuration.GetConnectionString("DefaultConnection");
                }
                else
                {
                    // Use connection string provided at runtime by Heroku.
                    var connUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

                    // Parse connection URL to connection string for Npgsql
                    connUrl = connUrl.Replace("postgres://", string.Empty);
                    var pgUserPass = connUrl.Split("@")[0];
                    var pgHostPortDb = connUrl.Split("@")[1];
                    var pgHostPort = pgHostPortDb.Split("/")[0];
                    var pgDb = pgHostPortDb.Split("/")[1];
                    var pgUser = pgUserPass.Split(":")[0];
                    var pgPass = pgUserPass.Split(":")[1];
                    var pgHost = pgHostPort.Split(":")[0];
                    var pgPort = pgHostPort.Split(":")[1];

                    connectionString = $"Server={pgHost};Port={pgPort};User Id={pgUser};Password={pgPass};Database={pgDb}; SSL Mode=Require; Trust Server Certificate=true";
                }

                // Whether the connection string came from the local development configuration file
                // or from the environment variable from Heroku, use it to set up your DbContext.
                options.UseNpgsql(connectionString);
            });


            services.AddCors(corsOptions =>
            {
                corsOptions.AddPolicy("CorsPolicy", corsPolicyBuilder =>
                {
                    corsPolicyBuilder
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials()
                        .WithExposedHeaders("WWW-Authenticate", "Pagination")
                        .WithOrigins("http://localhost:3000");
                });
            });

            services.AddMediatR(typeof(List.Handler).Assembly);

            services.AddAutoMapper(typeof(MappingProfiles).Assembly);

            services.AddScoped<IUserAccessor, UserAccessor>();

            services.AddScoped<IPhotoAccessor, PhotoAccessor>();

            services.AddScoped<EmailSender>();

            services.Configure<CloudinarySettings>(this._configuration.GetSection("Cloudinary"));

            services.AddSignalR();

            services.AddIdentityCore<AppUser>(identityOptions => {
                identityOptions.Password.RequireDigit = false;
                identityOptions.Password.RequiredLength = 0;
                identityOptions.Password.RequiredUniqueChars = 0;
                identityOptions.Password.RequireLowercase = false;
                identityOptions.Password.RequireNonAlphanumeric = false;
                identityOptions.Password.RequireUppercase = false;
                identityOptions.SignIn.RequireConfirmedEmail = true;
            })
            .AddEntityFrameworkStores<DataContext>()
            .AddSignInManager<SignInManager<AppUser>>()
            .AddDefaultTokenProviders();

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).
                AddJwtBearer(jwtBearerOptions =>
                {
                    jwtBearerOptions.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(this._configuration["TokenKey"])),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero
                    };

                    jwtBearerOptions.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = messageReceivedContext =>
                        {
                            var accessToken = messageReceivedContext.Request.Query["access_token"];
                            if (!string.IsNullOrEmpty(accessToken) 
                                && (messageReceivedContext.HttpContext.Request.Path.StartsWithSegments("/chat")))
                            {
                                messageReceivedContext.Token = accessToken;
                            }

                            return Task.CompletedTask;
                        }
                    };
                });

            services.AddAuthorization(authorizationOptions => 
            {
                authorizationOptions.AddPolicy("IsActivityHost", authorizationPolicyBuilder =>
                {
                    authorizationPolicyBuilder.Requirements.Add(new IsHostRequirement());
                });
            });

            services.AddTransient<IAuthorizationHandler, IsHostRequirementHandler>();

            services.AddScoped<TokenService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseXContentTypeOptions();
            app.UseReferrerPolicy(options => options.NoReferrer());
            app.UseXXssProtection(options => options.EnabledWithBlockMode());
            app.UseXfo(options => options.Deny());
            app.UseCsp(options => options
                .BlockAllMixedContent()
                .StyleSources(configuration => configuration.Self().CustomSources(
                    "https://fonts.googleapis.com",
                    "sha256-oFySg82XYSNiSd+Q3yfYPD/rxY6RMDMJ0KxzGG74iGM="
                ))
                .FontSources(configuration => configuration.Self().CustomSources(
                    "https://fonts.gstatic.com", "data:"
                ))
                .FormActions(configuration => configuration.Self())
                .FrameAncestors(configuration => configuration.Self())
                .ImageSources(configuration => configuration.Self().CustomSources(
                    "data:",
                    "https://res.cloudinary.com",
                    "https://www.facebook.com",
                    "https://platform-lookaside.fbsbx.com",
                    "https://scontent-iad3-2.xx.fbcdn.net",
                    "https://scontent-iad3-1.xx.fbcdn.net"
                ))
                .ScriptSources(configuration => configuration.Self().CustomSources(
                    "sha256-ma5XxS1EBgt17N22Qq31rOxxRWRfzUTQS1KOtfYwuNo=",
                    "https://connect.facebook.net",
                    "sha256-B9StylemLo/uU5mOAsOfy0LvpYFzJqtyjOOGHBI1hI0="
                ))
            );

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(swaggerUiOptions => swaggerUiOptions.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1"));
            }
            else
            {
                app.Use(async (httpContext, next) =>
                {
                    httpContext.Response.Headers.Add("Strict-Transport-Security", "max-age=31536000");
                    await next.Invoke();
                });
            }

            // app.UseHttpsRedirection();

            app.UseRouting();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseCors("CorsPolicy");

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<ChatHub>("/chat");
                endpoints.MapFallbackToController("Index", "Fallback");
            });
        }
    }
}
