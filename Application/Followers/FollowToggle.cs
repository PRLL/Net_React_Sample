using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Followers
{
    public class FollowToggle
    {
        public class Command : IRequest<Result<Unit>>
        {
            public string TargetUsername { get; set; }
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
                var observer = await this._dataContext.Users
                    .FirstOrDefaultAsync(appUser => appUser.UserName == this._userAccessor.GetUserName());
                
                var target = await this._dataContext.Users
                    .FirstOrDefaultAsync(appUser => appUser.UserName == request.TargetUsername);
                if (target == null) return null;

                var following = await this._dataContext.UserFollowings.FindAsync(observer.Id, target.Id);
                if (following == null)
                {
                    this._dataContext.UserFollowings
                        .Add(new UserFollowing
                        {
                            Observer = observer,
                            Target = target
                        });
                }
                else
                {
                    this._dataContext.UserFollowings.Remove(following);
                }

                return await this._dataContext.SaveChangesAsync() > 0
                    ? Result<Unit>.Success(Unit.Value)
                    : Result<Unit>.Failure("Error changing follow status");
            }
        }
    }
}