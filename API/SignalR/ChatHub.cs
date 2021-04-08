using System;
using System.Threading.Tasks;
using Application.Comments;
using MediatR;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    public class ChatHub : Hub
    {
        private readonly IMediator _mediator;
        public ChatHub(IMediator mediator)
        {
            this._mediator = mediator;
        }

        public async Task SendComment(Create.Command command)
        {
            var comment = await this._mediator.Send(command);

            await Clients
                .Group(command.ActivityId.ToString())
                .SendAsync("ReceiveComment", comment.Value);
        }

        public override async Task OnConnectedAsync()
        {
            var ActivityId = Context.GetHttpContext().Request.Query["activityId"];

            await Groups.AddToGroupAsync(Context.ConnectionId, ActivityId);

            await Clients.Caller.SendAsync("LoadComments",
                (await this._mediator.Send(new List.Query{ ActivityId = Guid.Parse(ActivityId) })).Value);
        }
    }
}