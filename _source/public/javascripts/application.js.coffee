$(document).ready () ->
	paper = Raphael 'paper', 900, 500
	line = paper.rect(50, 50, 10, 300).attr {stroke: 'none', fill: '#38d84e'}