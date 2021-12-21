export default function HorizontalBarChart(aqTable, canvas, simulation) {
  simulation.stop();
  // CANVAS SETUP
  let margin = {
      top: 100,
      right: 100,
      bottom: 150,
      left: 100,
    },
    width = canvas.attr("width") - margin.left - margin.right,
    height = canvas.attr("height") - margin.top - margin.bottom,
    gap = 0.1;

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
  g3.attr("opacity", 1);
  g1.attr("transform", `translate(${margin.left},${margin.top})`);
  g2.attr("transform", `translate(${margin.left},${margin.top})`);
  g3.attr("transform", `translate(${margin.left},${margin.top})`);

  const nonFoldColumns = [
    "id",
    "heading",
    "publisher",
    "amplifiesdisadvantagedvoice",
    "dispargesdisadvantaged",
    "recognisesintersectionality",
    "provideshumanexamples",
    "focusesonsolutions",
  ];

  const GroIssArray = aqTable
    .fold([aq.not(nonFoldColumns)])
    .groupby("key")
    .rollup({ count: (d) => op.sum(d.value) })
    .orderby("key")
    .columnArray("key");

  const atLeast25GroIssArray = aqTable
    .fold([aq.not(nonFoldColumns)])
    .groupby("key")
    .rollup({ count: (d) => op.sum(d.value) })
    .filter((d) => d.count >= 25)
    .orderby(aq.desc("count"))
    .columnArray("key");

  const atLeast25GroupsArray = atLeast25GroIssArray.slice(0, 7);
  const atLeast25IssuessArray = atLeast25GroIssArray.slice(7);

  const aqTable25 = aqTable
    .select(nonFoldColumns.concat(atLeast25GroIssArray))
    .fold([aq.not(nonFoldColumns)])
    .groupby(nonFoldColumns)
    .derive({ sum: (d) => op.sum(d.value) })
    .filter((d) => d.sum != 0)
    .pivot("key", "value");

  const data3 = aqTable25
    .fold(atLeast25GroIssArray)
    .filter((d) => d.value == 1)
    .derive({
      groups_or_issues: aq.escape((d) =>
        atLeast25GroupsArray.includes(d.key) ? "groups" : "issues"
      ),
    })
    .groupby("key", "groups_or_issues")
    .rollup({ value_sum: (d) => op.sum(d.value) })
    .orderby("value_sum")
    .objects();

  const yScale3 = d3
    .scaleLinear()
    .domain([0, d3.max(data3, (d) => d.value_sum)])
    .range([height, 0])
    .nice();

  const xScale3 = d3
    .scaleBand()
    .domain(data3.map((d) => d.key))
    .range([0, width])
    .padding(0.2);

  gx.transition()
    .duration(750)
    .attr("transform", `translate(${margin.left},${margin.top + height})`)
    .call(d3.axisBottom(xScale3))
    .call(function (g) {
      g.selectAll("text")
        .style("text-anchor", "start")
        .attr("transform", "rotate(15)");
      return g;
    });

  gy.transition()
    .duration(750)
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .call(d3.axisLeft(yScale3))
    .call(function (g) {
      g.selectAll("text").style("text-anchor", "start").attr("x", -34);
      return g;
    });

  const colorScale = d3
    .scaleOrdinal()
    .domain(GroIssArray)
    .range(
      d3
        .range(1, GroIssArray.length)
        .map((v) => d3.interpolateTurbo(v / GroIssArray.length))
    );

  const brect = g3.selectAll("rect").data(data3, (d) => d.key);

  brect.join(
    (enter) =>
      enter
        .append("rect")
        .attr("fill", (d) => colorScale(d.key))
        .style("mix-blend-mode", "multiply")
        .attr("y", height)
        .attr("x", (d) => xScale3(d.key))
        .attr("width", xScale3.bandwidth())
        .call((enter) =>
          enter
            .transition()
            .duration(750)
            .attr("y", (d) => yScale3(d.value_sum))
            .attr("height", (d) => height - yScale3(d.value_sum))
        ),
    (update) =>
      update.call((update) =>
        update
          .transition()
          .duration(750)
          .attr("width", xScale3.bandwidth())
          .attr("x", (d) => xScale3(d.key))
          .transition()
          .duration(750)
          .attr("y", (d) => yScale3(d.value_sum))
          .attr("height", (d) => height - yScale3(d.value_sum))
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
