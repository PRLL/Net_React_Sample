using System;
using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Persistence
{
    public class DataContext : IdentityDbContext<AppUser>
    {
        public DataContext(DbContextOptions options) : base(options)
        {
            //
        }

        public DbSet<Activity> Activities { get; set; }
        public DbSet<ActivityAttendee> ActivityAttendees { get; set; }
        public DbSet<Photo> Photos { get; set; }
        public DbSet<Comment> Comments { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ActivityAttendee>(x => x.HasKey(activityAttendee => new { activityAttendee.AppUserId, activityAttendee.ActivityId }));

            builder.Entity<ActivityAttendee>()
                .HasOne(activityAttendee => activityAttendee.AppUser)
                .WithMany(activities => activities.Activities)
                .HasForeignKey(activityAttendee => activityAttendee.AppUserId);

            builder.Entity<ActivityAttendee>()
                .HasOne(activityAttendee => activityAttendee.Activity)
                .WithMany(activities => activities.Attendees)
                .HasForeignKey(activityAttendee => activityAttendee.ActivityId);

            builder.Entity<Comment>()
                .HasOne(comment => comment.Activity)
                .WithMany(activity => activity.Comments)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
