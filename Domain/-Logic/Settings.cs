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
    /// Provides the business logic for Settings class.
    /// </summary>
    partial class Settings
    {
        /// <summary>
        /// Validates this instance to ensure it can be saved in a data repository.
        /// If this finds an issue, it throws a ValidationException for that.        
        /// This calls ValidateProperties(). Override this method to provide custom validation logic in a type.
        /// </summary>
        public override void Validate()
        {
            base.Validate();

            if (IsNew && Database.Any<Settings>())
                throw new Exception("Settings is Singleton!");
        }
    }
}