(function () {
    d3.latencyHeatmap = function () {
        var margin = { top: 10, right: 10, bottom: 10, left: 30 },
            width = 600,
            height = 400,
            rectSize = undefined,
            xAccessor = function (d) { return d[0]; },
            yAccessor = function (d) { return d[1]; },
            countAccessor = function (d) { return d[2]; },
            xScale = d3.time.scale(),
            yScale = d3.scale.linear(),
            countScale = d3.scale.linear(),
            xAxis = d3.svg.axis().scale(xScale).orient("bottom").innerTickSize(-height+margin.top+margin.bottom).outerTickSize(0),
            yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(0);

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
                    rectSize = [width / nCols, height / nRows];
                }

                // Update the scales based on the passed-in values
                // Subtracting rectSize[0] and rectSize[1]ensures the last box will
                // fit in the space of the chart
                xScale
                    .domain(d3.extent(data, function (d) { return d[0]; }))
                    .range([0, width - margin.left - margin.right - rectSize[0]]);
                yScale
                    .domain(d3.extent(data, function (d) { return d[1]; }))
                    .range([height - margin.top - margin.bottom - rectSize[1], 0]);
                countScale
                    .domain(d3.extent(data, function (d) { return d[2]; }))
                    .interpolate(d3.interpolateRgb)
                    .range([d3.rgb('#FFFFFF'), d3.rgb('#9E0142')]);

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
                nodes.enter()
                    .append("rect")
                    .attr("x", function (d) { return X(d); })
                    .attr("y", function (d) { return Y(d) - rectSize[1]; })
                    .attr("width", rectSize[0])
                    .attr("height", rectSize[1])
                    .attr("fill", function (d) { return Count(d); });
                nodes.exit()
                    .remove();

                // Update the x-axis
                xAxis = xAxis.innerTickSize(-height);
                g.select(".x.axis")
                    .attr("transform", "translate(0," + yScale.range()[0] + ")")
                    .call(xAxis);

                // Update the y-axis
                g.select(".y.axis")
                    .call(yAxis);
            });
        }

        function X(d) {
            return xScale(d[0]);
        }

        function Y(d) {
            return yScale(d[1]);
        }

        function Count(d) {
            return countScale(d[2]);
        }

        chart.margin = function (_) {
            if (!arguments.length) return margin;
            margin = _;
            return chart;
        };

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

        return chart;
    };
})();