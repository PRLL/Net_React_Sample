using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace Infrastructure.Email
{
    public class EmailSender
    {
        private readonly IConfiguration _configuration;
        public EmailSender(IConfiguration configuration)
        {
            this._configuration = configuration;
        }

        public async Task SendEmailAsync(string userEmail, string emailSubject, string emailMessage)
        {
            var client = new SendGridClient(this._configuration["SendGrid:Key"]);
            var message = new SendGridMessage
            {
                From = new EmailAddress("joselidamagi@hotmail.com", this._configuration["SendGrid:User"]),
                Subject = emailSubject,
                PlainTextContent = emailMessage,
                HtmlContent = emailMessage
            };
            message.AddTo(new EmailAddress(userEmail));
            message.SetClickTracking(false, false);

            await client.SendEmailAsync(message);
        }
    }
}