using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Infrastructure.Security
{
    public class IsHostRequirement : IAuthorizationRequirement
    {

    }

    public class IsHostRequirementHandler : AuthorizationHandler<IsHostRequirement>
    {
        private readonly DataContext _dataContext;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public IsHostRequirementHandler(DataContext dataContext, IHttpContextAccessor httpContextAccessor)
        {
            this._dataContext = dataContext;
            this._httpContextAccessor = httpContextAccessor;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext authorizationHandlerContext, IsHostRequirement isHostRequirement)
        {
            var userId = authorizationHandlerContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Task.CompletedTask;

            var activityId = Guid.Parse(this._httpContextAccessor.HttpContext?.Request.RouteValues
                .SingleOrDefault(keyValuePair => keyValuePair.Key == "id").Value?.ToString());


            var attendee = this._dataContext.ActivityAttendees.AsNoTracking()
                .SingleOrDefaultAsync(activityAttendee => activityAttendee.AppUserId == userId && activityAttendee.ActivityId == activityId).Result;
            if (attendee != null && attendee.IsHost)
            {
                authorizationHandlerContext.Succeed(isHostRequirement);
            }

            return Task.CompletedTask;
        }
    }
}