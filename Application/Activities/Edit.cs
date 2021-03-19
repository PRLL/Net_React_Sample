using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using AutoMapper;
using Domain;
using FluentValidation;
using MediatR;
using Persistence;

namespace Application.Activities
{
    public class Edit
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
            private readonly IMapper _mapper;
            public Handler(DataContext dataContext, IMapper mapper)
            {
                this._mapper = mapper;
                this._dataContext = dataContext;
            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var activity = await this._dataContext.Activities.FindAsync(request.Activity.Id);
                if (activity == null)
                {
                    return null;
                }
                else
                {
                    this._mapper.Map(request.Activity, activity);

                    var result = await this._dataContext.SaveChangesAsync() > 0;
                    return result
                        ? Result<Unit>.Success(Unit.Value)
                        : Result<Unit>.Failure("Failed to update the activity");
                }
            }
        }
    }
}