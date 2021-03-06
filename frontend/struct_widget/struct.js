var StructView,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

$(document).ready(function() {
  return $(".struct-view").each(function() {
    var foo;
    return foo = new StructView(this);
  });
});

StructView = (function(_super) {

  __extends(StructView, _super);

  function StructView(div) {
    this.id = "struct_10";
    this.div = div;
    this._data = null;
    this.actions = [];
    StructView.__super__.constructor.call(this, this.div.getAttribute("plugin"));
  }

  StructView.prototype.handle_msg = function(data) {
    if (data["type"] === "update") {
      this.dump_values(data["data"]);
      return $(this.div).contextPopup({
        title: this.get_context_title,
        items: this.get_context_items,
        view: this
      });
    } else if (data["type"] === "actions") {
      return this.set_actions(data["actions"]);
    } else {
      return console.log("unknown data", data);
    }
  };

  StructView.prototype.dump_array = function(arr, div) {
    var elem, list, _i, _len;
    $(div).append("<ol class=\"sv-array\"></ol>");
    list = $(div).children("ol");
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      elem = arr[_i];
      list.append("<li class=\"sv-array-elem\"></li>");
      this.dump_values(elem, list.children("li").last().get(0));
    }
    return list.children('li:nth-child(odd)').addClass('sv-odd');
  };

  StructView.prototype.dump_object = function(obj, div) {
    var desc, elem, key, list;
    $(div).append("<ol class=\"sv-obj\"></ol>");
    list = $(div).children("ol");
    for (key in obj) {
      elem = obj[key];
      if (elem[key]) {
        desc = "<span class=\"sv-align1\">" + key + "</span>: " + elem[key];
        delete elem[key];
      } else {
        desc = "<span class=\"sv-align2\">" + key + "</span>:&nbsp;";
      }
      list.append("<li><div class=\"sv-obj-elem\"><div class=\"sv-title\" name=\"" + key + "\">" + desc + "</div><div class=\"sv-content\"></div></div></li>");
      if (!(typeof elem === "number" || typeof elem === "string")) {
        list.children("li").last().children("div").last().children(".sv-content").toggle();
        list.children("li").last().children("div").last().children(".sv-title").click(function() {
          return $(this).parent().children(".sv-content").toggle();
        });
      }
      this.dump_values(elem, list.children("li").last().children("div").last().children("div").last().get(0));
    }
    return list.children('li:nth-child(odd)').addClass('sv-odd');
  };

  StructView.prototype.dump_number = function(number, div) {
    return div.innerHTML = "" + number;
  };

  StructView.prototype.dump_string = function(str, div) {
    return div.innerHTML = str;
  };

  StructView.prototype.do_context_action = function(event, action, name) {
    var json, str;
    json = {
      type: "action",
      action: action,
      name: name
    };
    str = JSON.stringify(json);
    return this.send_msg_data(str);
  };

  StructView.prototype.context_function = function(self, action, name) {
    return function(event) {
      return self.do_context_action(event, action, name);
    };
  };

  StructView.prototype.set_actions = function(msg_actions) {
    var action, _, _len, _results;
    this.actions = [];
    _results = [];
    for (_ = 0, _len = msg_actions.length; _ < _len; _++) {
      action = msg_actions[_];
      _results.push(this.actions.push({
        icon: action.icon,
        label: action.label,
        action: null
      }));
    }
    return _results;
  };

  StructView.prototype.get_context_items = function(event) {
    var action, actions, hovered, name, _, _len, _ref;
    hovered = this.get_hovered_dom_obj(event);
    name = $(hovered).closest(".sv-title").get(0).getAttribute("name");
    actions = [];
    _ref = this.actions;
    for (_ = 0, _len = _ref.length; _ < _len; _++) {
      action = _ref[_];
      if (action) {
        actions.push({
          label: action.label,
          icon: action.icon,
          action: this.context_function(this, action.label, name)
        });
      } else {
        actions.push(null);
      }
    }
    return actions;
  };

  StructView.prototype.get_hovered_dom_obj = function(event) {
    return document.elementFromPoint(event.clientX, event.clientY);
  };

  StructView.prototype.get_context_title = function() {
    return "title";
  };

  StructView.prototype.dump_values = function(values, div) {
    if (div == null) div = null;
    if (div === null) {
      this._data = values;
      div = this.div;
      this.div.innerHTML = "";
    }
    if (typeof values && values instanceof Array) {
      return this.dump_array(values, div);
    } else if (typeof values === "number") {
      return this.dump_number(values, div);
    } else if (typeof values === "string") {
      return this.dump_string(values, div);
    } else {
      return this.dump_object(values, div);
    }
  };

  return StructView;

})(PluginAdapter);
