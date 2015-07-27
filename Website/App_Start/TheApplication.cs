using System.Security.Principal;
using System.Web.Mvc;
using System.Web.Routing;
using Domain;

public class TheApplication : MSharp.Framework.Mvc.HttpApplication
{
    protected override void Application_Start()
    {
        base.Application_Start();

        ViewEngines.Engines.Add(new AppViewEngine());
        GlobalFilters.Filters.Add(new HandleApplicationErrorAttribute());

        // TODO: Uncomment this line to get Automated Tasks to work.
        // TaskManager.Run();
    }

    protected override IPrincipal RetrieveActualUser(IPrincipal principal)
    {
        return base.RetrieveActualUser<User, AnonymousUser>(principal);
    }
}