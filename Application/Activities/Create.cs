using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class Create
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Activity Activity { get; set; }
        }

        public class CommandValidator : AbstractValidator<Command>
        {
            public CommandValidator()
            {
                RuleFor(command => command.Activity).SetValidator(new ActivityValidator());
            }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _dataContext;
            private readonly IUserAccessor _iUserAccessor;

            public Handler(DataContext dataContext, IUserAccessor iUserAccessor)
            {
                this._iUserAccessor = iUserAccessor;
                this._dataContext = dataContext;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = await this._dataContext.Users.FirstOrDefaultAsync(user => user.UserName == this._iUserAccessor.GetUserName());

                var attendee = new ActivityAttendee
                {
                    AppUser = user,
                    Activity= request.Activity,
                    IsHost = true
                };

                request.Activity.Attendees.Add(attendee);

                this._dataContext.Activities.Add(request.Activity);

                return await this._dataContext.SaveChangesAsync() > 0
                    ? Result<Unit>.Success(Unit.Value)
                    : Result<Unit>.Failure("Failed to create activity");
            }
        }
    }
}