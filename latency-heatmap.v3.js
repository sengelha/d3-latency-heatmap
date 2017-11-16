(function () {
    d3.latencyHeatmap = function () {
        var margin = { top: 1, right: 1, bottom: 11, left: 1 },
            width = 600,
            height = 400,
            rectSize = undefined,
            xAccessor = function (d) { return d[0]; },
            xFormat = undefined,
            yAccessor = function (d) { return d[1]; },
            yFormat = undefined,
            countAccessor = function (d) { return d[2]; },
            colorRange = [d3.rgb('#FFFFFF'), d3.rgb('#F03524')],
            axisColor = "#ddd",
            xAxisTextColor = "#999",
            yAxisTextColor = "#000",
            axisFontSizePx = 11;

        function chart(selection) {
            selection.each(function (data) {
                // Convert data to standard representation
                data = data.map(function (d, i) {
                    return [xAccessor.call(data, d, i), yAccessor.call(data, d, i), countAccessor.call(data, d, i)];
                });

                // If rectSize is undefined, its dynamically calculated based
                // on width & height.  Otherwise, width & height are dynamically
                // calculated based on rectSize.
                var nCols = d3.nest()
                    .key(function (d) { return d[0] })
                    .entries(data)
                    .length;
                var nRows = d3.nest()
                    .key(function (d) { return d[1] })
                    .entries(data)
                    .length;
                if (rectSize) {
                    width = rectSize[0] * nCols + margin.left + margin.right;
                    height = rectSize[1] * nRows + margin.top + margin.bottom;
                } else {
                    rectSize = [(width - margin.left - margin.right) / nCols, (height - margin.top - margin.bottom) / nRows];
                }

                var contentWidth = width - margin.left - margin.right,
                    contentHeight = height - margin.top - margin.bottom;

                // Calculate all the extents once
                var xExtent = d3.extent(data, function (d) { return d[0]; });
                var yExtent = d3.extent(data, function (d) { return d[1]; });
                var countExtent = d3.extent(data, function (d) { return d[2]; });

                var xScale = d3.time.scale()
                    .domain(xExtent)
                    .range([0, contentWidth - rectSize[0]]);
                var yAxisScale = d3.scale.linear()
                    .domain(yExtent)
                    .range([contentHeight, 0]);
                var yContentScale = d3.scale.linear()
                    .domain(yExtent)
                    .range([contentHeight - rectSize[1], 0]);
                var countScale = d3.scale.linear()
                    .domain(countExtent)
                    .interpolate(d3.interpolateRgb)
                    .range(colorRange);

                // Create the axis definitions using the scale
                var xAxisDef = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .innerTickSize(-contentHeight)
                    .outerTickSize(0);
                if (xFormat)
                    xAxisDef.tickFormat(xFormat);
                var yAxisDef = d3.svg.axis()
                    .scale(yAxisScale)
                    .orient("left")
                    .innerTickSize(-contentWidth)
                    .outerTickSize(0)
                    .ticks(1);
                if (yFormat)
                    yAxisDef.tickFormat(yFormat);

                // Select the svg element, if it exists.
                var svg = d3.select(this).selectAll("svg").data([data]);
                // Otherwise, create the skeletal chart.
                var gEnter = svg.enter().append("svg").append("g");
                gEnter.append("g").attr("class", "elems");
                gEnter.append("g").attr("class", "x axis");
                gEnter.append("g").attr("class", "y axis");
                
                // Update the outer dimensions.
                svg.attr("width", width)
                    .attr("height", height);

                // Update the inner dimensions.
                var g = svg.select("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                // Update the individual points
                var nodes = g.select(".elems")
                    .selectAll("rect")
                    .data(data);
                // Update old elements
                nodes
                    .attr("x", function (d) { return xScale(d[0]); })
                    .attr("y", function (d) { return yContentScale(d[1]); })
                    .attr("fill", function (d) { return countScale(d[2]); });
                // Create new elements
                nodes.enter()
                    .append("rect")
                    .attr("x", function (d) { return xScale(d[0]); })
                    .attr("y", function (d) { return yContentScale(d[1]); })
                    .attr("width", rectSize[0])
                    .attr("height", rectSize[1])
                    .attr("fill", function (d) { return countScale(d[2]); });
                // Remove old elements
                nodes.exit()
                    .remove();
                    
                // Update the x-axis
                var xAxis = g.select(".x.axis")
                    .attr("transform", "translate(0," + contentHeight + ")")
                    .style("font-size", axisFontSizePx + "px")
                    .call(xAxisDef);
                xAxis.selectAll("line")
                    .style("shape-rendering", "crispEdges")
                    .style("stroke", axisColor);
                xAxis.selectAll("text")
                    .style("text-anchor", "start")
                    .style("fill", xAxisTextColor);

                // Update the y-axis
                var yAxis = g.select(".y.axis")
                    .style("font-size", axisFontSizePx + "px")
                    .call(yAxisDef);
                yAxis.selectAll("line")
                    .style("shape-rendering", "crispEdges")
                    .style("stroke", axisColor);
                yAxis.selectAll(".tick text")
                    .attr("x", 2)
                    .style("text-anchor", "start")
                    .style("fill", yAxisTextColor);
                yAxis.selectAll(".tick:last-of-type text")
                    .attr("y", 8);
                yAxis.selectAll(".tick:first-of-type text")
                    .attr("y", -8);
            });
        }

        chart.width = function (_) {
            if (!arguments.length) return width;
            width = _;
            return chart;
        }

        chart.height = function (_) {
            if (!arguments.length) return height;
            height = _;
            return chart;
        }

        chart.rectSize = function (_) {
            if (!arguments.length) return rectSize;
            rectSize = _;
            return chart;
        }

        chart.x = function (_) {
            if (!arguments.length) return xAccessor;
            xAccessor = _;
            return chart;
        }

        chart.y = function (_) {
            if (!arguments.length) return yAccessor;
            yAccessor = _;
            return chart;
        }

        chart.count = function (_) {
            if (!arguments.length) return countAccessor;
            countAccessor = _;
            return chart;
        }

        chart.xFormat = function (_) {
            if (!arguments.length) return xFormat;
            xFormat = _;
            return chart;
        }

        chart.yFormat = function (_) {
            if (!arguments.length) return yFormat;
            yFormat = _;
            return chart;
        }

        chart.colorRange = function (_) {
            if (!arguments.length) return colorRange;
            colorRange = _;
            return chart;
        }

        return chart;
    };
})();