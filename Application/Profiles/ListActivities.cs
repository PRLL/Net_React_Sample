using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles
{
    public class ListActivities
    {
        public class Query : IRequest<Result<List<ProfileActivityDto>>>
        {
            public string Username { get; set; }
            public string Predicate { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<List<ProfileActivityDto>>>
        {
            private readonly DataContext _dataContext;
            private readonly IMapper _mapper;
            public Handler(DataContext dataContext, IMapper mapper)
            {
                this._dataContext = dataContext;
                _mapper = mapper;
            }

            public async Task<Result<List<ProfileActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var query = this._dataContext.ActivityAttendees
                    .Where(activityAtendee => activityAtendee.AppUser.UserName == request.Username)
                    .OrderBy(activityAtendee => activityAtendee.Activity.Date)
                    .ProjectTo<ProfileActivityDto>(this._mapper.ConfigurationProvider)
                    .AsQueryable();

                query = request.Predicate switch
                {
                    "past" => query.Where(profileActivityDto => profileActivityDto.Date <= DateTime.Now),
                    "hosting" => query.Where(profileActivityDto => profileActivityDto.HostUsername == request.Username),
                    _ => query.Where(profileActivityDto => profileActivityDto.Date >= DateTime.Now)
                };

                var activities = await query.ToListAsync();
                return Result<List<ProfileActivityDto>>.Success(activities);
            }
        }
    }
}