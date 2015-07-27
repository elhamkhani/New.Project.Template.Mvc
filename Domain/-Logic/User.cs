namespace Domain
{
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using System.Linq;
    using System.Security.Principal;
    using MSharp.Framework;
    using MSharp.Framework.Services;

    partial class User : IUser, IPrincipal, IIdentity
    {
        /// <summary>
        /// Gets the roles of this user.
        /// </summary>
        public virtual IEnumerable<string> GetRoles()
        {
            if (System.Web.HttpContext.Current.Request.IsLocal) yield return "Local.Request";

            yield return "User";
        }

        protected override void OnValidating(EventArgs e)
        {
            base.OnValidating(e);

            if (Salt.IsEmpty()) Salt = Guid.NewGuid().ToString();
        }

        #region IPrincipal
        IIdentity IPrincipal.Identity { get { return this; } }

        public bool IsInRole(string role) { return GetRoles().Contains(role); }

        string IIdentity.AuthenticationType { get { return "ApplicationAuthentication"; } }

        bool IIdentity.IsAuthenticated { get { return true; } }

        string IIdentity.Name { get { return ID.ToString(); } }
        #endregion
    }
}