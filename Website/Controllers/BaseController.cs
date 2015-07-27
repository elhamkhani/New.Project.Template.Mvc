namespace Controllers
{
    using System.Web.Mvc;
    using System.Web.SessionState;

    [SessionState(SessionStateBehavior.Disabled)]
    public class BaseController : MSharp.Framework.Mvc.Controller
    {
        /// <summary>
        /// Gets the user security information for the current HTTP request.
        /// </summary>
        public new Domain.User User { get { return base.User as Domain.User; } }
    }
}