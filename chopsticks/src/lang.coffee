###
Author: Jason Gwartz
2016
###

class Wrapper
  # If condition, on_beats, for loop
  @instances = []
  constructor: (@name, extra_html) -> # TODO: create subclasses?
    Wrapper.instances.push(this)
    
    @html = """
      <div class="node node-wrapper panel panel-default" id="#{ @name }">
        <div class="panel-body sn-node-title">#{ @name }</div>
        #{ extra_html }
      </div>
      """

  @parse_input: (str) ->
    re = /(\d+(\.\d+)?)/g # matches all integers and floats
    try # TODO: this implementation means can only schedule 5 phrases, etc
      return (parseFloat(i) for i in str.match(re) when parseFloat(i) < 5)
    catch TypeError
      return []

  eval_input: (jq) -> # parameter is the corresponding jQuery object
    @check(
      jq.find("select").val(),
      jq.find("input").val(),
      jq
    )

class IfConditional extends Wrapper
  name = "If"
  extra_html = """
      <select class="form-control input-xs" id="if-select">
          <option value="beat">Beat</option>
          <option value="bar">Bar</option>
          <option value="phrase">Phrase</option>
        </select>
        <div class="sn-node-title">is</div>
      <input type="text" id="if-input" class="form-control input-xs">
      """
  
  constructor: ->
    super(name, extra_html)


# TODO: for loop not yet implemented
class ForLoop extends Wrapper
  name = "For"
  registered = false
  extra_html = """
        <input type="text" id="for-input" class="form-control input-xs">
        <select class="form-control input-xs" id="for-select">
            <option value="beat">Beats</option>
            <option value="bar">Bars</option>
            <option value="phrase">Phrases</option>
          </select>
  """ # extra html

  constructor: ->
    super(name, extra_html)

  for_loop: (loop_block, number_loops) ->
    if loop_block is "phrases"
      pass()
    else if loop_block is "bars"
      pass()
    else if loop_block is "beats"
      pass()

class SoundNode
  @tray_instances = []
  @canvas_instances = []
  constructor: (@instrument) ->
    @category = @instrument.data.category

    node_number = (
      i for i in SoundNode.canvas_instances when i.instrument is @instrument
      ).length + 1
    
    @id = switch node_number
      when 1 then @instrument.name
      else @instrument.name + node_number

    @wrappers = {
      conditionals: {},
      forloops: {}
    }
    @playing_phrases = []
    @playing_bars = []
    @playing_beats = []

    @html = """
      <div class="node-sample-container
        panel panel-default" id="#{ @id }-container">
      <div class="wrappers">
      </div>
      <div class="node node-sample panel-footer node-toggle" id="#{ @id }">
        <div class=" sn-node-title node-toggle">#{ @id }</div>
      </div>
      </div>
      
      """

  phrase_eval: ->
    if not $("##{ @id }-container").data("live")
      return
    @wrappers = []
    @playing_bars = []
    @playing_beats = []
    for w in $("##{ @id }-container").find(".wrappers").children()
      
      @wrappers.push(
        {
          wrapper: w.id.toLowerCase(),
          range: $(w).find("select").val(),
          input: Wrapper.parse_input($(w).find("input").val()),
          data: $(w).data("Wrapper"),
          live: $(w).data("live")
          jq: $(w)
        }
      )
    @node_eval()

  node_eval: (index = 0) ->
    
    if index >= @wrappers.length
      @play()
      return
    else if not @wrappers[index].live
      @node_eval(index + 1)
      return
    try
    
      switch @wrappers[index].range
        when "phrase" or "phrases"
          @eval_phrase_node(@wrappers[index], index)
        when "bar" or "bars" or "bar"
          @eval_bar_node(@wrappers[index], index)
        
        when "beat" or "beats"
          @eval_beat_node(@wrappers[index], index)

    catch error
      console.log(error)
      return

  eval_bar_node: (node, index, offset = 1) ->
    switch node.wrapper
      when "if"
        if @playing_bars.length != 0
          # filter by if condition
          @playing_bars = (i for i in @playing_bars when i in node.input)

        else
          @playing_bars.push(
            i
          ) for i in node.input when i not in @playing_bars
      when "for"
        @playing_bars.push(
          i
        ) for i in [offset...(
          offset + node.input[0]
          )] when i not in @playing_bars
      # play on downbeat of phrase if no bar or beat specified
    @node_eval(index + 1)

  eval_beat_node: (node, index, start_beat = 1) ->
    switch node.wrapper
      when "if"
        if @playing_beats.length != 0
          new_beats = []
          for i in @playing_beats #@playing_beats
            corrected_beat = do (i) ->
              # corrects for 0-base numbers in a 4-beat system
              if i % 4 > 0
                return i % 4
              else
                return 4
            new_beats.push(i) if corrected_beat % 4 in node.input
            # if beats already added match this node's condition
            @playing_beats = new_beats
        else
          @playing_beats.push(
            beat + (bar - 1) * 4
          ) for beat in node.input for bar in [1..4]
        # algorithm = beat + ( bar - 1 ) * 4
      
      when "for"
        if @playing_beats.length != 0
          for start_beat in @playing_beats

            if @playing_bars.length != 0
              @playing_beats.push(
                beat + (bar - 1) * 4
              ) for beat in [start_beat...start_beat + node.input[0]
              ] for bar in @playing_bars

            else
              @playing_beats.push(
                i
              ) for i in [start_beat...start_beat + node.input[0]]
              # only accept first number from 'for' input
        else
          if @playing_bars.length != 0
            @playing_beats.push(
              beat + (bar - 1) * 4
            ) for beat in [start_beat...start_beat + node.input[0]
            ] for bar in @playing_bars

          else
            @playing_beats.push(
              i
            ) for i in [start_beat...start_beat + node.input[0]]
            # only accept first number from 'for' input

    @node_eval(index + 1)

  eval_phrase_node: (node, index) ->
    # add all input values to playing_phrases
    switch node.wrapper
      when "if"
        @playing_phrases.push(
          i
        ) for i in node.input when i not in @playing_phrases
      when "for"
        if not node.data.registered
          node.data.registered = true
          @playing_phrases.push(
            i # add the phrase + current range
          ) for i in [phrase...(
            phrase + node.input[0]
            )] when i not in @playing_phrases
    @node_eval(index + 1)

  play: ->
    # check if all phrase specifications are older than current/next
      # in which case, ignore phrase markers
    # TODO: this is not fixed yet for old/now unused forloops, phrase-ifs
    phrases_expired = @playing_phrases.every( (i) -> i < phrase )

    if phrase not in @playing_phrases and @playing_phrases.length != 0
      return # don't play this phrase
    else
      if @playing_bars.length != 0 # not empty list
        if @playing_beats.length != 0
          for p in @playing_beats
            if Math.ceil(p / 4) in @playing_bars
            # p // 4 gives bar num, + 1 for off-by-one offset
              @instrument.add(p)
        else
          @instrument.add(
            p
          ) for p in [1..16] by 4 when p // 4 + 1 in @playing_bars
      else
        @instrument.add(p) for p in @playing_beats
