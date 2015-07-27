namespace Domain
{
    using System;
    using System.Linq;
    using System.Collections.Generic;
    using MSharp.Framework;
    using MSharp.Framework.Services;
    using System.Web;

    /// <summary>
    /// Provides the business logic for EmailTemplate class.
    /// </summary>
    partial class EmailTemplate : IEmailTemplate
    {
        /// <summary>
        /// Validates this instance to ensure it can be saved in a data repository.
        /// If this finds an issue, it throws a ValidationException for that.
        /// This calls ValidateProperties(). Override this method to provide custom validation logic in a type.
        /// </summary>
        public override void Validate()
        {
            base.Validate();

            this.EnsurePlaceholders();
        }

        /// <summary>
        /// Sends an email to the specified user using this template and the merge data provided.
        /// </summary>
        public void Send(User toUser, object mergeData, Action<EmailQueueItem> customise = null)
        {
            Send(toUser.Email, mergeData, customise);
        }

        /// <summary>
        /// Sends an email to the specified email(s) using this template and the merge data provided.
        /// Use comma to separate multiple emails.
        /// </summary>
        public void Send(string to, object mergeData, Action<EmailQueueItem> customise = null)
        {
            if (mergeData == null) throw new ArgumentNullException("mergeData");
            if (to.IsEmpty()) throw new ArgumentNullException("to");

            var message = new EmailQueueItem
            {
                Html = true,
                Subject = this.MergeSubject(mergeData),
                Body = this.MergeBody(mergeData),
                To = to,
            };

            if (customise != null) customise(message);

            Database.Save(message);
        }
    }
}