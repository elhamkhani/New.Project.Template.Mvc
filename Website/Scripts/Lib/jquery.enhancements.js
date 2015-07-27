/// <reference path="../typings/jquery/jquery.d.ts" />
(function () {
    var a = Array;
    a.groupBy = function (array, groupFunction) {
        var groups = {};
        array.forEach(function (o) {
            var group = JSON.stringify(groupFunction(o));
            groups[group] = groups[group] || [];
            groups[group].push(o);
        });
        return Object.keys(groups).map(function (g) { return groups[g]; });
    };
})();
// [name] is the name of the event "click", "mouseover", .. 
// same as you'd pass it to bind()
// [fn] is the handler function
$.fn.bindFirst = function (name, fn) {
    // bind as you normally would
    // don't want to miss out on any jQuery magic
    this.bind(name, fn);
    // Thanks to a comment by @Martin, adding support for
    // namespaced events too.
    var jq = $;
    var eventsData = jq._data(this.get(0), "events");
    if (eventsData) {
        var handlers = eventsData[name.split('.')[0]];
        // take out the handler we just inserted from the end
        var handler = handlers.pop();
        // move it at the beginning
        handlers.splice(0, 0, handler);
    }
    return this;
};
//# sourceMappingURL=jquery.enhancements.js.map