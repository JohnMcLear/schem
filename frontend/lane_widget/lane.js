var LaneTable,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

$(document).ready(function() {
  return $(".lane-view").each(function() {
    var foo;
    return foo = new LaneTable(this);
  });
});

LaneTable = (function(_super) {

  __extends(LaneTable, _super);

  function LaneTable(div) {
    this.div = div;
    this.table = null;
    this._num_rows = 50;
    this._low_address = 0;
    this._high_addr = 0;
    this._offset = 0;
    this._already_waiting_for_update = false;
    this.lane_actions = [];
    LaneTable.__super__.constructor.call(this, this.div.getAttribute("plugin"));
    this.make_table(30);
  }

  LaneTable.prototype.handle_msg = function(msg) {
    var offset_data;
    if (msg.type === "update") {
      this.dump_values(msg.lanes);
      this.line_length = msg.line_length;
      this._low_address = msg.low_address;
      this._high_address = msg.high_address;
      offset_data = msg.offset_data;
      if (offset_data.type === "fixed") {
        this.set_offset(offset_data["offset"]);
      } else if (offset_data.type === "align") {
        this.replace_aligned(offset_data.old_line, offset_data.new_line, msg.lanes);
      } else if (offset_data.type === "delta") {
        this.set_offset(this._offset);
      } else {
        console.log("unknown offset data in", data);
        alert(120);
      }
      return this._already_waiting_for_update = false;
    } else if (msg.type = "actions") {
      return this.set_lane_actions(msg.actions);
    } else {
      return console.log("unknown data", data);
    }
  };

  LaneTable.prototype.get_data = function(addr, lines_before, offset_data) {
    var str;
    if (this._already_waiting_for_update) return;
    this._already_waiting_for_update = true;
    str = JSON.stringify({
      type: "req",
      address: addr,
      lines_before: lines_before,
      length: this._num_rows,
      offset_data: offset_data
    });
    return this.send_msg_data(str);
  };

  LaneTable.prototype.goto_addr = function(addr, before) {
    if (before == null) before = 4;
    return this.get_data(addr, before, {
      type: "fixed",
      offset: 0
    });
  };

  LaneTable.prototype.replace_aligned = function(old_line, new_line, data) {
    var new_line_top, old_line_top, old_offset, old_top;
    old_top = this.table.offsetTop;
    old_line_top = this.table.rows[old_line].offsetTop;
    old_offset = this.offset;
    this.dump_values(data);
    new_line_top = this.table.rows[new_line].offsetTop;
    return this.set_offset(this._offset + (old_line_top - new_line_top));
  };

  LaneTable.prototype.reload_top = function() {
    return this.get_data(this._low_address, this._num_rows - 30, {
      type: "align",
      old_line: 0,
      new_line: this._num_rows - 30
    });
  };

  LaneTable.prototype.reload_bottom = function() {
    return this.get_data(this._high_address, 29, {
      type: "align",
      old_line: this._num_rows - 1,
      new_line: 29
    });
  };

  LaneTable.prototype.scroll = function(delta) {
    var dist_bottom, dist_top, _ref;
    if (this._offset + delta > 0) if (this._first_row === 0) return;
    this.set_offset(this._offset + delta);
    _ref = this.content_dists(), dist_top = _ref[0], dist_bottom = _ref[1];
    if (dist_top <= 30) this.reload_top();
    if (dist_bottom <= 30) return this.reload_bottom();
  };

  LaneTable.prototype.div_offset_top = function() {
    var div_border_width, div_top;
    div_border_width = parseInt($(this.div).css("border-top-width"));
    return div_top = this.div.offsetTop + div_border_width;
  };

  LaneTable.prototype.content_dists = function() {
    var dist_bottom, dist_top, div_bottom, div_pos, table_bottom, table_pos;
    div_pos = $(this.div).offset();
    table_pos = $(this.table).offset();
    dist_top = div_pos.top - table_pos.top;
    div_bottom = div_pos.top + this.div.offsetHeight;
    table_bottom = table_pos.top + this.table.offsetHeight;
    dist_bottom = table_bottom - div_bottom;
    return [dist_top, dist_bottom];
  };

  LaneTable.prototype.set_offset = function(offset) {
    this._offset = offset;
    return $(this.table).css("top", offset);
  };

  LaneTable.prototype.get_item_start = function(item) {
    return item.getAttribute("a");
  };

  LaneTable.prototype.get_item_end = function(item) {
    var addr_end_bi;
    addr_end_bi = str2bigInt(item.getAttribute("a"), 16, 64, 2);
    addr_end_bi = addInt(addr_end_bi, parseInt(item.getAttribute("colspan") || "1") - 1);
    return bigInt2str(addr_end_bi, 16);
  };

  LaneTable.prototype.get_selection = function() {
    var addr_end, addr_start, end, selectedRange, start;
    if (window.getSelection().type === "None") return null;
    selectedRange = window.getSelection().getRangeAt(0);
    end = selectedRange.endContainer;
    start = selectedRange.startContainer;
    addr_start = this.get_item_start($(start).closest("[a]").get(0));
    addr_end = this.get_item_end($(end).closest("[a]").get(0));
    return {
      start: addr_start,
      end: addr_end
    };
  };

  LaneTable.prototype.get_lane_of_item = function(item) {
    var c, i, lane, row, _len, _ref;
    if (!item) return null;
    row = $(item).closest("tr").get(0);
    lane = 0;
    _ref = row.cells;
    for (i = 0, _len = _ref.length; i < _len; i++) {
      c = _ref[i];
      if ($(c)[0].classList.contains("lv-lane-sep")) lane += 1;
      if (c === item) return lane;
    }
    return null;
  };

  LaneTable.prototype.do_context_action = function(event, action, lane, item, selection) {
    var item_range, json, str;
    item_range = {
      start: this.get_item_start(item),
      end: this.get_item_end(item)
    };
    json = {
      type: "action",
      action: action,
      lane: lane,
      item_range: item_range,
      selection_range: selection
    };
    str = JSON.stringify(json);
    return this.send_msg_data(str);
  };

  LaneTable.prototype.context_function = function(self, action, lane, item, selection) {
    return function(event) {
      return self.do_context_action(event, action, lane, item, selection);
    };
  };

  LaneTable.prototype.set_lane_actions = function(msg_actions) {
    var action, actions, lane, _, _len, _results;
    console.log(msg_actions);
    _results = [];
    for (lane = 0, _len = msg_actions.length; lane < _len; lane++) {
      actions = msg_actions[lane];
      this.lane_actions[lane] = [];
      _results.push((function() {
        var _len2, _results2;
        _results2 = [];
        for (_ = 0, _len2 = actions.length; _ < _len2; _++) {
          action = actions[_];
          _results2.push(this.lane_actions[lane].push({
            icon: action.icon,
            label: action.label,
            action: null
          }));
        }
        return _results2;
      }).call(this));
    }
    return _results;
  };

  LaneTable.prototype.get_context_items = function(event) {
    var action, actions, hovered, item, lane, selection, _, _len, _ref;
    selection = this.get_selection();
    hovered = this.get_hovered_dom_obj(event);
    item = $(hovered).closest("[a]").get(0);
    lane = this.get_lane_of_item(item);
    if (lane === null) return null;
    if (!this.lane_actions[lane]) alert("no actions for lane " + lane);
    actions = [];
    _ref = this.lane_actions[lane];
    for (_ = 0, _len = _ref.length; _ < _len; _++) {
      action = _ref[_];
      if (action) {
        actions.push({
          label: action.label,
          icon: action.icon,
          action: this.context_function(this, action.label, lane, item, selection)
        });
      } else {
        actions.push(null);
      }
    }
    return actions;
  };

  LaneTable.prototype.get_context_title = function() {
    return "title";
  };

  LaneTable.prototype.get_hovered_dom_obj = function(event) {
    return document.elementFromPoint(event.clientX, event.clientY);
  };

  LaneTable.prototype.make_table = function() {
    var _this = this;
    this.div.innerHTML = "<div class='lv-content'><table class=\"lv-content-table\"><tbody> No memory loaded </tbody></table></div>";
    $(this.div).parent().append("<div class='lv-annotation lv-mem-table'> No info </div>");
    this.table_div = this.div.children[0];
    this.annotation_div = $(this.div).parent().children().last().get(0);
    $(this.div).bind("mousewheel", function(e) {
      return _this.scroll(e.originalEvent.wheelDelta / 4);
    });
    $(this.div).bind("keydown", function(e) {
      console.log("key", e.keyCode, e.which, 'G'.charCodeAt(0));
      if ((e.keyCode || e.which) === 'G'.charCodeAt(0)) {
        return _this.goto_addr(prompt("Address", 0x400020), 0);
      }
    });
    $(this.div).contextPopup({
      title: this.get_context_title,
      items: this.get_context_items,
      view: this
    });
    return $(this.div).mousemove(function(event) {
      var address, hovered, meta, meta_cols, meta_data, tag, _;
      hovered = $(_this.get_hovered_dom_obj(event)).closest("[a]").get(0);
      if (_this.last_hovered !== hovered && hovered && hovered.getAttribute("a")) {
        _this.last_hovered = hovered;
        address = hovered.getAttribute("a");
        meta = hovered.getAttribute("h");
        while (address.length < 8) {
          address = "0" + address;
        }
        meta_cols = ["<td><span>" + address + "<span></td>"];
        if (meta) {
          meta_data = JSON.parse(unescape(meta));
          for (_ in meta_data) {
            tag = meta_data[_];
            if (tag[1]) {
              meta_cols.push("<td><span>" + tag[0] + "</span><span>:</span><span>" + tag[1] + "</span></td>");
            } else {
              meta_cols.push("<td><span>" + tag[0] + "</span></td>");
            }
          }
        }
        return $(_this.annotation_div).html("<table class='lv-meta-info'><tr>" + (meta_cols.join("<td class='sep'/>")) + "</table>");
      }
    });
  };

  LaneTable.prototype.dump_values = function(values) {
    $(this.table_div).html(values);
    return this.table = this.table_div.children[0];
  };

  return LaneTable;

})(PluginAdapter);
