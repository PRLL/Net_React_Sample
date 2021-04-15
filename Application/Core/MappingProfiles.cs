using System.Linq;
using Application.Activities;
using Application.Comments;
using AutoMapper;
using Domain;

namespace Application.Core
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            string currentUsername = null;

            CreateMap<Activity, Activity>();

            CreateMap<Activity, ActivityDto>()
                .ForMember(destinationMember => destinationMember.HostUsername, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.Attendees
                        .FirstOrDefault(activityAttendee => activityAttendee.IsHost).AppUser.UserName));

            CreateMap<ActivityAttendee, AttendeeDto>()
                .ForMember(destinationMember => destinationMember.DisplayName, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.AppUser.DisplayName))
                .ForMember(destinationMember => destinationMember.Username, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.AppUser.UserName))
                .ForMember(destinationMember => destinationMember.Bio, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.AppUser.Bio))
                .ForMember(destinationMember => destinationMember.Image, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.AppUser.Photos
                        .FirstOrDefault(photo => photo.IsMain).Url))
                .ForMember(destinationMember => destinationMember.FollowersCount, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.AppUser.Followers.Count))
                .ForMember(destinationMember => destinationMember.FollowingCount, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.AppUser.Followings.Count))
                .ForMember(destinationMember => destinationMember.Following, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.AppUser.Followers
                        .Any(userFollowing => userFollowing.Observer.UserName == currentUsername)));

            CreateMap<AppUser, Profiles.Profile>()
                .ForMember(destinationMember => destinationMember.Image, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.Photos
                        .FirstOrDefault(photo => photo.IsMain).Url))
                .ForMember(destinationMember => destinationMember.FollowersCount, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.Followers.Count))
                .ForMember(destinationMember => destinationMember.FollowingCount, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.Followings.Count))
                .ForMember(destinationMember => destinationMember.Following, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.Followers
                        .Any(userFollowing => userFollowing.Observer.UserName == currentUsername)));

            CreateMap<Comment, CommentDto>()
                .ForMember(destinationMember => destinationMember.DisplayName, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.Author.DisplayName))
                .ForMember(destinationMember => destinationMember.Username, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.Author.UserName))
                .ForMember(destinationMember => destinationMember.Image, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.Author.Photos
                        .FirstOrDefault(photo => photo.IsMain).Url));
            
            CreateMap<ActivityAttendee, Profiles.ProfileActivityDto>()
                .ForMember(destination => destination.Id, options => options
                    .MapFrom(source => source.Activity.Id))
                .ForMember(destination => destination.Date, options => options
                    .MapFrom(source => source.Activity.Date))
                .ForMember(destination => destination.Title, options => options
                    .MapFrom(source => source.Activity.Title))
                .ForMember(destinationMember => destinationMember.Category, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.Activity.Category))
                .ForMember(destinationMember => destinationMember.HostUsername, memberOptions => memberOptions
                    .MapFrom(sourceMember => sourceMember.Activity.Attendees
                        .FirstOrDefault(activityAttendee => activityAttendee.IsHost).AppUser.UserName));
        }
    }
}