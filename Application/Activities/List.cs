using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.Extensions.Logging;
using Persistence;

namespace Application.Activities
{
    public class List
    {
        public class Query : IRequest<Result<PagedList<ActivityDto>>>
        {
            public ActivityParams PagingParams { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<PagedList<ActivityDto>>>
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

            public async Task<Result<PagedList<ActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var query = this._dataContext.Activities
                    .Where(activity => activity.Date >= request.PagingParams.StartDate)
                    .OrderBy(activity => activity.Date)
                    .ProjectTo<ActivityDto>(this._mapper.ConfigurationProvider, new { currentUsername = this._userAccessor.GetUserName() })
                    .AsQueryable();
                // .ToListAsync(cancellationToken);

                if (request.PagingParams.IsGoing && !request.PagingParams.IsHost)
                {
                    query = query.Where(activityDto => activityDto.Attendees.Any(a => a.Username == this._userAccessor.GetUserName()));
                }

                if (request.PagingParams.IsHost && !request.PagingParams.IsGoing)
                {
                    query = query.Where(activityDto => activityDto.HostUsername == this._userAccessor.GetUserName());
                }

                return Result<PagedList<ActivityDto>>
                    .Success(await PagedList<ActivityDto>
                        .CreateAsync(query, request.PagingParams.PageNumber, request.PagingParams.PageSize));
            }
        }
    }
}
