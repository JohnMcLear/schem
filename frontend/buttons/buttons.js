// Generated by CoffeeScript 1.4.0
var ButtonBar,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$(document).ready(function() {
  return $(".menu-bar").each(function() {
    var foo;
    return foo = new ButtonBar(this);
  });
});

ButtonBar = (function(_super) {

  __extends(ButtonBar, _super);

  ButtonBar.prototype.div = null;

  function ButtonBar(div) {
    this.div = div;
    ButtonBar.__super__.constructor.call(this, "guibuttons");
    this.make_buttons();
  }

  ButtonBar.prototype.play = function() {
    return this.send_msg_data("play");
  };

  ButtonBar.prototype.stepi = function() {
    return this.send_msg_data("stepi");
  };

  ButtonBar.prototype.stepo = function() {
    return this.send_msg_data("stepo");
  };

  ButtonBar.prototype.make_buttons = function() {
    var _this = this;
    $(this.div).append("<button id='play'></button>");
    $(this.div).append("<button id='stepi'></button>");
    $(this.div).append("<button id='stepo'></button>");
    $(this.div).find("button#play").click(function() {
      return _this.play();
    });
    $(this.div).find("button#stepi").click(function() {
      return _this.stepi();
    });
    return $(this.div).find("button#stepo").click(function() {
      return _this.stepo();
    });
  };

  return ButtonBar;

})(PluginAdapter);
