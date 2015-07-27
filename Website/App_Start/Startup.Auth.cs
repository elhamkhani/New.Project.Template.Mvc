using System;
using System.Text.RegularExpressions;
using System.Web;
using Domain;
using Microsoft.AspNet.Identity;
using Microsoft.Owin;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.Facebook;
using MSharp.Framework;
using MSharp.Owin.Authentication;
using Owin;

[assembly: OwinStartup(typeof(StartupAuth))]
public class StartupAuth
{
    public void Configuration(IAppBuilder app)
    {
        app.UseCookieAuthentication(new CookieAuthenticationOptions
        {
            AuthenticationType = DefaultAuthenticationTypes.ApplicationCookie,
            Provider = new CookieAuthenticationProvider()
        });

        app.UseExternalSignInCookie(DefaultAuthenticationTypes.ExternalCookie);

        RegisterExternalLoginCallback();

        EnableGoogle(app);

        EnableFacebook(app);
    }

    void RegisterExternalLoginCallback()
    {
        var provider = new MSharp.Owin.Authentication.OwinAuthenticaionProvider();
        provider.ExternalLoginAuthenticated += StartupAuth_ExternalLoginAuthenticated;
        UserServices.AuthenticationProvider = provider;
    }

    void EnableGoogle(IAppBuilder app)
    {
        // Step 1: Go to https://console.developers.google.com/ and create a new app.
        // Step 2: Inside your app go to 'APIs & auth > APIs' screen and enable "Google+ API" and "Google+ Domains API".
        // Step 3: Go to 'APIs & auth > Credentials' screen and set Redirect URLs to http://XXX/signin-google (XXX is your domain name).
        // Step 3: From same screen, copy Client Id and set it to web.config key 'Google.ClientId'
        // Step 4: Also copy Client Secret and set it to web.config key 'Google.clientSecret'
        app.UseGoogleAuthentication(
            clientId: Config.Get("Google.ClientId"),
            clientSecret: Config.Get("Google.clientSecret")
        );
    }

    void EnableFacebook(IAppBuilder app)
    {
        // Step 1: Go to https://developers.facebook.com/, and create a new app.
        // Step 2: Inside your app, go to Settings and set App Domains and Site URL to the root of your website e.g. http://myproject.uat.co
        // Step 3: Go to Apps Dashboard, copy App ID and set it to web.config key 'Facebook.AppID'
        // Step 4: From Apps Dashboard, copy App Secret and set it to web.config key 'Facebook.AppSecret'
        var options = new FacebookAuthenticationOptions()
        {
            AppId = Config.Get("Facebook.AppID"),
            AppSecret = Config.Get("Facebook.AppSecret")
        };
        options.Scope.Add("email");
        app.UseFacebookAuthentication(options);
    }

    void StartupAuth_ExternalLoginAuthenticated(object sender, ExternalLoginInfo e)
    {
        if (!e.IsAuthenticated)
        {
            HttpContext.Current.Response.Redirect("/Login"); return;
        }

        var user = User.FindByEmail(e.Email);
        var error = string.Empty; ;

        if (e.Email.IsNullOrEmpty())
        {
            error = "no-email";
        }
        else if (user == null)
        {
            error = "not-registered";

            // TODO: If in your project you want to register user as well the uncomment this line and comment the above one
            // user = CreateUser(e, user);
        }
        else if (user.IsDeactivated)
        {
            error = "deactivated";
        }

        if (error.HasValue())
        {
            HttpContext.Current.Response.Redirect("~/login?ReturnUrl=/login&email={0}&provider={1}&error={2}".FormatWith(e.Email, e.Issuer, error));
        }

        user.LogOn();

        HttpContext.Current.Response.Redirect("~/");
    }

    private static User CreateUser(ExternalLoginInfo e, User user)
    {
        var nameWithSpaces = Regex.Replace(e.UserName, @"((?<=\p{Ll})\p{Lu}|\p{Lu}(?=\p{Ll}))", " $1").Trim();
        var lastSpaceIndex = nameWithSpaces.LastIndexOf(' ');

        var firstName = nameWithSpaces.Substring(0, lastSpaceIndex);
        var lastName = nameWithSpaces.Substring(lastSpaceIndex);

        throw new NotImplementedException("Creating user is not implemented.");

        // EXAMPLE:

        //user = Database.Save(new MyUserType
        //{
        //    Email = e.Email,
        //    FirstName = firstName,
        //    LastName = lastName,
        //    Password = new Guid().ToString(),
        //    Salt = new Guid().ToString()
        //});
        //return user;
    }
}