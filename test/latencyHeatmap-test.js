var tape = require("tape"),
    d3 = require("../"),
    d3c = require("d3-color");

tape("latencyHeatmap() initialized with expected defaults per documentation", function(test) {
  var chart = d3.latencyHeatmap();
  test.deepEqual(chart.colorRange(), [d3c.rgb('#FFFFFF'), d3c.rgb('#F03524')]);
  test.equal(chart.height(), 400);
  test.equal(chart.width(), 600);
  test.end();
});