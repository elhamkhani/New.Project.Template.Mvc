namespace Domain
{
    using System;
    using System.Collections;
    using System.Linq;
    using System.Collections.Generic;
    using System.Text;
    using MSharp.Framework;
    using MSharp.Framework.Data;
    using MSharp.Framework.Services;

    /// <summary>
    /// Provides the business logic for Administrator class.
    /// </summary>
    partial class Administrator : IImpersonator
    {
        /// <summary>
        /// Gets the roles of this user.
        /// </summary>
        public override IEnumerable<string> GetRoles()
        {
            return base.GetRoles().Concat("Administrator");
        }


        public bool CanImpersonate(IUser user)
        {
            return true;
        }
    }
}