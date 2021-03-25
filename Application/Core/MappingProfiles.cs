using System.Linq;
using Application.Activities;
using AutoMapper;
using Domain;

namespace Application.Core
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<Activity, Activity>();
            CreateMap<Activity, ActivityDto>()
                .ForMember(destinationMember => destinationMember.HostUsername, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.Attendees
                        .FirstOrDefault(activityAttendee => activityAttendee.IsHost).AppUser.UserName));
            CreateMap<ActivityAttendee, Profiles.Profile>()
                .ForMember(destinationMember => destinationMember.DisplayName, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.AppUser.DisplayName))
                .ForMember(destinationMember => destinationMember.Username, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.AppUser.UserName))
                .ForMember(destinationMember => destinationMember.Bio, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.AppUser.Bio));
        }
    }
}