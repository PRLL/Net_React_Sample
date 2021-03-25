using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class UpdateAttendance
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _dataContext;
            private readonly IUserAccessor _userAccessor;
            public Handler(DataContext dataContext, IUserAccessor userAccessor)
            {
                this._dataContext = dataContext;
                this._userAccessor = userAccessor;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var activity = await this._dataContext.Activities
                    .Include(activity => activity.Attendees)
                    .ThenInclude(activityAttendee => activityAttendee.AppUser)
                    .FirstOrDefaultAsync(activity => activity.Id == request.Id);                
                if (activity == null) return null;

                var user = await this._dataContext.Users
                    .FirstOrDefaultAsync(appUser => appUser.UserName == this._userAccessor.GetUserName());
                if (user == null) return null;

                var hostUsername = activity.Attendees
                    .FirstOrDefault(activityAttendee => activityAttendee.IsHost)?.AppUser?.UserName;
                
                var attendance = activity.Attendees.FirstOrDefault(x => x.AppUser.UserName == user.UserName);


                if (attendance == null)
                {
                    activity.Attendees 
                        .Add(new ActivityAttendee
                        {
                            AppUser = user,
                            Activity = activity,
                            IsHost = false
                        });
                }
                else
                {
                    if (hostUsername == user.UserName)
                    {
                        activity.IsCancelled = !activity.IsCancelled;
                    }
                    else
                    {
                        activity.Attendees.Remove(attendance);
                    }
                }


                return await this._dataContext.SaveChangesAsync() > 0
                    ? Result<Unit>.Success(Unit.Value)
                    : Result<Unit>.Failure("Error ocurred while trying to update attendance");
            }
        }
    }
}