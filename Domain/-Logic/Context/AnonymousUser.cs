namespace Domain
{
    using System.Collections.Generic;
    using MSharp.Framework;

    [TransientEntity]
    public class AnonymousUser : User
    {
        public override string ToString()
        {
            return "Anonymous";
        }

        public override IEnumerable<string> GetRoles()
        {
            if (System.Web.HttpContext.Current.Request.IsLocal) yield return "Local.Request";

            yield return "Anonymous";
        }
    }
}