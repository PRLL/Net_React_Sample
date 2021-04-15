using System;
using System.Text.Json.Serialization;

namespace Application.Profiles
{
    public class ProfileActivityDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Category { get; set; }
        public DateTime Date { get; set; }

        [JsonIgnore] // if used this property can be used to help on the class but not sent to client
        public string HostUsername { get; set; }
    }
}