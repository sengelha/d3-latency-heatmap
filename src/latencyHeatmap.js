import {extent} from "d3-array";
import {axisBottom, axisLeft} from "d3-axis";
import {nest} from "d3-collection";
import {rgb} from "d3-color";
import {interpolateRgb} from "d3-interpolate";
import {scaleLinear, scaleTime} from "d3-scale";

export default function() {
    var margin = { top: 1, right: 1, bottom: 11, left: 1 },
    width = 600,
    height = 400,
    rectSize = undefined,
    xAccessor = function (d) { return d[0]; },
    xFormat = undefined,
    yAccessor = function (d) { return d[1]; },
    yFormat = undefined,
    countAccessor = function (d) { return d[2]; },
    tooltipText = undefined,
    colorRange = [rgb('#FFFFFF'), rgb('#F03524')],
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
            var nCols = nest()
                .key(function (d) { return d[0] })
                .entries(data)
                .length;
            var nRows = nest()
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
            var xExtent = extent(data, function (d) { return d[0]; });
            var yExtent = extent(data, function (d) { return d[1]; });
            var countExtent = extent(data, function (d) { return d[2]; });

            var xScale = scaleTime()
                .domain(xExtent)
                .range([0, contentWidth - rectSize[0]]);
            var yAxisScale = scaleLinear()
                .domain(yExtent)
                .range([contentHeight, 0]);
            var yContentScale = scaleLinear()
                .domain(yExtent)
                .range([contentHeight - rectSize[1], 0]);
            var countScale = scaleLinear()
                .domain(countExtent)
                .interpolate(interpolateRgb)
                .range(colorRange);

            // Select the svg element, if it exists.
            var svg = selection
                .selectAll("svg")
                .data([data]);
            // Otherwise, create the skeletal chart.
            var g = svg.enter()
                .append("svg")
                .append("g");
            g.append("g").attr("class", "elems");
            g.append("g").attr("class", "x axis");
            g.append("g").attr("class", "y axis");
            svg = selection.selectAll("svg");
            
            // Update the outer dimensions.
            svg.attr("width", width)
                .attr("height", height);

            // Draw the rectangles
            var gElems = svg.select('.elems')
                .attr('class', 'elems')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            var update = gElems
                .selectAll("rect")
                .data(data);
            var enter = update.enter();
            var exit = update.exit();
            // Remove old elements not present in new data
            exit.remove();
            // Update old elements
            update
                .attr("x", function (d) { return xScale(d[0]); })
                .attr("y", function (d) { return yContentScale(d[1]); })
                .attr("fill", function (d) { return countScale(d[2]); });
            if (tooltipText) {
                update
                    .selectAll('title')
                    .html(function (d) { return tooltipText(d); });
            }
            // Create new elements
            var newRects = enter
                .append("rect")
                .attr("x", function (d) { return xScale(d[0]); })
                .attr("y", function (d) { return yContentScale(d[1]); })
                .attr("width", rectSize[0])
                .attr("height", rectSize[1])
                .attr("fill", function (d) { return countScale(d[2]); });
            if (tooltipText) {
                newRects
                    .append("title")
                    .html(function (d) { return tooltipText(d) });
            }
                
            // Update the x-axis
            var xAxisDef = axisBottom(xScale)
                .tickSizeInner(-contentHeight)
                .tickSizeOuter(0);
            if (xFormat)
                xAxisDef.tickFormat(xFormat);
            var xAxis = g.select(".x.axis")
                .attr("transform", "translate(0," + contentHeight + ")")
                .style("font-size", axisFontSizePx + "px")
                .call(xAxisDef);
            // Remove axis line
            xAxis.selectAll("path").remove();
            // Update color of axis lines
            xAxis.selectAll("line")
                .style("shape-rendering", "crispEdges")
                .style("stroke", axisColor);
            // Update color of axis labels
            xAxis.selectAll("text")
                .style("text-anchor", "start")
                .style("fill", xAxisTextColor);

            // Update the y-axis
            var yAxisDef = axisLeft(yAxisScale)
                .tickSizeInner(-contentWidth)
                .tickSizeOuter(0)
                .ticks(1);
            if (yFormat)
                yAxisDef.tickFormat(yFormat);
            var yAxis = g.select(".y.axis")
                .style("font-size", axisFontSizePx + "px")
                .call(yAxisDef);
            // Remove axis line
            yAxis.selectAll("path").remove();
            // Update color of axis lines
            yAxis.selectAll("line")
                .style("shape-rendering", "crispEdges")
                .style("stroke", axisColor);
            // Update color of axis labels
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

    chart.tooltipText = function (_) {
        if (!arguments.length) return tooltipText;
        tooltipText = _;
        return chart;
    }

    return chart;
}