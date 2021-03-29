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
    public class Delete
    {
        public class Command : IRequest<Result<Unit>>
        {
            public string Id { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _dataContext;
            private readonly IPhotoAccessor _photoAccessor;
            private readonly IUserAccessor _userAccessor;
            public Handler(DataContext dataContext, IPhotoAccessor photoAccessor, IUserAccessor userAccessor)
            {
                this._dataContext = dataContext;
                this._photoAccessor = photoAccessor;
                this._userAccessor = userAccessor;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = await this._dataContext.Users.Include(appUser => appUser.Photos)
                    .FirstOrDefaultAsync(appUser => appUser.UserName == this._userAccessor.GetUserName());
                if (user == null) return null;

                var photo = user.Photos.FirstOrDefault(photo => photo.Id == request.Id);
                if (photo == null) return null;

                // if (photo.IsMain) return Result<Unit>.Failure("You cannot delete your main photo");

                if (await this._photoAccessor.DeletePhoto(photo.Id) == null) return Result<Unit>.Failure("Problem deleting photo from cloudinary");

                user.Photos.Remove(photo);

                return await this._dataContext.SaveChangesAsync() > 0
                    ? Result<Unit>.Success(Unit.Value)
                    : Result<Unit>.Failure("Problem deleting photo from API");
            }
        }
    }
}