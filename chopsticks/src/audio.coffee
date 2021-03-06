###
Author: Jason Gwartz
2016
###

# Variable declarations with global scope

context = null
analyser = null
phrase = 1
beat = 0
bar = 1
tempo = 500.0 # milliseconds per beat - 1000 = 60bpm

# Class definitions

class LoadedSample
  # Objects of this class are playable samples which have been
    # loaded into memory and decoded (ie. are ready to be played)

  constructor: (@file, @stretch = null) ->
    return if not @file? # Uploaded sample - skip to decode

    request = new XMLHttpRequest()
    request.open('GET', @file, true)
    request.responseType = 'arraybuffer'

    request.onload = =>
      @decode(request.response)
    request.send()

  decode: (data_in) ->
    context.decodeAudioData(data_in, (decoded) =>
      @decoded = decoded # @decoded is of type AudioBuffer
    , (e) ->
      console.log("Error loading:" + @file + e))


  play: (output, n) ->
    if isNaN(n)
      return
    source = context.createBufferSource()
    source.buffer = @decoded
    source.playbackRate.value = do =>
      if @stretch?
        @decoded.duration / (tempo / 1000 * @stretch)
      else
        1
    source.connect(output)
    source.start(n)
    return [n, source]

class Instrument
  @instances = []
  @maxFrequency =  null

  constructor: (@name, @data, output) ->

    if not Instrument.maxFrequency?
      Instrument.computeMaxFrequency()

    Instrument.instances.push(this)
    @pattern = [] # array of beats
    
    @filter = context.createBiquadFilter()
    @filter.type = 'lowpass'
    @filter.frequency.value = Instrument.maxFrequency
    @gain = context.createGain()

    @filter.connect(@gain)
    @gain.connect(output)

  load: ->
    if @data.beat_stretch?
      @sample = new LoadedSample(@data.file, @data.beat_stretch)
    else
      @sample = new LoadedSample(@data.file)

  is_loaded: ->
    return @sample.decoded? # Check if not undefined/null

  add: (b) -> # playSound
    @pattern.sort( (a, b) ->
      return a - b
    )
    @pattern.push(b) if b not in @pattern
    # beat 1 - 16
  
  play: (time) ->
    do (=>
      b = (i - 1) * tempo / 1000 + time
      # milliseconds to seconds conversion, account for off by one

      # There was a bug here when samples cross a phrase (edge-case with
      #   two different nodes for the same sample), can't replicate anymore
      #   but not certain it's fixed
      @previous_buffer[1].stop(b) if @previous_buffer? and (
        @previous_buffer[0] + @sample.decoded.duration >= b
      )

      @previous_buffer = @sample.play(@filter, b)
    ) for i in @pattern

  tryout: (time) ->
    @sample.play(@filter, time)

  @reset: ->
    i.pattern = [] for i in Instrument.instances

  @computeMaxFrequency: ->
    Instrument.maxFrequency = context.sampleRate / 2
  
    
  @compute_filter: (rate) ->
    
    # Source: http://www.html5rocks.com/en/tutorials/
    # webaudio/intro/js/filter-sample.js
    minValue = 40
    #// Logarithm (base 2) to compute how many octaves fall in the range.
    numberOfOctaves = Math.log(Instrument.maxFrequency / minValue) / Math.LN2
    #// Compute a multiplier from 0 to 1 based on an exponential scale.
    mult = Math.pow(2, numberOfOctaves * (
      rate - 1.0
      ))
    #// Get back to the frequency value between min and max.
    return Instrument.maxFrequency * mult

class JGAnalyser

  constructor: ->
    @node = context.createAnalyser()
    @node.fftSize = 2048
    @bufferLength = @node.fftSize
    @dataArray = new Uint8Array(@bufferLength)

    #  https://github.com/mdn/voice-change-o-matic/blob/gh-pages/scripts/app.js#L123-L167

    @canvas = document.getElementById("visual")
    @HEIGHT = 30
    @WIDTH = $(@canvas).parent().width()
    
    @canvas.width = @WIDTH
    @canvas.height = @HEIGHT
    @canvasCtx = @canvas.getContext("2d")
    @canvasCtx.clearRect(0, 0, @WIDTH, @HEIGHT)

  set_black: ->
    @canvasCtx.strokeStyle = 'rgb(0, 0, 0)'

  set_red: ->
    @canvasCtx.strokeStyle = 'rgb(255, 0, 0)'

  draw: =>
    # Reset width
    @WIDTH = $(@canvas).parent().width()
    
    # TODO: fix bug where auto-resizing canvas breaks the colours
    #@canvas.width = @WIDTH
    # TODO: Make colours constants or something other than hard-coded
    @canvasCtx.fillStyle = 'rgb(122, 188, 252)'

    drawVisual = requestAnimationFrame(@draw)
    @node.getByteTimeDomainData(@dataArray)
    
    @canvasCtx.fillRect(0, 0, @WIDTH, @HEIGHT)

    @canvasCtx.lineWidth = 2

    @canvasCtx.beginPath()

    sliceWidth = @WIDTH * 1.0 / @bufferLength
    x = 0

    # Calculate percentage through the bar to portion the animation
    phrase_beat = do ->
      b = beat + (bar-1) * 4
      if b then return b else return 16

    for i in [0...@bufferLength]
      v = @dataArray[i] / 128.0
      y = v * @HEIGHT / 2

      if i == 0
        @canvasCtx.moveTo(x, y)
      else
        @canvasCtx.lineTo(x, y)
      x += sliceWidth

      # Only draw percentage of animation to denote progress through phrase
      if x / @WIDTH >= phrase_beat / 16
        break

    @canvasCtx.lineTo(@canvas.width, @canvas.height / 2)
    @canvasCtx.stroke()

# Core utility function definitions

startPlayback = ->
  debug_starttime = context.currentTime
  Instrument.reset()
  s.phrase_eval() for s in SoundNode.canvas_instances
  instrument.play(context.currentTime) for instrument in Instrument.instances
    # this may be unnecessarily iterating over all instruments, not just live

  # start loop to keep beat labels in UI up to date
  beat_increment()
  
  # change analyser colour back to black
  analyser.set_black()
  # Set dispatch to change colour to red to indicate refreshing
  setTimeout(->
    analyser.set_red()
  , (tempo * 16 - tempo * 2))

  # Timer to keep in loop
  setTimeout(->

    # Log the diff against when the callback was expected to occur
    console.log("Variance on expected was: " +
      (
        ( (debug_starttime + (tempo * 16 / 1000)) - context.currentTime ) * 1000
      ) + " milliseconds."
    )
    startPlayback()
  , tempo * 16)
  
  # Log the time to compute the scheduler function
  console.log("Computation was: " +
    (
      ( (context.currentTime - debug_starttime) * 1000 )
    ) + " milliseconds."
  )

beat_increment = ->
  # only set time-out within a bar
  # the auto-reload of the phrase will trigger the call
  beat += 1
  update_beat_labels()
  switch
    when bar == 4 and beat == 4
      beat = 0
      bar = 1
      phrase += 1
    when bar != 4 and beat == 4
      beat = 0
      bar += 1
      setTimeout(-> # TODO: async bug here, might be from tab switching
        beat_increment()
      , tempo)
    else # in the middle of a bar
      setTimeout(->
        beat_increment()
      , tempo)

# Preloader function definitions

main = ->
  window.AudioContext = window.AudioContext || window.webkitAudioContext
  context = new AudioContext()

  # sources go into output_chain for "master" manipulation
  output_chain = context.createGain()
  # after all "master" controls, final_gain goes to output
  final_gain = context.createGain()
  
  # initiate the analyser
  analyser = new JGAnalyser()
  analyser.draw()

  # Wire up the components
  output_chain.connect(analyser.node)
  analyser.node.connect(final_gain)
  final_gain.connect(context.destination)


  # async load sample data from JSON
  $.getJSON("static/sampledata.json", (result) ->
    sample_data = result

    # Init all the Instrument and SoundNode objects
    new Instrument(d, v, output_chain) for d, v of sample_data
    i.load() for i in Instrument.instances
    SoundNode.tray_instances.push(
      new SoundNode(i)
    ) for i in Instrument.instances # calls into lang.coffee
    ui_init()  # Initialise the button listeners

    # TODO: BUG Safari only: first page load doesn't start playing automatically
    # closer to fixing it using this indented callback but not quite
    init_samples = ->
      ready = true
      for i in Instrument.instances
        if not i.is_loaded()
          ready = false
      if not ready
        $('#samples-loading').modal('show')
        console.log("Still loading: " + (
          " " + i.name for i in Instrument.instances when not i.is_loaded()
          )
        )
        setTimeout(init_samples, 1000)
      else
        console.log("All samples loaded.")
        $('#samples-loading').modal('hide')

    init_samples()
  )

