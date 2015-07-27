using System;
using System.Web.Mvc;
using MSharp.Framework;

[AttributeUsage(AttributeTargets.All, Inherited = true)]
public class HandleApplicationErrorAttribute : System.Web.Mvc.HandleErrorAttribute
{
    public override void OnException(ExceptionContext context)
    {
        base.OnException(context);
        Log.Error(context.Exception);
    }
}