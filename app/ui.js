// Generated by CoffeeScript 1.10.0
var node, ui_init;

$("document").ready(function() {
  $("#node-canvas").droppable({
    hoverClass: "node-canvas-hover",
    tolerance: "pointer",
    scope: "tray",
    drop: function(evt, ui) {
      var i, name, x;
      if (ui.draggable.hasClass("node-wrapper")) {
        if (!ui.draggable.hasClass("on-canvas")) {
          return ui.draggable.clone().appendTo("#node-canvas").addClass("on-canvas").draggable({
            helper: "original",
            scope: "canvas"
          }).droppable({
            scope: "canvas",
            tolerance: "pointer",
            drop: function(evt, ui) {
              var loc;
              if ($(this).parent().is("#node-canvas")) {
                loc = $(this).children().last();
              } else {
                loc = $(this).parent().children().last();
              }
              return ui.draggable.appendTo($(this)).position({
                of: loc,
                my: "top",
                at: "bottom"
              });
            }
          });
        }
      } else {
        name = ui.draggable.find("h2").text();
        i = ((function() {
          var j, len, results;
          results = [];
          for (j = 0, len = instruments.length; j < len; j++) {
            x = instruments[j];
            if (x.name === name) {
              results.push(x);
            }
          }
          return results;
        })())[0];
        i.is_live = true;
        if (!ui.draggable.hasClass("on-canvas")) {
          return ui.draggable.clone().appendTo($("#node-canvas")).addClass("on-canvas").draggable({
            helper: "original",
            scope: "canvas"
          });
        }
      }
    },
    out: function(evt, ui) {
      var i, name, x;
      console.log("dragged out");
      name = ui.draggable.find("h2").text();
      i = ((function() {
        var j, len, results;
        results = [];
        for (j = 0, len = instruments.length; j < len; j++) {
          x = instruments[j];
          if (x.name === name) {
            results.push(x);
          }
        }
        return results;
      })())[0];
      return i.is_live = false;
    }
  });
  return $("#node-tray").droppable({
    scope: "canvas",
    drop: function(evt, ui) {
      var e, error, i, j, len, name, names, x;
      names = (function() {
        var j, len, ref, results;
        ref = ui.draggable.find("h2");
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          i = ref[j];
          results.push($(i).text());
        }
        return results;
      })();
      for (j = 0, len = names.length; j < len; j++) {
        name = names[j];
        i = ((function() {
          var k, len1, results;
          results = [];
          for (k = 0, len1 = instruments.length; k < len1; k++) {
            x = instruments[k];
            if (x.name === name) {
              results.push(x);
            }
          }
          return results;
        })())[0];
        try {
          i.is_live = false;
        } catch (error) {
          e = error;
        }
      }
      return ui.draggable.remove();
    }
  });
});

ui_init = function() {
  var j, len, n;
  for (j = 0, len = instruments.length; j < len; j++) {
    n = instruments[j];
    $(node(n.name, n.data.default_pattern)).appendTo($("#node-tray"));
  }
  $(".node").draggable({
    helper: "clone",
    scope: "tray"
  });
  $(".node").each(function(index, element) {
    var btn, name;
    btn = $(element).find("button");
    name = $(element).find("input").attr("id");
    return btn.on("click", function() {});
  });
  return $(node("wrapper", "")).appendTo($("#node-tray")).draggable({
    scope: "tray",
    helper: "clone"
  }).addClass("node-wrapper").removeClass("node-sample");
};

node = function(name, def_pat) {
  return "<div class=\"node node-sample\">\n<h2>" + name + "</h2>\n</div>";
};
