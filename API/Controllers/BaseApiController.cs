using API.Extensions;
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

        protected ActionResult HandlePageResult<T>(Result<PagedList<T>> result)
        {
            return  result == null 
                ? NotFound()
                : result.IsSucces
                    ? result.Value == null
                        ? NotFound()
                        : okResult<T>(result)
                    : BadRequest(result.Error);
        }

        private ActionResult okResult<T>(Result<PagedList<T>> result)
        {
            Response.AddPaginationHeader(result.Value.CurrentPage, result.Value.PageSize, result.Value.TotalCount, result.Value.TotalPages);
            return Ok(result.Value);
        }
    }
}