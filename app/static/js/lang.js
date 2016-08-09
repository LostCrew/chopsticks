// Generated by CoffeeScript 1.10.0

/*
Author: Jason Gwartz
2016
 */
var SoundNode, Wrapper, for_loop, if_conditional,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Wrapper = (function() {
  Wrapper.instances = [];

  function Wrapper(name, check, extra_html) {
    this.name = name;
    this.check = check;
    Wrapper.instances.push(this);
    this.html = "<div class=\"node node-wrapper\" id=\"" + this.name + "\">\n  <h2>" + this.name + "</h2>\n  " + extra_html + "\n</div>";
  }

  Wrapper.prototype.eval_input = function(jq) {
    return this.check(jq.find("select").val(), jq.find("input").val(), jq);
  };

  return Wrapper;

})();

if_conditional = new Wrapper("If", function(condition_to_check, input, jq) {
  var i, ins, j, len, ref;
  input = (function() {
    var j, len, ref, results;
    ref = input.replace(/\D/g, " ").split(" ");
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      i = ref[j];
      results.push(parseInt(i));
    }
    return results;
  })();
  if (condition_to_check === "phrase") {
    return ref = phrase + 1, indexOf.call(input, ref) >= 0;
  } else if (condition_to_check === "bar") {
    return do_something;
  } else if (condition_to_check === "beat") {
    ins = jq.parent().parent().data("SoundNode").instrument;
    for (j = 0, len = input.length; j < len; j++) {
      i = input[j];
      ins.add(i);
    }
    return true;
  }
}, "<select class=\"form-control\" id=\"if-select\">\n    <option value=\"beat\">Beat</option>\n    <option value=\"bar\">Bar</option>\n    <option value=\"phrase\">Phrase</option>\n  </select>\n<input type=\"text\" id=\"if-input\" class=\"form-control\">");

for_loop = new Wrapper("For", function(loop_block, number_loops) {
  if (loop_block === "phrases") {
    return pass();
  } else if (loop_block === "bars") {
    return pass();
  } else if (loop_block === "beats") {
    return pass();
  }
}, "<input type=\"text\" id=\"for-input\" class=\"form-control\">\n<select class=\"form-control\" id=\"for-select\">\n    <option value=\"beat\">Beats</option>\n    <option value=\"bar\">Bars</option>\n    <option value=\"phrase\">Phrases</option>\n  </select>");

SoundNode = (function() {
  SoundNode.tray_instances = [];

  SoundNode.canvas_instances = [];

  function SoundNode(instrument) {
    this.instrument = instrument;
    this.id = this.instrument.name;
    this.wrappers = [];
    this.html = "<div class=\"node-sample-container\" id=\"" + this.id + "-container\">\n  <div class=\"wrappers\">\n  </div>\n  <div class=\"node node-sample\" id=\"" + this.id + "\">\n    <h2>" + this.id + "</h2>\n  </div>\n  </div>";
  }

  SoundNode.prototype.phrase_eval = function() {
    var j, len, results, w, wrappers;
    wrappers = $("#" + this.id + "-container").find(".node-wrapper");
    results = [];
    for (j = 0, len = wrappers.length; j < len; j++) {
      w = wrappers[j];
      w = $(w);
      results.push(w.data("Wrapper").eval_input(w));
    }
    return results;
  };

  return SoundNode;

})();