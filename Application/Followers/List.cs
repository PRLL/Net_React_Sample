using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Persistence;

namespace Application.Followers
{
    public class List
    {
        public class Query : IRequest<Result<List<Profiles.Profile>>>
        {
            public string Predicate { get; set; }
            public string Username { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<List<Profiles.Profile>>>
        {
            private readonly DataContext _dataContext;
            private readonly IMapper _mapper;
            private readonly IUserAccessor _userAccessor;
            private readonly ILogger<List> _logger;
            public Handler(DataContext dataContext, IMapper mapper, IUserAccessor userAccessor, ILogger<List> logger)
            {
                this._logger = logger;
                this._dataContext = dataContext;
                this._mapper = mapper;
                this._userAccessor = userAccessor;
            }

            public async Task<Result<List<Profiles.Profile>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var profiles = new List<Profiles.Profile>();

                switch (request.Predicate)
                {
                    case "followers":
                        profiles = await this._dataContext.UserFollowings
                            .Where(userFollowing => userFollowing.Target.UserName == request.Username)
                            .Select(userFollowing => userFollowing.Observer)
                            .ProjectTo<Profiles.Profile>(this._mapper.ConfigurationProvider, new { currentUsername = this._userAccessor.GetUserName() })
                            .ToListAsync();
                        break;
                    case "following":
                        profiles = await this._dataContext.UserFollowings
                            .Where(userFollowing => userFollowing.Observer.UserName == request.Username)
                            .Select(userFollowing => userFollowing.Target)
                            .ProjectTo<Profiles.Profile>(this._mapper.ConfigurationProvider, new { currentUsername = this._userAccessor.GetUserName() })
                            .ToListAsync();
                        break;
                }

                return Result<List<Profiles.Profile>>.Success(profiles);
            }
        }
    }
}