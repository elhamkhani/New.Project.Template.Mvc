class ApplicationPage extends BaseApplicationPage {

    constructor() {
        super();
    }

    initialize() {

        super.initialize();

        // This function is called upon every Ajax update as well as the initial page load.
        // Any custom initiation goes here. 
    }

    // Here you can override any of the base standard functions.
    // e.g: To use a different AutoComplete library, simply override handleAutoComplete(input).
}

// Create singleton instance:
declare var page: ApplicationPage;
page = new ApplicationPage();
