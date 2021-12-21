export default function UnitChartForceLayout(aqTable, canvas, simulation) {
  // CANVAS SETUP
  const margin = {
      top: 100,
      right: 100,
      bottom: 100,
      left: 100,
    },
    width = canvas.attr("width") - margin.left - margin.right,
    height = canvas.attr("height") - margin.top - margin.bottom;

  const g1 = canvas.select("#figure1Group"),
    g2 = canvas.select("#figure2Group"),
    g3 = canvas.select("#figure3Group"),
    gm = canvas.select("#morphGroup"),
    gx = canvas.select("#xAxisGroup"),
    gy = canvas.select("#yAxisGroup");

  const t = canvas.transition().duration(500);

  g1.transition(t).attr("transform", `translate(${margin.left},${margin.top})`);

  // gx.transition(t).attr("opacity", 0);
  // gy.transition(t).attr("opacity", 0);

  // DATA MANIPULATE
  const size = (d) => 10;

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
    .force("x", d3.forceX(width * 0.1).strength(0.1))
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
            .transition(t)
            .attr("opacity", 1)
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y)
            .attr("width", (d) => size(d))
            .attr("height", (d) => size(d))
        ),
    (update) =>
      update.call((update) =>
        update
          .transition(t)
          .style("opacity", 1)
          .attr("width", (d) => size(d))
          .attr("height", (d) => size(d))
      ),
    (exit) =>
      exit.call((exit) =>
        exit
          .transition(t)
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
