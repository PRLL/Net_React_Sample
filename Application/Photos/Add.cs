using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Photos
{
    public class Add
    {
        public class Command : IRequest<Result<Photo>>
        {
            public IFormFile File { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Photo>>
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

            public async Task<Result<Photo>> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = await this._dataContext.Users.Include(appUser => appUser.Photos)
                    .FirstOrDefaultAsync(appUser => appUser.UserName == this._userAccessor.GetUserName());
                if (user == null) return null;

                var photoUploadResult = await this._photoAccessor.AddPhoto(request.File);

                var photo = new Photo
                {
                    Url = photoUploadResult.Url,
                    Id = photoUploadResult.PublicId
                };
                // if first uploaded photo, then set as main
                if (!user.Photos.Any(photo => photo.IsMain)) photo.IsMain = true;

                user.Photos.Add(photo);

                return await this._dataContext.SaveChangesAsync() > 0
                    ? Result<Photo>.Success(photo)
                    : Result<Photo>.Failure("Problem adding photo");
            }
        }
    }
}