export default function UnitchartGridLayoutKey(aqTable, canvas, simulation) {
  // CANVAS SETUP
  let margin = {
    top: 100,
    right: 400,
    bottom: 100,
    left: 400,
  };

  function chart() {
    const width = canvas.attr("width") - margin.left - margin.right,
      height = canvas.attr("height") - margin.top - margin.bottom;

    const g1 = canvas.select("#figure1Group"),
      g2 = canvas.select("#figure2Group"),
      g3 = canvas.select("#figure3Group"),
      gm = canvas.select("#morphGroup"),
      gx = canvas.select("#xAxisGroup"),
      gy = canvas.select("#yAxisGroup");

    g2.transition()
      .duration(750)
      .style("opacity", 1)
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // DATA MANIPULATE

    const data = aqTable.orderby("id").objects();

    // RENDER PREPERATION

    const gap = 0.1;

    const idArray = Array.from(new Set(data.map((d) => d.id)));

    const bin =
      idArray.length == 1
        ? 1
        : Math.max(4, Math.floor(Math.sqrt(idArray.length)));

    const xValue = (d) => idArray.indexOf(d.id) % bin;

    const yValue = (d) => Math.floor(idArray.indexOf(d.id) / bin);

    const xScale = d3
      .scaleBand()
      .domain(data.map(xValue))
      .range([0, width])
      .padding(gap);

    const yScale = d3
      .scaleBand()
      .domain(data.map(yValue))
      .range([0, height])
      .padding(gap);

    // RENDER

    let groupKey = "key3";

    const data2 = aqTable
      .groupby(groupKey)
      .orderby("id")
      .objects({ grouped: "entries" });

    const keyArray = Array.from(new Set(data2.map((d) => d[0])));

    const bin2 = Math.floor(Math.sqrt(keyArray.length));

    const xValue2 = (d) =>
      d[groupKey]
        ? keyArray.indexOf(d[groupKey]) % bin2
        : keyArray.indexOf(d[0]) % bin2;

    const yValue2 = (d) =>
      d[groupKey]
        ? Math.floor(keyArray.indexOf(d[groupKey]) / bin2)
        : Math.floor(keyArray.indexOf(d[0]) / bin2);

    const xScale2 = d3
      .scaleBand()
      .domain(data2.map(xValue2))
      .range([0, xScale.bandwidth()])
      .padding(0);

    const yScale2 = d3
      .scaleBand()
      .domain(data2.map(yValue2))
      .range([0, yScale.bandwidth()])
      .padding(0);

    const colorScale = d3
      .scaleOrdinal()
      .domain(keyArray)
      .range(
        d3
          .range(1, keyArray.length)
          .map((v) => d3.interpolateTurbo(v / keyArray.length))
      );

    // RENDER

    const morphRectGroups = g2
      .selectAll("g")
      .data(data2, (d) => d[0])
      .join("g")
      .attr("class", (d) => `morphRectGroups ${d[0]}`);

    morphRectGroups.exit().transition().style("opacity", 0).remove();

    const morphRectGroup = morphRectGroups.selectAll("rect").data(
      (d) => d[1],
      (d) => d.id
    );

    morphRectGroup.join(
      function (enter) {
        const rectEner = enter
          .append("rect")
          .attr("class", (d, i) => "mrect" + d.id)
          .attr("x", (d, i) =>
            idArray.length < 3
              ? xScale(xValue(d)) +
                Math.max(
                  0,
                  xScale.bandwidth() * Math.random() -
                    Math.min(300, xScale2.bandwidth())
                )
              : xScale(xValue(d)) + xScale2(xValue2(d))
          )
          .attr("y", (d) => yScale(yValue(d)) + yScale2(yValue2(d)))
          .attr("height", Math.min(25, yScale2.bandwidth()))
          .attr("width", Math.min(300, xScale2.bandwidth()))
          .style("opacity", 0)
          .attr("fill", (d) => colorScale(d[groupKey]));

        rectEner
          .transition()
          .duration(500)
          .delay((d, i) => d.id * 2)
          .style("opacity", 1);

        return rectEner;
      },
      function (update) {
        return update
          .transition()
          .duration(750)
          .attr("x", (d, i) =>
            idArray.length < 3
              ? xScale(xValue(d)) +
                Math.max(
                  0,
                  xScale.bandwidth() * Math.random() -
                    Math.min(300, xScale2.bandwidth())
                )
              : xScale(xValue(d)) + xScale2(xValue2(d))
          )
          .attr("y", (d) => yScale(yValue(d)) + yScale2(yValue2(d)))
          .attr("height", Math.min(25, yScale2.bandwidth()))
          .attr("width", Math.min(300, xScale2.bandwidth()))
          .style("opacity", 1)
          .attr("fill", (d) => colorScale(d[groupKey]));
      },
      function (exit) {
        return exit.call((exit) =>
          exit.transition().style("opacity", 0).remove()
        );
      }
    );
  }

  chart.margin = function (value) {
    if (!arguments.length) return margin;
    margin = value;
    return chart;
  };

  return chart;
}
