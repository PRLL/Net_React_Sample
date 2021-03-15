using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Persistence;

namespace Application.Activities
{
    public class List
    {
        public class Query : IRequest<List<Activity>> { }

        public class Handler : IRequestHandler<Query, List<Activity>>
        {
            private readonly DataContext _dataContext;
            private readonly ILogger<List> _logger;
            public Handler(DataContext dataContext, ILogger<List> logger)
            {
                this._logger = logger;
                this._dataContext = dataContext;
            }

            public async Task<List<Activity>> Handle(Query request, CancellationToken cancellationToken)
            {
                // try
                // {
                //     for (var i = 0; i < 10; i++)
                //     {
                //         cancellationToken.ThrowIfCancellationRequested();
                //         await Task.Delay(1000, cancellationToken);
                //         this._logger.LogInformation($"Task {i} has completed");
                //     }
                // }
                // catch (Exception exception) when (exception is TaskCanceledException)
                // {
                //     this._logger.LogInformation("Task was cancelled");
                // }

                return await this._dataContext.Activities.ToListAsync();
            }
        }
    }
}
