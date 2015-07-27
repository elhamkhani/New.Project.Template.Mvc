using System.Web.Mvc;

public class AppViewEngine : RazorViewEngine
{
    public AppViewEngine()
    {
        // {0} means view name
        // {1} means controller name

        PartialViewLocationFormats = new[] { "~/Views/Modules/{0}.cshtml", "~/Views/Layouts/{0}.cshtml" };

        ViewLocationFormats = new[] { 
            "~/Views/Modules/{0}.cshtml",
            "~/Views/Pages/{1}.cshtml",
            "~/Views/Modules/{1}.cshtml" };
    }
}
