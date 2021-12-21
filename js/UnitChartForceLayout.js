export default function UnitChartForceLayout(aqTable, canvas, simulation) {
  // CANVAS SETUP
  let margin = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100,
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

    g1.transition()
      .duration(500)
      .style("opacity", 1)
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // DATA MANIPULATE
    const size = (d) => 25;

    let data = aqTable.objects();

    data.forEach(function (d) {
      d.x = +d3.select("#rect" + d.id).attr("x");
      d.y = +d3.select("#rect" + d.id).attr("y");
    });

    const rect = g1.selectAll("rect").data(data, (d) => d.id);

    simulation
      .nodes(data, (d) => d.id)
      .force(
        "collide",
        d3.forceCollide().radius((d) => 1 + size(d))
      )
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.05))
      .alpha(0.8)
      .stop();

    rect.join(
      (enter) =>
        enter
          .append("rect")
          .attr("y", height * 2)
          .call((enter) =>
            enter
              .transition()
              .duration(500)
              .attr("opacity", 1)
              .attr("x", (d) => d.x)
              .attr("y", (d) => d.y)
              .attr("width", (d) => size(d))
              .attr("height", (d) => size(d))
          ),
      (update) =>
        update.call((update) =>
          update
            .transition()
            .duration(500)
            .style("opacity", 1)
            .attr("width", (d) => size(d))
            .attr("height", (d) => size(d))
        ),
      (exit) =>
        exit.call((exit) =>
          exit
            .transition()
            .duration(750)
            .attr("opacity", 0)
            .attr("y", (d) => -height)
        )
    );

    const ticked = () => {
      console.log("tick");
      rect.attr("x", (d) => d.x).attr("y", (d) => d.y);
    };

    simulation.on("tick", ticked).restart();
  }

  chart.margin = function (value) {
    if (!arguments.length) return margin;
    margin = value;
    return chart;
  };

  return chart;
}
