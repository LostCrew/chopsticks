// Generated by CoffeeScript 1.10.0

/*
Author: Jason Gwartz
2016
 */
var Instrument, JGAnalyser, LoadedSample, PlaySound, SoundContainer, analyser, context, final_gain, instruments, main, sample_data, samples, startPlayback, t,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

context = null;

samples = null;

instruments = null;

sample_data = null;

t = null;

analyser = null;

final_gain = null;

LoadedSample = (function() {
  function LoadedSample(file) {
    var request, self;
    this.file = file;
    request = new XMLHttpRequest();
    request.open('GET', this.file, true);
    request.responseType = 'arraybuffer';
    self = this;
    request.onload = function() {
      self.data = request.response;
      return context.decodeAudioData(self.data, function(decoded) {
        return self.decoded = decoded;
      }, function(e) {
        return console.log("Error loading:" + self.file + e);
      });
    };
    request.send();
  }

  LoadedSample.prototype.play = function(n, output_chain) {
    var source;
    if (isNaN(n)) {
      return;
    }
    source = context.createBufferSource();
    source.buffer = this.decoded;
    source.connect(output_chain);
    return source.start(n);
  };

  return LoadedSample;

})();

PlaySound = (function() {
  function PlaySound(sample, beat1) {
    this.sample = sample;
    this.beat = beat1;
  }

  PlaySound.prototype.play = function(output) {
    return this.sample.play(this.beat, output);
  };

  return PlaySound;

})();

Instrument = (function() {
  function Instrument(name, data) {
    this.name = name;
    this.data = data;
    this.is_live = true;
    this.pattern = [];
  }

  Instrument.prototype.load = function() {
    return this.sample = new LoadedSample(this.data.file);
  };

  Instrument.prototype.add = function(beat) {
    return this.pattern.push(new PlaySound(this.sample, beat));
  };

  Instrument.prototype.reset = function() {
    return this.pattern = [];
  };

  return Instrument;

})();

SoundContainer = (function() {
  function SoundContainer() {
    this.active_instruments = [];
  }

  SoundContainer.prototype.prepare = function() {
    var b, i, j, k, l, len, len1, len2, ref, results;
    for (j = 0, len = instruments.length; j < len; j++) {
      i = instruments[j];
      i.reset();
    }
    t = context.currentTime;
    for (k = 0, len1 = instruments.length; k < len1; k++) {
      i = instruments[k];
      if (i.is_live) {
        this.active_instruments.push(i);
      }
    }
    ref = this.active_instruments;
    results = [];
    for (l = 0, len2 = ref.length; l < len2; l++) {
      i = ref[l];
      results.push((function() {
        var len3, m, ref1, results1;
        ref1 = document.getElementById(i.name).value.split(' ');
        results1 = [];
        for (m = 0, len3 = ref1.length; m < len3; m++) {
          b = ref1[m];
          results1.push(i.add(parseFloat(b) + t));
        }
        return results1;
      })());
    }
    return results;
  };

  SoundContainer.prototype.play = function(output_chain) {
    var instrument, j, len, ps, ref, results;
    console.log(this.active_instruments);
    ref = this.active_instruments;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      instrument = ref[j];
      results.push((function() {
        var k, len1, ref1, results1;
        ref1 = instrument.pattern;
        results1 = [];
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          ps = ref1[k];
          results1.push(ps.play(output_chain));
        }
        return results1;
      })());
    }
    return results;
  };

  return SoundContainer;

})();

JGAnalyser = (function() {
  function JGAnalyser() {
    this.draw = bind(this.draw, this);
    this.node = context.createAnalyser();
    this.node.fftSize = 2048;
    this.bufferLength = this.node.fftSize;
    this.dataArray = new Uint8Array(this.bufferLength);
    this.HEIGHT = 30;
    this.WIDTH = window.innerWidth;
    this.canvas = document.getElementById("visual");
    this.canvas.width = this.WIDTH;
    this.canvas.height = this.HEIGHT;
    this.canvasCtx = this.canvas.getContext("2d");
    this.canvasCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
  }

  JGAnalyser.prototype.draw = function() {
    var drawVisual, i, j, ref, sliceWidth, v, x, y;
    this.WIDTH = window.innerWidth;
    this.canvasCtx.fillStyle = 'rgb(255, 255, 255)';
    drawVisual = requestAnimationFrame(this.draw);
    this.node.getByteTimeDomainData(this.dataArray);
    this.canvasCtx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
    this.canvasCtx.lineWidth = 2;
    this.canvasCtx.beginPath();
    sliceWidth = this.WIDTH * 1.0 / this.bufferLength;
    x = 0;
    for (i = j = 0, ref = this.bufferLength; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      v = this.dataArray[i] / 128.0;
      y = v * this.HEIGHT / 2;
      if (i === 0) {
        this.canvasCtx.moveTo(x, y);
      } else {
        this.canvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    this.canvasCtx.lineTo(this.canvas.width, this.canvas.height / 2);
    return this.canvasCtx.stroke();
  };

  return JGAnalyser;

})();

startPlayback = function(output_chain) {
  var track;
  track = new SoundContainer();
  track.prepare();
  track.play(output_chain);
  analyser.canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
  setTimeout((function() {
    return analyser.canvasCtx.strokeStyle = 'rgb(255, 0, 0)';
  }), 3500);
  return setTimeout((function() {
    return startPlayback(output_chain);
  }), 4000);
};

main = function() {
  var output_chain;
  $.getJSON("sampledata.json", function(result) {
    var d, i, init_samples, j, len, v;
    sample_data = result;
    instruments = (function() {
      var results;
      results = [];
      for (d in sample_data) {
        v = sample_data[d];
        results.push(new Instrument(d, v));
      }
      return results;
    })();
    for (j = 0, len = instruments.length; j < len; j++) {
      i = instruments[j];
      i.load();
    }
    init_samples = function() {
      var k, len1, ready;
      ready = true;
      for (k = 0, len1 = instruments.length; k < len1; k++) {
        i = instruments[k];
        if (i.sample.decoded === void 0) {
          ready = false;
        }
      }
      if (!ready) {
        console.log("Loading and decoding samples...");
        return setTimeout(init_samples, 100);
      } else {
        console.log("Samples loaded. Starting playback.");
        return startPlayback(output_chain);
      }
    };
    return init_samples();
  });
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();
  output_chain = context.createGain();
  final_gain = context.createGain();
  analyser = new JGAnalyser();
  analyser.draw();
  output_chain.connect(analyser.node);
  analyser.node.connect(final_gain);
  return final_gain.connect(context.destination);
};
