using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using MediatR;
using Persistence;

namespace Application.Activities
{
    public class Delete
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _dataContext;
            public Handler(DataContext dataContext)
            {
                this._dataContext = dataContext;

            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var activity = await this._dataContext.Activities.FindAsync(request.Id);
                if (activity == null)
                {
                    return null;
                }
                else
                {
                    this._dataContext.Remove(activity);

                    return await this._dataContext.SaveChangesAsync() > 0
                        ? Result<Unit>.Success(Unit.Value)
                        : Result<Unit>.Failure("Failed to delete the activity");
                }
            }
        }
    }
}