/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/jquery/jquery.validation.d.ts" />
/// <reference path="../typings/alertify/alertify.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />
/// <reference path="../typings/missingdefinitions.d.ts" />

// For ckeditor plug-ins to work, this should be globally defined.
var CKEDITOR_BASEPATH = '/bower_components/ckeditor/';

class BaseApplicationPage {

    // formats: http://momentjs.com/docs/#/displaying/format/
    DATE_FORMAT = "DD/MM/YYYY";
    TIME_FORMAT = "HH:mm";
    DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";
    MINUTE_INTERVALS = 5;

    /* Possible values: Compact | Medium | Advance | Full
       To customise modes, change '/Scripts/Lib/ckeditor_config.js' file
       */
    DEFAULT_HTML_EDITOR_MODE = "Medium";

    constructor() {
        $(() => {
            this.enableAlert();
            this.configureValidation();
            this.initialize();
            this.runStartupActions();
        });
    }

    _initializeActions = [];
    onInit(action) {
        this._initializeActions.push(action);
    }

    initialize() {
        
        // =================== Request lifecycle ====================
        $('form[method=get]').off("submit.clean-up").on("submit.clean-up",(e) => this.cleanGetFormSubmit(e));
        $("[formaction]").not("[formmethod=post]").off("click.formaction").on("click.formaction",(e) => this.invokeActionWithAjax(e, $(e.currentTarget).attr("formaction")));
        $("[formaction][formmethod=post]").off("click.formaction").on("click.formaction",(e) => this.invokeActionWithPost(e));
        $("[data-change-action]").off("change.data-action").on("change.data-action",(e) => this.invokeActionWithAjax(e, $(e.currentTarget).attr("data-change-action")));
        
        // =================== Plug-ins ====================
        $("input[autocomplete-source]").each((i, e) => this.handleAutoComplete($(e)));
        $("[data-control=date-picker],[data-control=calendar]").each((i, e) => this.enableDateControl($(e)));
        $("[data-control='date-picker|time-picker']").each((i, e) => this.enableDateAndTimeControl($(e)));
        $("[data-control=time-picker]").each((i, e) => this.enableTimeControl($(e)));
        $("[data-control=date-drop-downs]").each((i, e) => this.enableDateDropdown($(e)));
        $("[data-control=html-editor]").each((i, e) => this.enableHtmlEditor($(e)));
        $("[data-control=numeric-up-down]").each((i, e) => this.enableNumericUpDown($(e)));
        $("[data-control=collapsable-checkboxes]").each((i, e) => this.enableCollapsableCheckboxes($(e)));
        $(".file-upload input:file").each((i, e) => this.enableFileUpload($(e)));
        $("[data-confirm-question]").each((i, e) => this.enableConfirmQuestion($(e)));
        $(".password-strength").each((i, e) => this.enablePasswordStengthMeter($(e)));

        // =================== Standard Features ====================
        $("[data-delete-subform]").off("click.delete-subform").on("click.delete-subform",(e) => this.deleteSubForm(e));
        $("[target='$modal'][href]").off("click.open-modal").on("click.open-modal",(e) => this.openLinkModal(e));
        $(".select-grid-cols .group-control").each((i, e) => this.enableSelectColumns($(e)));
        $("[name=InstantSearch]").each((i, e) => this.enableInstantSearch($(e)));
        $("th.select-all > input:checkbox").off("click.select-all").on("click.select-all",(e) => this.enableSelectAllToggle(e));
        $("[data-user-help]").each((i, e) => this.enableUserHelp($(e)));
        $("form input, form select").off("keypress.default-button").on("keypress.default-button",(e) => this.handleDefaultButton(e));
        $('[autofocus]visible:first').focus();
        $("form[method=get] .pagination-size select[name=p]").off("change.pagination-size").on("change.pagination-size",(e) => this.paginationSizeChanged(e));
        $.validator.unobtrusive.parse('form');
        $("[data-sort-item]").parents("tbody").each((i, e) => this.enableDragSort($(e)));

        this.updateSubFormStates();

        this._initializeActions.forEach((action) => action());
    }

    enableDragSort(container) {

        var items = container.is("tbody") ? "> tr" : "> li"; // TODO: Do we need to support any other markup?
        
        container.sortable({
            handle: '[data-sort-item]',
            items: items,
            axis: 'y',
            helper: (e, ui) => {
                // prevent TD collapse during drag
                ui.children().each((i, c) => $(c).width($(c).width()));
                return ui;
            },
            stop: (e, ui) => {

                var dropBefore = ui.item.next().find("[data-sort-item]").attr("data-sort-item") || "";

                var handle = ui.item.find("[data-sort-item]");

                var actionUrl = handle.attr("data-sort-action");
                actionUrl = urlHelper.addQuery(actionUrl, "drop-before", dropBefore);

                this.invokeActionWithAjax({ currentTarget: handle.get(0) }, actionUrl);
            }
        });
    }

    enablePasswordStengthMeter(container: any) {
        // for configuration options : https://github.com/ablanco/jquery.pwstrength.bootstrap/blob/master/OPTIONS.md

        var formGroup = container.closest(".form-group");

        var options = {
            common: {},
            rules: {},
            ui: {
                container: formGroup,
                showVerdictsInsideProgressBar: true,
                showStatus: true,
                showPopover: false,
                showErrors: false,
                viewports: {
                    progress: container
                },
                verdicts: [
                    "<span class='fa fa-exclamation-triangle'></span> Weak",
                    "<span class='fa fa-exclamation-triangle'></span> Normal",
                    "Medium",
                    "<span class='fa fa-thumbs-up'></span> Strong",
                    "<span class='fa fa-thumbs-up'></span> Very Strong"],
            }
        };

        var password = formGroup.find(":password");
        if (password.length == 0) {
            console.error('Error: no password field found for password strength.');
            console.log(container);
        }
        else password.pwstrength(options);
    }

    configureValidation() {
        var methods: any = $.validator.methods;

        var format = this.DATE_FORMAT;

        methods.date = function (value, element) {
            if (this.optional(element)) return true;
            return moment(value, format).isValid();
        }

        // TODO: datetime, time
    }

    updateSubFormStates() {

        var countItems = (element) => $(element).parent().find(".subform-item:visible").length;

        // hide empty headers
        $(".horizontal-subform thead").each((i, e) => {
            $(e).css('visibility',(countItems(e) > 0) ? 'visible' : 'hidden');
        });

        // Hide add buttons
        $("[data-subform-max]").each((i, e) => {
            var show = countItems(e) < parseInt($(e).attr('data-subform-max'));
            $("[data-add-subform=" + $(e).attr("data-subform") + "]").toggle(show);
        });

        // Hide delete buttons
        $("[data-subform-min]").each((i, e) => {
            var show = countItems(e) > parseInt($(e).attr('data-subform-min'));
            $("[data-delete-subform=" + $(e).attr("data-subform") + "]").css('visibility',(show) ? 'visible' : 'hidden');
        });
    }

    enableDateDropdown(input) {
        // TODO: Implement
    }

    enableSelectAllToggle(event) {
        var trigger = $(event.currentTarget);
        trigger.closest("table").find("td.select-row > input:checkbox").prop('checked', trigger.is(":checked"));
    }

    enableInstantSearch(control) {
        // TODO: Make it work with List render mode too.

        control.off("keyup.immediate-filter").on("keyup.immediate-filter",(event) => {

            var keywords = control.val().toLowerCase().split(' ');

            var rows = control.closest('[data-module]').find(".grid > tbody > tr");

            rows.each((index, e) => {
                var row = $(e);
                var content = row.text().toLowerCase();
                var hasAllKeywords = keywords.filter((i) => content.indexOf(i) == -1).length == 0;
                if (hasAllKeywords) row.show(); else row.hide();
            });

        });

        control.on("keydown", e=> {
            if (e.keyCode == 13) e.preventDefault();
        });
    }

    validateForm(trigger) {

        if (trigger.is("[formnovalidate]")) return true;

        var form = trigger.closest("form");

        var validator = form.validate();
        if (!validator.form()) {

            var alertUntyped: any = alert;

            if (form.is("[data-validation-style*=message-box]"))
                alertUntyped(validator.errorList.map(err => err.message).join('\r\n'),() => { setTimeout(() => validator.focusInvalid(), 0); });

            validator.focusInvalid();
            return false;
        }

        return true;
    }

    enableConfirmQuestion(button) {

        button.off("click.confirm-question").bindFirst("click.confirm-question",(e) => {
            e.stopImmediatePropagation();                        
            //return false;
            this.showConfirm(button.attr('data-confirm-question'),() => {
                button.off("click.confirm-question");
                button.trigger('click');
                this.enableConfirmQuestion(button);
            });
            return false;
        });
    }

    showConfirm(text, yesCallback) {
        alertify.confirm(text.replace(/\r/g, "<br />"),(e) => {
            if (e) yesCallback();
            else return false;
        });
    }


    enableHtmlEditor(input: any) {

    // TODO: Support configurations http://peterkeating.co.uk/using-ckeditor-with-razor-for-net-mvc3/
    $.getScript(CKEDITOR_BASEPATH + "ckeditor.js",() => {
        $.getScript(CKEDITOR_BASEPATH + "adapters/jquery.js",() => {
            CKEDITOR.config.contentsCss = CKEDITOR_BASEPATH + 'contents.css';
            var editor = CKEDITOR.replace($(input).attr('id'),
                {
                    toolbar: $(input).attr('data-toolbar') || this.DEFAULT_HTML_EDITOR_MODE,
                    customConfig: '/Scripts/Lib/ckeditor_config.js'
                });

            editor.on('change', function (evt) {
                evt.editor.updateElement();
            });
        });
    });
}

    enableAlert() {
        var w: any = window;
        w.alert = (text: string, callback) => {
            if (text == undefined) text = "";

            text = text.trim();

            if (text.indexOf("<") != 0) {
                text = text.replace(/\r/g, "<br />");
                alertify.alert(text, callback);
            }
            else {
                alertify.alert('', callback);
                $('.alertify-message').empty().append($.parseHTML(text));
            }
        };
    }

    enableNumericUpDown(input: any) {
        var min = input.attr("data-val-range-min");
        var max = input.attr("data-val-range-max");
        input.spinedit({
            minimum: parseInt(min),
            maximum: parseInt(max),
            step: 1,
        });
    }

    enableCollapsableCheckboxes(input: any) {
        // TODO: create a jquery Extention so we can call it like: input.collapsible();

        new CollapsibleCheckBoxes(input);
    }

    enableFileUpload(input: any) {

        input.attr("data-url", "/file/upload");
        var container: JQuery = input.closest(".file-upload");
        var del = container.find(".delete-file");
        var current = container.find(".current-file");
        var idInput = container.find("input.file-id");
        var progressBar = container.find(".progress-bar");

        // TODO: Hide the default UI and replace with a button:
        // See http://markusslima.github.io/bootstrap-filestyle/ or https://blueimp.github.io/jQuery-File-Upload/
        //input.css('position', "absolute");
        //var button = input.after("<label class='btn' style='position:absolute;'>Upload...</label>");
        
        del.click((e) => { current.hide(); del.hide(); idInput.val("REMOVE"); progressBar.width(0); });

        input.fileupload({
            dataType: 'json',
            progressall: (e, data: any) => {
                var progress = parseInt((data.loaded / data.total * 100).toString(), 10);
                progressBar.width(progress + '%');
            },
            error: this.handleAjaxResponseError,
            done: (e, data) => {
                idInput.val("file:" + data.result.ID);
                current.text(data.result.Name).show();
                del.show();
            }
        });
    }

    openLinkModal(event: JQueryEventObject) {

        var target = $(event.currentTarget);
        var url = target.attr("href");

        var modalOptions = {};

        var options = target.attr("data-modal-options");
        if (options) modalOptions = this.toJson(options);

        this.openModal(url, modalOptions);

        return false;
    }

    toJson(data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            console.log(error);
            console.log('Cannot parse this data to Json: ');
            console.log(data);
        }
    }

    runStartupActions(container: JQuery = null, trigger: any = null) {
        if (container == null) container = $(document);
        if (trigger == null) trigger = $(document);

        var actions = $("input[name='Startup.Actions']", container).val();

        if (actions)
            this.executeActions(this.toJson(actions), trigger);
    }

    enableDateControl(input: any) {

        var control = input.attr("data-control");
        var viewMode = input.attr("data-view-mode") || 'days'

        if (control == "date-picker") {
            input.datetimepicker({
                format: this.DATE_FORMAT,
                useCurrent: false,
                showTodayButton: true,
                icons: { today: 'today' },
                viewMode: viewMode,
                keepInvalid: true
            }).data("DateTimePicker").keyBinds().clear = null; 

            // Now make calendar icon clickable as well 
            input.parent().find(".fa-calendar").click(function () { input.focus(); });
        }
        else alert("Don't know how to handle date control of " + control);
    }

    enableDateAndTimeControl(input: any) {
        input.datetimepicker({
            format: this.DATE_TIME_FORMAT,
            useCurrent: false,
            showTodayButton: true,
            icons: { today: 'today' },
            stepping: parseInt(input.attr("data-minute-steps") || this.MINUTE_INTERVALS.toString()),
            keepInvalid: true
        }).data("DateTimePicker").keyBinds().clear = null;

        input.parent().find(".fa-calendar").click(function () { input.focus(); });
    }

    enableTimeControl(input: any) {
        input.datetimepicker({
            format: this.TIME_FORMAT,
            useCurrent: false,
            stepping: parseInt(input.attr("data-minute-steps") || this.MINUTE_INTERVALS.toString()),
            keepInvalid: true
        }).data("DateTimePicker").keyBinds().clear = null;

        input.parent().find(".fa-time").click(function () { input.focus(); });
    }

    handleAutoComplete(input) {
        if (input.is('[data-typeahead-enabled=true')) return;
        else input.attr('data-typeahead-enabled', true);

        var valueField = $("[name='" + input.attr("name").slice(0, -5) + "']");

        if (valueField.length == 0) console.log('Could not find the value field for auto-complete.');

        var dataSource = (query, callback) => {
            var url = input.attr("autocomplete-source");
            url = urlHelper.removeQuery(url, input.attr('name')); // Remove old text.
            var data = this.getPostData(input);

            $.post(url, data).fail(this.handleAjaxResponseError).done((result) => {

                result = result.map((i) => {
                    return {
                        Display: i.Display || i.Text || i.Value,
                        Value: i.Value || i.Text || i.Display,
                        Text: i.Text || $("<div/>").append($(i.Display)).text() || i.Value
                    };
                });

                return callback(result);
            });
        };

        var clearValue = (e) => { if (input.val() !== input.data("selected-text")) valueField.val(''); };

        var itemSelected = (e, item) => {
            input.off('change, keydown').data("selected-text", item.Display);
            valueField.val(item.Value);
            input.on('change, keydown', clearValue);
        };

        var dataset = {
            displayKey: 'Text', source: dataSource,
            templates: { suggestion: (item) => item.Display, empty: "<div class='tt-suggestion'>Not found</div>" }
        };

        input.on('change, keydown', clearValue).on('typeahead:selected', itemSelected).typeahead({ minLength: 0 }, dataset);
    }

    handleDefaultButton(event: JQueryEventObject): boolean {
        if (event.which === 13) {
            var target = $(event.currentTarget);
            var button = target.closest("[data-module]").find('[default-button]:first'); // Same module
            if (button.length == 0) button = $('[default-button]:first') // anywhere
            button.click();
            return false;
        } else return true;
    }

    deleteSubForm(event: JQueryEventObject) {
        var button = $(event.currentTarget);
        var container = button.parents(".subform-item");
        container.find("input[name*=MustBeDeleted]").val("true");
        container.hide();

        this.updateSubFormStates();
    }

    cleanGetFormSubmit(event: JQueryEventObject) {

        var form = $(event.currentTarget);
        var formData = form.serialize();

        var url = urlHelper.removeEmptyQueries(form.attr('action'));

        var actualData: string = urlHelper.mergeQueries(formData);

        actualData = urlHelper.arrayToQuery(urlHelper.queryToArray(actualData).filter((x) => x.__RequestVerificationToken == undefined));

        var items = actualData.split('&');

        try {

            form.find("input:checkbox:unchecked").each((i, e) => url = urlHelper.removeQuery(url, $(e).attr('name')));

            for (var i in items) {
                var key = items[i].split('=')[0];
                var val = items[i].split('=')[1];
                url = urlHelper.updateQuery(url, key, val);
            }

            url = urlHelper.removeEmptyQueries(url);

            window.location.href = url;
        }
        catch (error) {
            console.log(error);
            alert(error);
        }
        return false;
    }

    enableUserHelp(element: JQuery) {

        element.click(() => false);
        var message = element.attr('data-user-help');  // todo: unescape message and conver to html

        element['popover']({ trigger: 'focus', content: message });
    }

    executeActions(actions: any, trigger) {

        for (var i in actions) {
            var action = actions[i];
            if (action.Notify || action.Notify == "") alert(action.Notify);
            else if (action.Script) eval(action.Script);
            else if (action.BrowserAction == "Back") window.history.back();
            else if (action.BrowserAction == "CloseModal") this.closeModal();
            else if (action.BrowserAction == "CloseModalRefreshParent") this.closeModal(true);
            else if (action.BrowserAction == "Close") window.close();
            else if (action.BrowserAction == "Refresh") location.reload();
            else if (action.BrowserAction == "Print") window.print();
            else if (action.BrowserAction == "ShowPleaseWait") this.showPleaseWait(action.BlockScreen);
            else if (action.Redirect) {
                if (action.Redirect.indexOf('/') != 0 && action.Redirect.indexOf('http') != 0) action.Redirect = '/' + action.Redirect;

                if (action.Target == '$modal') this.openModal(action.Redirect, {});
                else if (action.Target && action.Target != '') window.open(action.Redirect, action.Target);
                else window.location.replace(action.Redirect);
            }
            else {
                alert("Don't know how to handle: " + urlHelper.htmlEncode(JSON.stringify(actions)));
                return;
            }
        }
    }

    showPleaseWait(blockScreen) {

        if (blockScreen) {
            // TODO: Clean up
            var cover = $("<div class='modal-cover'>&nbsp;</div>");
            cover.width(Math.max($(document).width(), $(window).width()));
            cover.height(Math.max($(document).height(), $(window).height()));
            cover.css("display", "block");

            $("body").append(cover);
        }

        var img = $("<img style='position:fixed; left:0; top:0; display:none; margin:20% 42%; z-index:10000;' src='/public/img/waiting.gif' class='please-wait' />");
        $("body").append(img);
        img.fadeIn('slow');
    }

    currentModal: any = null;
    openModal(url: string, options: any) {

        if (this.currentModal != null) this.closeModal();

        this.currentModal = $("<div class='modal fade' id='myModal' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'\
 aria-hidden='true'>\
            <div class='modal-dialog'>\
    <div class='modal-content'>\
    <div class='modal-header'>\
        <button type='button' class='close' data-dismiss='modal' aria-label='Close'>\
            <i class='fa fa-times-circle'></i>\
        </button>\
    </div>\
    <div class='modal-body'>\
        <div class='row text-center'><i class='fa fa-spinner fa-spin fa-2x'></i></div>\
        <iframe style='width:100%; height:100%; border:0;'></iframe>\
    </div>\
</div></div></div>");

        var frame = this.currentModal.find("iframe");

        frame.attr("src", url).on("load",(e) => {
            var doc = frame.get(0).contentWindow.document;

            setTimeout(() => frame.height(doc.body.offsetHeight), 10); // Timeout is used due to an IE bug.
            this.currentModal.find(".modal-body .text-center").remove();
        });

        this.currentModal.appendTo("body").modal('show');
    }

    closeModal(refreshParent = false) {
        if (this.currentModal) {
            this.currentModal.modal('hide');
            if (refreshParent) window.location.reload();
            this.currentModal = null;
        }
        else if (window.parent) {
            var p: any = window.parent;
            if (p.page) p.page.closeModal(refreshParent);
        }
    }



    getPostData(trigger: JQuery) {

        var form = trigger.closest("[data-module]");

        if (!form.is("form")) {
            form = $("<form />").append(form.clone());
        }

        //var form = trigger.closest("form");

        var data = urlHelper.mergeQueries(form.serialize());

        // data = urlHelper.removeEmptyPostItems(data);

       
        // If it's master-details, then we need the index.
        var subFormContainer = trigger.closest(".subform-item");
        if (subFormContainer != null) {
            if (data.length > 1) data += "&";
            data += "subFormIndex=" + subFormContainer.closest(".horizontal-subform, .vertical-subform").find(".subform-item").index(subFormContainer);
        }

        data += "&current.request.url=" + encodeURIComponent(urlHelper.pathAndQuery());

        return data;
    }

    invokeActionWithAjax(event, actionUrl) {

        var trigger = $(event.currentTarget);
        var containerModule = trigger.closest("[data-module]");

        if (this.validateForm(trigger) == false) return false;

        var data = this.getPostData(trigger);

        $.ajax({
            url: actionUrl,
            method: trigger.attr("data-ajax-method") || 'POST',
            data: data,
            success: (result) => { this.invokeAjaxActionResult(result, containerModule, trigger); },
            error: this.handleAjaxResponseError
        });

        return false;
    }

    enableSelectColumns(container) {
        var columns = container.find("div.select-cols");
        container.find("a.select-cols").click(() => columns.show());
        columns.find('.cancel').click(() => columns.hide());
    }

    invokeActionWithPost(event) {

        var trigger = $(event.currentTarget);
        var containerModule = trigger.closest("[data-module]");

        if (containerModule.is("form") && this.validateForm(trigger) == false) return false;

        var data = this.getPostData(trigger);

        var url = trigger.attr("formaction");

        var form = $("<form method='post' />").hide().attr("action", url).appendTo($("body"));

        var params = urlHelper.queryToArray(data);

        for (var index in params) {
            var formParameter = params[index];

            for (var name in formParameter)
                $("<input type='hidden'/>").attr("name", name).val(formParameter[name]).appendTo(form);
        }

        form.submit();
        return false;
    }

    handleAjaxResponseError(response) {

        console.log(response);

        var text = response.responseText;

        if (text.indexOf("<html") > -1) {
            document.write(text);
        }
        else if (text.indexOf("<form") > -1) {
            var form = $("form", document);
            if (form.length) form.replaceWith($(text));
            else document.write(text);
        }
        else alert(text);
    }

    invokeAjaxActionResult(response, containerModule, trigger) {

        var asElement = $(response);

        if (asElement.is("[data-module]")) {
            containerModule.replaceWith(asElement);
            this.runStartupActions(asElement, trigger);
            // TODO: Support specifying the module to be updated at the Action level.
        }
        else if (response.length == 1 && response[0].ReplaceView) {
            asElement = $("<div/>").append(response[0].ReplaceView);
            containerModule.replaceWith(asElement);
            this.runStartupActions(asElement, trigger);
        }
        else if (trigger && trigger.is("[data-add-subform]")) {
            var subFormName = trigger.attr("data-add-subform");
            var container = containerModule.find("[data-subform=" + subFormName + "] > table tbody:first");

            if (container.length == 0) container = containerModule.find("[data-subform=" + subFormName + "]");
            container.append(asElement);

            this.updateSubFormStates();
            this.runStartupActions(asElement, trigger);
        }
        else {
            this.executeActions(response, trigger);
        }

        this.initialize();
    }

    paginationSizeChanged(event: Event) {
        $(event.currentTarget).closest('form').submit();
    }

    highlightRow(element: any) {
        var target = $(element.closest('tr'));
        target.siblings('tr').removeClass('highlighted')
        target.addClass('highlighted');
    }
}