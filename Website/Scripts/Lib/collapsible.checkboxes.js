/// <reference path="../typings/jquery/jquery.d.ts" />
var CollapsibleCheckBoxes = (function () {
    function CollapsibleCheckBoxes(control) {
        this.timeOutHandler = 0;
        this.control = control;
        this.searchBoxContainer = control.find(".search-container");
        this.searchBox = this.searchBoxContainer.find(".textbox");
        this.captionContainer = control.find(".caption-container");
        this.caption = this.captionContainer.find(".textbox");
        this.optionsContainer = control.find(".options-container");
        this.selectionContainer = control.find(".selection-container");
        this.initialise();
    }
    CollapsibleCheckBoxes.prototype.initialise = function () {
        var _this = this;
        var me = this;
        // select all/none handlers
        this.optionsContainer.find('.select-all').on('click', function () {
            _this.optionsContainer.find("input:visible[type='checkbox']").each(function (index, checkbox) {
                $(checkbox).prop('checked', true).trigger("change");
                _this.refreshDisplay();
            });
        });
        this.optionsContainer.find('.remove-all').on('click', function () {
            _this.optionsContainer.find("input:visible[type='checkbox']").each(function (index, checkbox) {
                $(checkbox).prop('checked', false).trigger("change");
                _this.refreshDisplay();
            });
        });
        this.searchBox.attr("AUTOCOMPLETE", "off");
        this.optionsContainer.addClass("__LEAVED");
        this.caption.addClass("__BLURED");
        this.searchBox.unbind("blur").blur(function () { return _this.textBlur(); });
        this.searchBox.keydown(function (e) {
            if (e.keyCode == 13)
                e.preventDefault();
        });
        this.searchBox.unbind("focus").focus(function () { return _this.textFocus(); });
        this.caption.unbind("focus").focus(function () {
            _this.textFocus();
            _this.searchBox.focus();
        });
        this.searchBox.unbind("keyup").keyup(function () {
            _this.FilterFunctions();
            _this.resetPosition();
        });
        this.optionsContainer.find("*").unbind("hover").hover(function () { return _this.panelIn(); });
        this.optionsContainer.unbind("hover").hover(function () { return _this.panelIn(); }, function () { return _this.panelOut(); });
        this.refreshDisplay();
        this.FilterFunctions();
    };
    CollapsibleCheckBoxes.prototype.textBlur = function () {
        this.caption.addClass("__BLURED");
        if (this.optionsContainer.hasClass("__LEAVED"))
            this.HideItems();
    };
    CollapsibleCheckBoxes.prototype.textFocus = function () {
        clearTimeout(this.timeOutHandler);
        this.searchBoxContainer.show();
        this.caption.removeClass("__BLURED");
        this.ShowItems();
        this.captionContainer.hide();
    };
    CollapsibleCheckBoxes.prototype.panelOut = function () {
        this.optionsContainer.addClass("__LEAVED");
        if (this.caption.hasClass("__BLURED"))
            this.HideItems();
    };
    CollapsibleCheckBoxes.prototype.panelIn = function () {
        if (this.timeOutHandler)
            clearTimeout(this.timeOutHandler);
        this.optionsContainer.removeClass("__LEAVED");
    };
    CollapsibleCheckBoxes.prototype.resetPosition = function () {
        var itemsoptionsContainer = this.optionsContainer;
        var pos = this.searchBox.position();
        if (pos.top > $(window.document.body).height() / 2) {
            // I'm in the bottom half:
            itemsoptionsContainer.css({ top: pos.top - itemsoptionsContainer.outerHeight(), left: pos.left });
            if (itemsoptionsContainer.position().top < 0)
                itemsoptionsContainer.css("overflow-y", "scroll").css({ top: 0, height: pos.top });
        }
        else {
            // I'm in the top half:
            itemsoptionsContainer.css({ top: pos.top + this.searchBox.outerHeight(), left: pos.left, width: this.searchBox.outerWidth() });
            var remainingSpace = $(window.document.body).height() - itemsoptionsContainer.position().top;
            if (itemsoptionsContainer.height() > remainingSpace)
                itemsoptionsContainer.css("overflow-y", "scroll").css("height", remainingSpace);
        }
    };
    CollapsibleCheckBoxes.prototype.ShowItems = function () {
        this.resetPosition();
        // hide all open panels
        $('[data-control=collapsable-checkboxes] .panel-optionsContainer').hide();
        if ($("input:checkbox", this.optionsContainer).length > 0)
            this.optionsContainer.show();
        this.refreshDisplay();
    };
    CollapsibleCheckBoxes.prototype.HideItems = function () {
        var me = this;
        setTimeout(function () {
            me.captionContainer.show();
            me.searchBoxContainer.hide();
            me.optionsContainer.hide();
            me.revertAllCheckBoxFromSelectedItems();
            // FIRE POSTBACK IF NECESSARY
            if (me.caption.attr("autoPostBack") == "true" && me.caption.attr("somethingIsChanged") == "true") {
                setTimeout('__doPostBack(\'' + me.caption.attr("controlID") + '\',\'\')', 0);
            }
        }, 200);
    };
    CollapsibleCheckBoxes.prototype.FilterFunctions = function () {
        var parts = $(this.searchBox).val().split(" ");
        var allCheckBoxes = $(".items-list input:checkbox", this.optionsContainer);
        allCheckBoxes.each(function (index, checkbox) {
            var jCheckbox = $(checkbox);
            var value = jCheckbox.parent().text().trim();
            var matches = true;
            for (var i = 0; i < parts.length; i++) {
                if (value == null || value == undefined || value.toLowerCase().indexOf(parts[i].toLowerCase()) == -1) {
                    matches = false;
                    break;
                }
            }
            if (matches) {
                jCheckbox.parent().parent().show();
            }
            else {
                jCheckbox.parent().parent().hide();
            }
        });
    };
    CollapsibleCheckBoxes.prototype.addCheckBoxToSelectedItems = function (checkbox) {
        if ($(checkbox).parents(".items-list").length > 0) {
            var div = $("<div class='item'><i class='fa fa-remove'></i></div>");
            var parent = $(checkbox).parent().parent();
            parent.attr("id", 'label_' + $(checkbox).val());
            parent.children().appendTo(div);
            div.attr("checkboxID", $(checkbox).val());
            parent.css("visibility", "hidden");
            parent.hide();
            div.appendTo(this.selectionContainer);
        }
    };
    CollapsibleCheckBoxes.prototype.revertAllCheckBoxFromSelectedItems = function () {
        var allCheckBoxes = $(".selected-items div[checkboxid] input[type='checkbox']", this.optionsContainer);
        var me = this;
        allCheckBoxes.each(function (index, checkbox) {
            me.revertCheckBoxFromSelectedItems(checkbox);
        });
    };
    CollapsibleCheckBoxes.prototype.revertCheckBoxFromSelectedItems = function (checkbox) {
        if ($(checkbox).parent().parent().is("div[checkboxid]")) {
            var parent = $(checkbox).parent().parent();
            var originalParent = $('#label_' + parent.attr("checkboxID"), this.optionsContainer);
            originalParent.css("visibility", "visible");
            originalParent.show();
            parent.children("label").remove().appendTo(originalParent);
            parent.remove();
        }
    };
    CollapsibleCheckBoxes.prototype.refreshDisplay = function () {
        var allCheckBoxes = this.optionsContainer.find("input[type='checkbox']");
        var single = "";
        var allSelected = new Array();
        var count = 0;
        var pluralName = this.control.attr('data-plural-name');
        var me = this;
        allCheckBoxes.each(function (index, element) {
            var checkbox = $(element);
            if (checkbox.is(":checked")) {
                single = $(checkbox).parent().text().trim();
                allSelected.push(single);
                count++;
                me.addCheckBoxToSelectedItems(element);
            }
            else {
                me.revertCheckBoxFromSelectedItems(element);
            }
        });
        this.handleCheckboxChangeEvent();
        var result = single;
        if (count > 1) {
            result = count + ' ' + pluralName;
        }
        this.control.attr("title", allSelected.join(", "));
        if (result.length == 0)
            result = this.control.attr("placeholder");
        if (!result)
            result = "";
        this.caption.val(result);
        if (this.selectionContainer.children().length == 0)
            this.selectionContainer.hide();
        else
            this.selectionContainer.show();
    };
    CollapsibleCheckBoxes.prototype.handleCheckboxChangeEvent = function () {
        var _this = this;
        var checkbox = this.optionsContainer.find("input[type='checkbox']");
        checkbox.unbind("change").change(function (index, element) {
            _this.refreshDisplay();
            _this.searchBox.focus();
            _this.caption.attr("somethingIsChanged", "true");
        });
    };
    return CollapsibleCheckBoxes;
})();
//# sourceMappingURL=collapsible.checkboxes.js.map