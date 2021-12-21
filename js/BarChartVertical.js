export default function BarChartVertical(aqTable, canvas, simulation) {
  simulation.stop();
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

    gm.transition()
      .duration(750)
      .attr("opacity", 0)
      .end()
      .then(gm.selectAll("*").remove());

    g3.transition()
      .duration(750)
      .style("opacity", 1)
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const groupKey = "key3";

    const data3 = aqTable
      .groupby(groupKey)
      .rollup({ value_sum: (d) => op.sum(d.value) })
      .orderby("value_sum")
      .objects();

    const xScale3 = d3
      .scaleLinear()
      .domain([0, d3.max(data3, (d) => d.value_sum)])
      .range([0, width])
      .nice();

    const yScale3 = d3
      .scaleBand()
      .domain(data3.map((d) => d[groupKey]))
      .range([height, 0])
      .padding(0.2);

    gx.transition()
      .duration(750)
      .style("opacity", 1)
      .call(d3.axisBottom(xScale3))
      .attr("transform", `translate(${margin.left},${margin.top + height})`);

    gy.transition()
      .duration(750)
      .style("opacity", 1)
      .call(d3.axisLeft(yScale3))
      .call(function (g) {
        g.selectAll("line").remove();
        g.selectAll("text").style("text-anchor", "start").attr("x", 6);
        return g;
      })
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const keyArray = Array.from(new Set(data3.map((d) => d[groupKey])));

    // const colorScale = d3
    //   .scaleOrdinal()
    //   .domain(keyArray)
    //   .range(
    //     d3
    //       .range(1, keyArray.length)
    //       .map((v) => d3.interpolateTurbo(v / keyArray.length))
    //   );

    const colorScale = d3
      .scaleOrdinal()
      .domain([
        "firstnations",
        "racialminorities",
        "women",
        "children",
        "youngpeople",
        "unemployedorprecariouslyemployed",
        "peoplewithdisabilitiesorchronichealthconditions",
        "shelter",
        "healthcare_health",
        "familyrelations",
        "violence",
        "voice",
        "work",
        "crime_criminaljustice",
        "inequality",
        "prejudiceanddiscrimination_general",
      ])
      .range(d3.range(1, 17).map((v) => d3.interpolateTurbo(v / 16)));

    console.log(data3);

    const rect = g3.selectAll("rect").data(data3, (d) => d[groupKey]);

    rect.join(
      (enter) =>
        enter
          .append("rect")
          .attr("id", (d) => d[groupKey])
          .attr("fill", (d) => colorScale(d[groupKey]))
          // .style("mix-blend-mode", "multiply")
          .attr("x", (d) => xScale3(0))
          .attr("y", (d) => yScale3(d[groupKey]))
          .attr("height", yScale3.bandwidth())
          .call((enter) =>
            enter
              .transition()
              .duration(750)
              .attr("width", (d) => xScale3(d.value_sum) - xScale3(0))
          ),
      (update) =>
        update.call((update) =>
          update
            .transition()
            .duration(750)
            .attr("fill", (d) => colorScale(d[groupKey]))
            .attr("y", (d) => yScale3(d[groupKey]))
            .attr("height", yScale3.bandwidth())
            .transition()
            .duration(750)
            .attr("x", (d) => xScale3(0))
            .attr("width", (d) => xScale3(d.value_sum) - xScale3(0))
        ),
      (exit) =>
        exit.call((exit) =>
          exit
            .transition()
            .duration(750)
            .attr("height", 0)
            .attr("y", height)
            .remove()
        )
    );
  }

  chart.margin = function (value) {
    if (!arguments.length) return margin;
    margin = value;
    return chart;
  };

  return chart;
}
