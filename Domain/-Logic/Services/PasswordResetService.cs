namespace Domain
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;
    using System.Web;
    using MSharp.Framework;
    using MSharp.Framework.UI;

    public class PasswordResetService
    {
        User User;
        PasswordResetTicket Ticket;

        PasswordResetService(User user)
        {
            this.User = user;
        }

        /// <summary>
        /// Creates a new Password Reset Ticket for the specified user.
        /// </summary>
        public static void RequestTicket(User user)
        {
            var service = new PasswordResetService(user);

            using (var scope = Database.CreateTransactionScope())
            {
                service.CreateTicket();
                service.SendEmail();
                scope.Complete();
            }
        }

        /// <summary>
        /// Completes the password recovery process.
        /// </summary>
        public static void Complete(PasswordResetTicket ticket, string newPassword)
        {
            if (newPassword.IsEmpty()) throw new ArgumentNullException("newPassword");

            if (ticket.IsExpired)
                throw new ValidationException("This ticket has expired. Please request a new ticket.");

            if (ticket.IsUsed) throw new ValidationException("This ticket has been used once. Please request a new ticket.");

            var service = new PasswordResetService(ticket.User);

            using (var scope = Database.CreateTransactionScope())
            {
                service.UpdatePassword(newPassword);
                Database.Update(ticket, t => t.IsUsed = true);

                scope.Complete();
            }
        }

        void CreateTicket()
        {
            Ticket = new PasswordResetTicket { User = User };
            Database.Save(Ticket);
        }

        void SendEmail()
        {
            EmailTemplate.RecoverPassword.Send(User, new
            {
                UserId = User.Name,
                Link = "<a href='{0}'> Reset Your Password </a>".FormatWith(GetResetPasswordUrl()),
            });
        }

        string GetResetPasswordUrl()
        {
            return HttpContext.Current.Request.GetAbsoluteUrl("/password/reset/" + Ticket.ID);
        }

        void UpdatePassword(string newPassword)
        {
            Database.Update(User, u => u.Password = newPassword.Trim().CreateHash(u.Salt));
        }
    }
}
