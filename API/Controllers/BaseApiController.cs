using Application.Core;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BaseApiController : ControllerBase
    {
        private IMediator _mediator;

        protected IMediator Mediator => this._mediator ??= HttpContext.RequestServices.GetService<IMediator>();

        protected ActionResult HandleResult<T>(Result<T> result)
        {
            return  result == null 
                ? NotFound()
                : result.IsSucces
                    ? result.Value == null
                        ? NotFound()
                        : Ok(result.Value)
                    : BadRequest(result.Error);
        }
    }
}