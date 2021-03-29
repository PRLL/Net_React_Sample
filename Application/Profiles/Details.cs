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
    public class Details
    {
        public class Query : IRequest<Result<Profile>>
        {
            public string Username { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<Profile>>
        {
            private readonly DataContext _dataContext;
            private readonly IMapper _mapper;
            public Handler(DataContext dataContext, IMapper mapper)
            {
                this._dataContext = dataContext;
                this._mapper = mapper;

            }
            public async Task<Result<Profile>> Handle(Query request, CancellationToken cancellationToken)
            {
                var profile = await this._dataContext.Users
                    .ProjectTo<Profile>(this._mapper.ConfigurationProvider)
                    .SingleOrDefaultAsync(profile => profile.Username == request.Username);

                return profile == null
                    ? null
                    : Result<Profile>.Success(profile);
            }
        }
    }
}