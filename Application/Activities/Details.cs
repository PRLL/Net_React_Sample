using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class Details
    {
        public class Query : IRequest<Result<ActivityDto>>
        {
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<ActivityDto>>
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

            public async Task<Result<ActivityDto>> Handle(Query request, CancellationToken cancellationToken)
            {
                return Result<ActivityDto>.Success(await this._dataContext.Activities
                    .ProjectTo<ActivityDto>(this._mapper.ConfigurationProvider, new { currentUsername = this._userAccessor.GetUserName() })
                    .FirstOrDefaultAsync(activityDto => activityDto.Id == request.Id));
            }
        }
    }
}