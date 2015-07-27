public class BaseView<TModel> : System.Web.Mvc.WebViewPage<TModel>
{
    public override void Execute() { }

    /// <summary>
    /// Gets the user security information for the current HTTP request.
    /// </summary>
    public new Domain.User User { get { return base.User as Domain.User; } }

    /// <summary>
    /// Gets the View Model instance to provide a consistent API to gain access to the ViewModel object from controller and View.
    /// </summary>
    protected TModel info { get { return Model; } }
}