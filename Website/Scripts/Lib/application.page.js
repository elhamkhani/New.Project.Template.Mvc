/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/jquery/jquery.validation.d.ts" />
/// <reference path="../typings/alertify/alertify.d.ts" />
/// <reference path="../typings/moment/moment.d.ts" />
/// <reference path="../typings/missingdefinitions.d.ts" />
var BaseApplicationPage = (function () {
    function BaseApplicationPage() {
        var _this = this;
        // formats: http://momentjs.com/docs/#/displaying/format/
        this.DATE_FORMAT = "DD/MM/YYYY";
        this.TIME_FORMAT = "HH:mm";
        this.DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";
        this._initializeActions = [];
        this.currentModal = null;
        $(function () {
            _this.enableAlert();
            _this.configureValidation();
            _this.initialise();
            _this.runStartupActions();
        });
    }
    BaseApplicationPage.prototype.onInit = function (action) {
        this._initializeActions.push(action);
    };
    BaseApplicationPage.prototype.initialise = function () {
        var _this = this;
        // =================== Request lifecycle ====================
        $('form[method=get]').off("submit.clean-up").on("submit.clean-up", function (e) { return _this.cleanGetFormSubmit(e); });
        $("[formaction]").not("[formmethod=post]").off("click.formaction").on("click.formaction", function (e) { return _this.invokeActionWithAjax(e, $(e.currentTarget).attr("formaction")); });
        $("[formaction][formmethod=post]").off("click.formaction").on("click.formaction", function (e) { return _this.invokeActionWithPost(e); });
        $("[data-change-action]").off("change.data-action").on("change.data-action", function (e) { return _this.invokeActionWithAjax(e, $(e.currentTarget).attr("data-change-action")); });
        // =================== Plug-ins ====================
        $("input[autocomplete-source]").each(function (i, e) { return _this.handleAutoComplete($(e)); });
        $("[data-control=date-picker],[data-control=calendar]").each(function (i, e) { return _this.enableDateControl($(e)); });
        $("[data-control='date-picker|time-picker']").each(function (i, e) { return _this.enableDateAndTimeControl($(e)); });
        $("[data-control=time-picker]").each(function (i, e) { return _this.enableTimeControl($(e)); });
        $("[data-control=date-drop-downs]").each(function (i, e) { return _this.enableDateDropdown($(e)); });
        $("[data-control=html-editor]").each(function (i, e) { return _this.enableHtmlEditor($(e)); });
        $("[data-control=numeric-up-down]").each(function (i, e) { return _this.enableNumericUpDown($(e)); });
        $("[data-control=collapsable-checkboxes]").each(function (i, e) { return _this.enableCollapsableCheckboxes($(e)); });
        $(".file-upload input[type=file]").each(function (i, e) { return _this.enableFileUpload($(e)); });
        $("[data-confirm-question]").each(function (i, e) { return _this.enableConfirmQuestion($(e)); });
        // =================== Standard Features ====================
        $("[data-delete-subform]").off("click.delete-subform").on("click.delete-subform", function (e) { return _this.deleteSubForm(e); });
        $("[target='$modal'][href]").off("click.open-modal").on("click.open-modal", function (e) { return _this.openLinkModal(e); });
        $(".select-grid-cols .group-control").each(function (i, e) { return _this.enableSelectColumns($(e)); });
        $("[name=InstantSearch]").each(function (i, e) { return _this.enableInstantSearch($(e)); });
        $("th.select-all > input[type=checkbox]").off("click.select-all").on("click.select-all", function (e) { return _this.enableSelectAllToggle(e); });
        $("[data-user-help]").each(function (i, e) { return _this.enableUserHelp($(e)); });
        $("form input, form select").off("keypress.default-button").on("keypress.default-button", function (e) { return _this.handleDefaultButton(e); });
        $('[autofocus]visible:first').focus();
        $("form[method=get] .pagination-size select[name=p]").off("change.pagination-size").on("change.pagination-size", function (e) { return _this.paginationSizeChanged(e); });
        $.validator.unobtrusive.parse('form');
        $("[data-sort-item]").parents("tbody").each(function (i, e) { return _this.enableDragSort($(e)); });
        this.hideEmptySubformHeaders();
        this._initializeActions.forEach(function (action) { return action(); });
    };
    BaseApplicationPage.prototype.enableDragSort = function (container) {
        var _this = this;
        var items = container.is("tbody") ? "> tr" : "> li"; // TODO: Do we need to support any other markup?
        container.sortable({
            handle: '[data-sort-item]',
            items: items,
            axis: 'y',
            helper: function (e, ui) {
                // prevent TD collapse during drag
                ui.children().each(function (i, c) { return $(c).width($(c).width()); });
                return ui;
            },
            stop: function (e, ui) {
                var dropBefore = ui.item.next().find("[data-sort-item]").attr("data-sort-item") || "";
                var handle = ui.item.find("[data-sort-item]");
                var actionUrl = handle.attr("data-sort-action");
                actionUrl = urlHelper.addQuery(actionUrl, "drop-before", dropBefore);
                _this.invokeActionWithAjax({ currentTarget: handle.get(0) }, actionUrl);
            }
        });
    };
    BaseApplicationPage.prototype.configureValidation = function () {
        var methods = $.validator.methods;
        var format = this.DATE_FORMAT;
        methods.date = function (value, element) {
            if (this.optional(element))
                return true;
            return moment(value, format).isValid();
        };
        // TODO: datetime, time
    };
    BaseApplicationPage.prototype.hideEmptySubformHeaders = function () {
        $(".horizontal-subform thead").each(function (i, e) {
            var show = $(e).parent().find(".subform-item:visible").length > 0;
            $(e).css('visibility', show ? 'visible' : 'hidden');
        });
    };
    BaseApplicationPage.prototype.enableDateDropdown = function (input) {
        // TODO: Implement
    };
    BaseApplicationPage.prototype.enableSelectAllToggle = function (event) {
        var trigger = $(event.currentTarget);
        trigger.closest("table").find("td.select-row > input[type=checkbox]").prop('checked', trigger.is(":checked"));
    };
    BaseApplicationPage.prototype.enableInstantSearch = function (control) {
        // TODO: Make it work with List render mode too.
        control.off("keyup.immediate-filter").on("keyup.immediate-filter", function (event) {
            var keywords = control.val().toLowerCase().split(' ');
            var rows = control.closest('[data-module]').find(".grid > tbody > tr");
            rows.each(function (index, e) {
                var row = $(e);
                var content = row.text().toLowerCase();
                var hasAllKeywords = keywords.filter(function (i) { return content.indexOf(i) == -1; }).length == 0;
                if (hasAllKeywords)
                    row.show();
                else
                    row.hide();
            });
        });
        control.on("keydown", function (e) {
            if (e.keyCode == 13)
                e.preventDefault();
        });
    };
    BaseApplicationPage.prototype.validateForm = function (trigger) {
        if (trigger.is("[formnovalidate]"))
            return true;
        var form = trigger.closest("form");
        var validator = form.validate();
        if (!validator.form()) {
            var alertUntyped = alert;
            if (form.is("[data-validation-style*=message-box]"))
                alertUntyped(validator.errorList.map(function (err) { return err.message; }).join('\r\n'), function () {
                    setTimeout(function () { return validator.focusInvalid(); }, 0);
                });
            validator.focusInvalid();
            return false;
        }
        return true;
    };
    BaseApplicationPage.prototype.enableConfirmQuestion = function (button) {
        var _this = this;
        button.off("click.confirm-question").bindFirst("click.confirm-question", function (e) {
            e.stopImmediatePropagation();
            //return false;
            _this.showConfirm(button.attr('data-confirm-question'), function () {
                button.off("click.confirm-question");
                button.trigger('click');
                _this.enableConfirmQuestion(button);
            });
            return false;
        });
    };
    BaseApplicationPage.prototype.showConfirm = function (text, yesCallback) {
        alertify.confirm(text.replace(/\r/g, "<br />"), function (e) {
            if (e)
                yesCallback();
            else
                return false;
        });
    };
    BaseApplicationPage.prototype.enableHtmlEditor = function (input) {
        // TODO: Support configurations http://peterkeating.co.uk/using-ckeditor-with-razor-for-net-mvc3/
        $.getScript("/bower_components/ckeditor/ckeditor.js", function () {
            CKEDITOR.basePath = '/bower_components/ckeditor/';
            CKEDITOR.config.contentsCss = CKEDITOR.basePath + 'contents.css';
            $.getScript("/bower_components/ckeditor/adapters/jquery.js", function () {
                input.ckeditor();
            });
        });
    };
    BaseApplicationPage.prototype.enableAlert = function () {
        var w = window;
        w.alert = function (text, callback) {
            if (text == undefined)
                text = "";
            alertify.alert(text.replace(/\r/g, "<br />"), callback);
        };
    };
    BaseApplicationPage.prototype.enableNumericUpDown = function (input) {
        var min = input.attr("data-val-range-min");
        var max = input.attr("data-val-range-max");
        input.spinedit({
            minimum: parseInt(min),
            maximum: parseInt(max),
            step: 1,
        });
    };
    BaseApplicationPage.prototype.enableCollapsableCheckboxes = function (input) {
        // TODO
    };
    BaseApplicationPage.prototype.enableFileUpload = function (input) {
        input.attr("data-url", "/file/upload");
        var container = input.closest(".file-upload");
        var del = container.find(".delete-file");
        var current = container.find(".current-file");
        var idInput = container.find("input.file-id");
        var progressBar = container.find(".progress-bar");
        // TODO: Hide the default UI and replace with a button:
        // See http://markusslima.github.io/bootstrap-filestyle/ or https://blueimp.github.io/jQuery-File-Upload/
        //input.css('position', "absolute");
        //var button = input.after("<label class='btn' style='position:absolute;'>Upload...</label>");
        del.click(function (e) {
            current.hide();
            del.hide();
            idInput.val("REMOVE");
            progressBar.width(0);
        });
        input.fileupload({
            dataType: 'json',
            progressall: function (e, data) {
                var progress = parseInt((data.loaded / data.total * 100).toString(), 10);
                progressBar.width(progress + '%');
            },
            error: this.handleAjaxResponseError,
            done: function (e, data) {
                idInput.val("file:" + data.result.ID);
                current.text(data.result.Name).show();
                del.show();
            }
        });
    };
    BaseApplicationPage.prototype.openLinkModal = function (event) {
        var target = $(event.currentTarget);
        var url = target.attr("href");
        var modalOptions = {};
        var options = target.attr("data-modal-options");
        if (options)
            modalOptions = this.toJson(options);
        this.openModal(url, modalOptions);
        return false;
    };
    BaseApplicationPage.prototype.toJson = function (data) {
        try {
            return JSON.parse(data);
        }
        catch (error) {
            console.log(error);
            console.log('Cannot parse this data to Json: ');
            console.log(data);
        }
    };
    BaseApplicationPage.prototype.runStartupActions = function (container, trigger) {
        if (container === void 0) { container = null; }
        if (trigger === void 0) { trigger = null; }
        if (container == null)
            container = $(document);
        if (trigger == null)
            trigger = $(document);
        var actions = $("input[name='Startup.Actions']", container).val();
        if (actions)
            this.executeActions(this.toJson(actions), trigger);
    };
    BaseApplicationPage.prototype.enableDateControl = function (input) {
        var control = input.attr("data-control");
        var viewMode = input.attr("data-view-mode") || 'days';
        // apply date-time-picker to the parent of input so that the icon is being applied
        if (control == "date-picker") {
            input.parent().datetimepicker({
                format: this.DATE_FORMAT,
                useCurrent: false,
                showTodayButton: true,
                icons: { today: 'today' },
                viewMode: viewMode,
                keepInvalid: true
            }).data("DateTimePicker").keyBinds().clear = null;
        }
        else
            alert("Don't know how to handle date control of " + control);
    };
    BaseApplicationPage.prototype.enableDateAndTimeControl = function (input) {
        input.parent().datetimepicker({
            format: this.DATE_TIME_FORMAT,
            useCurrent: false,
            showTodayButton: true,
            icons: { today: 'today' },
            stepping: parseInt(input.attr("data-minute-steps") || '5'),
            keepInvalid: true
        }).data("DateTimePicker").keyBinds().clear = null;
    };
    BaseApplicationPage.prototype.enableTimeControl = function (input) {
        input.parent().datetimepicker({
            format: this.TIME_FORMAT,
            useCurrent: false,
            stepping: parseInt(input.attr("data-minute-steps") || '5'),
            keepInvalid: true
        }).data("DateTimePicker").keyBinds().clear = null;
    };
    BaseApplicationPage.prototype.handleAutoComplete = function (input) {
        var _this = this;
        var valueField = $("[name='" + input.attr("name").slice(0, -5) + "']");
        if (valueField.length == 0)
            console.log('Could not find the value field for auto-complete.');
        var dataSource = function (query, callback) {
            var url = input.attr("autocomplete-source");
            url = urlHelper.removeQuery(url, input.attr('name')); // Remove old text.
            var data = _this.getPostData(input);
            $.post(url, data).fail(function (err) { return alert(err.message); }).done(function (result) {
                result = result.map(function (i) {
                    return {
                        Display: i.Display || i.Text || i.Value,
                        Value: i.Value || i.Text || i.Display,
                        Text: i.Text || $("<div/>").append($(i.Display)).text() || i.Value
                    };
                });
                return callback(result);
            });
        };
        var clearValue = function (e) {
            if (input.val() !== input.data("selected-text"))
                valueField.val('');
        };
        var itemSelected = function (e, item) {
            input.off('change, keydown').data("selected-text", item.Display);
            valueField.val(item.Value);
            input.on('change, keydown', clearValue);
        };
        var dataset = {
            displayKey: 'Text',
            source: dataSource,
            templates: { suggestion: function (item) { return item.Display; }, empty: "<div class='tt-suggestion'>Not found</div>" }
        };
        input.on('change, keydown', clearValue).on('typeahead:selected', itemSelected).typeahead({ minLength: 0 }, dataset);
    };
    BaseApplicationPage.prototype.handleDefaultButton = function (event) {
        if (event.which === 13) {
            var target = $(event.currentTarget);
            var button = target.closest("[data-module]").find('[default-button]:first'); // Same module
            if (button.length == 0)
                button = $('[default-button]:first'); // anywhere
            button.click();
            return false;
        }
        else
            return true;
    };
    BaseApplicationPage.prototype.deleteSubForm = function (event) {
        var button = $(event.currentTarget);
        var container = button.parents(".subform-item");
        container.find("input[name*=MustBeDeleted]").val("true");
        container.hide();
        this.hideEmptySubformHeaders();
    };
    BaseApplicationPage.prototype.cleanGetFormSubmit = function (event) {
        var form = $(event.currentTarget);
        var formData = form.serialize();
        var url = urlHelper.removeEmptyQueries(form.attr('action'));
        var actualData = urlHelper.mergeQueries(formData);
        actualData = urlHelper.arrayToQuery(urlHelper.queryToArray(actualData).filter(function (x) { return x.__RequestVerificationToken == undefined; }));
        var items = actualData.split('&');
        try {
            form.find("input[type=checkbox]:unchecked").each(function (i, e) { return url = urlHelper.removeQuery(url, $(e).attr('name')); });
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
    };
    BaseApplicationPage.prototype.enableUserHelp = function (element) {
        element.click(function () { return false; });
        var message = element.attr('data-user-help'); // todo: unescape message and conver to html
        element['popover']({ trigger: 'focus', content: message });
    };
    BaseApplicationPage.prototype.executeActions = function (actions, trigger) {
        for (var i in actions) {
            var action = actions[i];
            if (action.Notify)
                alert(action.Notify);
            else if (action.Script)
                eval(action.Script);
            else if (action.BrowserAction == "Back")
                window.history.back();
            else if (action.BrowserAction == "CloseModal")
                this.closeModal();
            else if (action.BrowserAction == "CloseModalRefreshParent")
                this.closeModal(true);
            else if (action.BrowserAction == "Close")
                window.close();
            else if (action.BrowserAction == "Refresh")
                location.reload();
            else if (action.BrowserAction == "Print")
                window.print();
            else if (action.BrowserAction == "ShowPleaseWait")
                this.showPleaseWait(action.BlockScreen);
            else if (action.Redirect) {
                if (action.Redirect.indexOf('/') != 0 && action.Redirect.indexOf('http') != 0)
                    action.Redirect = '/' + action.Redirect;
                window.location.replace(action.Redirect);
            }
            else {
                alert("Don't know how to handle: " + urlHelper.htmlEncode(JSON.stringify(actions)));
                return;
            }
        }
    };
    BaseApplicationPage.prototype.showPleaseWait = function (blockScreen) {
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
    };
    BaseApplicationPage.prototype.openModal = function (url, options) {
        var _this = this;
        if (this.currentModal != null)
            this.closeModal();
        this.currentModal = $("<div class='modal fade' id='myModal' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'\
 aria-hidden='true'>\
            <div class='modal-dialog'>\
    <div class='modal-content'>\
    <div class='modal-header'>\
        <button type='button' class='close' data-dismiss='modal' aria-label='Close'>\
            <span aria-hidden='true'>&times;</span>\
        </button>\
    </div>\
    <div class='modal-body'>\
        <div class='row text-center'><img src='/public/img/icons/loading.gif'/></div>\
        <iframe style='width:100%; height:100%; border:0;'></iframe>\
    </div>\
</div></div></div>");
        var frame = this.currentModal.find("iframe");
        frame.attr("src", url).on("load", function (e) {
            var doc = frame.get(0).contentWindow.document;
            frame.height(doc.body.offsetHeight);
            _this.currentModal.find(".modal-body .text-center").remove();
        });
        this.currentModal.appendTo("body").modal('show');
    };
    BaseApplicationPage.prototype.closeModal = function (refreshParent) {
        if (refreshParent === void 0) { refreshParent = false; }
        if (this.currentModal) {
            this.currentModal.modal('hide');
            if (refreshParent)
                window.location.reload();
            this.currentModal = null;
        }
        else if (window.parent) {
            var p = window.parent;
            if (p.page)
                p.page.closeModal(refreshParent);
        }
    };
    BaseApplicationPage.prototype.getPostData = function (trigger) {
        var form = trigger.closest("form");
        var data = urlHelper.mergeQueries(form.serialize());
        // data = urlHelper.removeEmptyPostItems(data);
        data += "&current.request.url=" + encodeURIComponent(urlHelper.pathAndQuery());
        return data;
    };
    BaseApplicationPage.prototype.invokeActionWithAjax = function (event, actionUrl) {
        var _this = this;
        var trigger = $(event.currentTarget);
        var containerModule = trigger.closest("[data-module]");
        var form = trigger.closest("form");
        if (this.validateForm(trigger) == false)
            return false;
        var data = this.getPostData(trigger);
        $.ajax({
            url: actionUrl,
            method: 'POST',
            data: data,
            success: function (result) {
                _this.invokeAjaxActionResult(result, form, containerModule, trigger);
            },
            error: this.handleAjaxResponseError
        });
        return false;
    };
    BaseApplicationPage.prototype.enableSelectColumns = function (container) {
        var columns = container.find("div.select-cols");
        container.find("a.select-cols").click(function () { return columns.show(); });
        columns.find('.cancel').click(function () { return columns.hide(); });
    };
    BaseApplicationPage.prototype.invokeActionWithPost = function (event) {
        var trigger = $(event.currentTarget);
        var containerModule = trigger.closest("[data-module]");
        if (containerModule.is("form") && this.validateForm(trigger) == false)
            return false;
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
    };
    BaseApplicationPage.prototype.handleAjaxResponseError = function (response) {
        var text = response.responseText;
        if (text.indexOf("<html") > -1) {
            document.write(text);
        }
        else if (text.indexOf("<form") > -1) {
            var form = $("form", document);
            if (form.length)
                form.replaceWith($(text));
            else
                document.write(text);
        }
        else
            alert(text);
    };
    BaseApplicationPage.prototype.invokeAjaxActionResult = function (response, form, containerModule, trigger) {
        var asElement = $(response);
        console.log(asElement);
        if (asElement.is("[data-module]")) {
            containerModule.replaceWith(asElement);
            this.runStartupActions(asElement, trigger);
        }
        else if (response.length == 1 && response[0].ReplaceView) {
            asElement = $("<div/>").append(response[0].ReplaceView);
            containerModule.replaceWith(asElement);
            this.runStartupActions(asElement, trigger);
        }
        else if (trigger && trigger.is("[data-add-subform]")) {
            var subFormName = trigger.attr("data-add-subform");
            var container = form.find("[data-subform=" + subFormName + "] > table tbody:first");
            if (container.length == 0)
                container = form.find("[data-subform=" + subFormName + "]");
            container.append(asElement);
            this.hideEmptySubformHeaders();
            this.runStartupActions(asElement, trigger);
        }
        else {
            this.executeActions(response, trigger);
        }
        this.initialise();
    };
    BaseApplicationPage.prototype.paginationSizeChanged = function (event) {
        $(event.currentTarget).closest('form').submit();
    };
    return BaseApplicationPage;
})();
//# sourceMappingURL=application.page.js.map