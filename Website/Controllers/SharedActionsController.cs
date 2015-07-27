namespace Controllers
{
    using System.ComponentModel;
    using System.Web.Mvc;
    using MSharp.Framework;
    using MSharp.Framework.Mvc;

    public class SharedActionsController : BaseController
    {
        [Route("")]
        public ActionResult Login()
        {
            // For the website root level request
            return Redirect("/Login");
        }

        [Route("error")]
        public ActionResult Error()
        {
            return View("error");
        }

        [Route("error/404")]
        public ViewResult NotFound()
        {
            return View("error-404");
        }

        [HttpPost, Route("file/upload")]
        [Authorize] // TODO: Add further security.
        [EditorBrowsable(EditorBrowsableState.Never)]
        public ActionResult UploadTempFileToServer()
        {
            if (Document.HasUnsafeFileExtension(Request.Files[0].FileName))
                return Json(new { Error = "Invalid file extension." });

            return Json(new FileUploadService().TempSaveUploadedFile(Request));
        }

        [Route("file/download")]
        [EditorBrowsable(EditorBrowsableState.Never)]
        public ActionResult DownloadSecureFile()
        {
            var path = Request.Url.Query.TrimStart('?');

            var accessor = new SecureFileAccessor(path, User);

            if (!accessor.IsAllowed())
            {
                return new HttpUnauthorizedResult(accessor.SecurityErrors);
            }

            return File(accessor.GetFile());
        }
    }
}

