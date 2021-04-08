using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Comments
{
    public class Create
    {
        public class Command : IRequest<Result<CommentDto>>
        {
            public string Body { get; set; }
            public Guid ActivityId { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.Body).NotEmpty();
            }
        }

        public class Handler : IRequestHandler<Command, Result<CommentDto>>
        {
            private readonly DataContext _dataContext;
            private readonly IMapper _mapper;
            private readonly IUserAccessor _userAccessor;
            public Handler(DataContext dataContext, IMapper mapper, IUserAccessor userAccessor)
            {
                this._dataContext = dataContext;
                this._mapper = mapper;
                this._userAccessor = userAccessor;

            }

            public async Task<Result<CommentDto>> Handle(Command request, CancellationToken cancellationToken)
            {
                var activity = await this._dataContext.Activities.FindAsync(request.ActivityId);
                if (activity == null) return null;

                var user = await this._dataContext.Users
                    .Include(appUser => appUser.Photos)
                    .SingleOrDefaultAsync(appUser => appUser.UserName == this._userAccessor.GetUserName());
                
                var comment = new Comment
                {
                    Author = user,
                    Activity = activity,
                    Body = request.Body
                };

                activity.Comments.Add(comment);

                return await this._dataContext.SaveChangesAsync() > 0
                    ? Result<CommentDto>.Success(this._mapper.Map<CommentDto>(comment))
                    : Result<CommentDto>.Failure("Error adding comment...");
            }
        }
    }
}