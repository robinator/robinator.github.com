class Matrix
  constructor: (@options) ->
    @actualFile = 'public/data/actual.json'
    @guessesFile = 'public/data/guesses.json'
    @vis = d3.select('#matrix')
    this.loadActual()

  loadActual: ->
    d3.json @actualFile, (json) =>
      @actual = json
      @maxScore = @actual.length * 2

  process: ->
    for guess in @guesses
      guess.score = 0
      for pick, i in guess.picks
        actual = @actual[i]
        if pick[0] == actual[0]
          guess.score += 1
          guess.score += 1 if pick[1] == actual[1]
        console.log("#{guess.name}(#{i}) - pick: #{pick}, actual: #{actual}, score: #{guess.score} / #{@maxScore}")

  draw: ->
    d3.json @guessesFile, (json) =>
      @guesses = json
      this.process()

      # // Header
      #           var th = d3.select("thead").selectAll("th")
      #                   .data(jsonToArray(data[0]))
      #                 .enter().append("th")
      #                   .attr("onclick", function (d, i) { return "transform('" + d[0] + "');";})
      #                   .text(function(d) { return d[0]; })

      console.log(@guesses)

      tr = d3.select('tbody')
             .selectAll('tr')
             .data(@guesses)
             .enter()
             .append('tr')
             # .sort(function (a, b) { return a == null || b == null ? 0 : stringCompare(a[attrName], b[attrName]); });

      td = tr.selectAll('td')
             .data((d) ->
               arr = d.picks
               arr.unshift(d.score)
               arr.unshift(d.name)
               arr
             )
             .enter()
             .append('td')
             .classed('wrong', (d) -> typeof d != 'string' && false)
             .classed('right', (d) -> typeof d != 'string' && false)
             .classed('and1', (d) -> typeof d != 'string' && false)
             .classed('name', (d) -> typeof d == 'string')
             .text((d) =>
               if typeof d == 'string'
                 d
               else if typeof d == 'number'
                 "#{d} / #{@maxScore}"
               else
                 "#{d[0]} in #{d[1]}"
             )
             #.attr("onclick", function (d, i) { return "transform('" + d[0] + "');";})

      # for name, picks in @data
      #        console.log(name)
      #        @vis.select('table')
      #            .selectAll('tr')
      #            .enter()
      #            .append('tr')
      #            .text('poop')

window.matrix = new Matrix

#matrix.process()
matrix.draw()