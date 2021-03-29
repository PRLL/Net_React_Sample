using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Photos
{
    public class SetMain
    {
        public class Command : IRequest<Result<Unit>>
        {
            public string Id { get; set; }
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
                var user = await this._dataContext.Users.Include(appUser => appUser.Photos)
                    .FirstOrDefaultAsync(appUser => appUser.UserName == this._userAccessor.GetUserName());
                if (user == null) return null;

                var photo = user.Photos.FirstOrDefault(photo => photo.Id == request.Id);
                if (photo == null) return null;

                var currentMain = user.Photos.FirstOrDefault(photo => photo.IsMain);
                if (currentMain != null) currentMain.IsMain = false;

                photo.IsMain = true;

                return await this._dataContext.SaveChangesAsync() > 0
                    ? Result<Unit>.Success(Unit.Value)
                    : Result<Unit>.Failure("Problem setting main photo");
            }
        }
    }
}