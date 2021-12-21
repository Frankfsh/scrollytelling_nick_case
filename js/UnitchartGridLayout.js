export default function UnitchartGridLayout(aqTable, canvas, simulation) {
  // CANVAS SETUP
  let margin = {
      top: 100,
      right: 400,
      bottom: 100,
      left: 400,
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

  const tooltip = d3.select("#tooltipContainer");

  gm.selectAll("*").remove();
  g1.transition()
    .duration(750)
    .attr("transform", `translate(${margin.left},${margin.top})`);
  g2.transition()
    .duration(750)
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // DATA MANIPULATE

  const GroIssArray = aqTable
    .fold([
      aq.not(
        "id",
        "heading",
        "publisher",
        "amplifiesdisadvantagedvoice",
        "dispargesdisadvantaged",
        "recognisesintersectionality",
        "provideshumanexamples",
        "focusesonsolutions"
      ),
    ])
    .groupby("key")
    .rollup({ count: (d) => op.sum(d.value) })
    .orderby("key")
    .columnArray("key");

  const data = aqTable.orderby("id").objects();

  // RENDER PREPERATION

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

  const rect = g1.selectAll("rect").data(data, (d) => d.id);

  rect.join(
    function (enter) {
      const rectEner = enter
        .append("rect")
        .attr("id", (d, i) => "rect" + d.id)
        .attr("stroke", "none")
        .attr("x", (d, i) => xScale(xValue(d)))
        .attr("y", (d, i) => yScale(yValue(d)))
        .attr("width", xScale.bandwidth());
      const rectEnterTransition = rectEner
        .transition()
        .duration(750)
        .style("opacity", 1)
        .attr("height", yScale.bandwidth());

      return rectEnterTransition;
    },
    function (update) {
      const rectUpdateTransition = update
        .transition()
        .duration(750)
        .attr("height", yScale.bandwidth())
        .attr("width", xScale.bandwidth())
        .attr("x", (d) => xScale(xValue(d)))
        .attr("y", (d) => yScale(yValue(d)))
        .style("opacity", 1);

      return rectUpdateTransition;
    },
    function (exit) {
      const rectExitTransition = exit
        .transition()
        .duration(500)
        .attr("y", (d) => -height);

      return rectExitTransition;
    }
  );

  const rects = g1.selectAll("rect").raise();

  rects
    .on("mouseover", (e, d) => {
      tooltip
        .style("display", "block")
        .html(() => `${d.id} ${d.publisher}<br><b>${d.heading}</b>`);
    })
    .on("mousemove", (e, d) => {
      tooltip
        .style("left", d3.pointer(e)[0] + "px")
        .style("top", d3.pointer(e)[1] + "px");
    })
    .on("mouseout", () => {
      tooltip.style("display", "none");
    })
    .on("click", function (e, d) {
      let stroke_status = d3.select(this).attr("stroke");
      d3.select(this)
        .attr("stroke-width", "3")
        .attr("stroke", stroke_status == "none" ? "red" : "none");
    });

  const data2 = aqTable
    .fold(GroIssArray)
    .filter((d) => d.value == 1)
    .groupby("key")
    .orderby("id")
    .objects({ grouped: "entries" });

  const keyArray = Array.from(new Set(data2.map((d) => d[0])));

  const bin2 = Math.floor(Math.sqrt(keyArray.length));

  const x2Value = (d) => keyArray.indexOf(d[0]) % bin2;

  const y2Value = (d) => Math.floor(keyArray.indexOf(d[0]) / bin2);

  const xScale2 = d3
    .scaleBand()
    .domain(data2.map(x2Value))
    .range([0, xScale.bandwidth()])
    .padding(0);

  const yScale2 = d3
    .scaleBand()
    .domain(data2.map(y2Value))
    .range([0, yScale.bandwidth()])
    .padding(0);

  const colorScale = d3
    .scaleOrdinal()
    .domain(GroIssArray)
    .range(
      d3
        .range(1, GroIssArray.length)
        .map((v) => d3.interpolateTurbo(v / GroIssArray.length))
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
            : xScale(xValue(d)) + xScale2(keyArray.indexOf(d.key) % bin2)
        )
        .attr(
          "y",
          (d, i) =>
            yScale(yValue(d)) +
            yScale2(Math.floor(keyArray.indexOf(d.key) / bin2))
        )
        .attr("height", Math.min(25, yScale2.bandwidth()))
        .attr("width", Math.min(300, xScale2.bandwidth()))
        .style("opacity", 0)
        .attr("fill", (d) => colorScale(d.key));

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
            : xScale(xValue(d)) + xScale2(keyArray.indexOf(d.key) % bin2)
        )
        .attr(
          "y",
          (d, i) =>
            yScale(yValue(d)) +
            yScale2(Math.floor(keyArray.indexOf(d.key) / bin2))
        )
        .attr("height", Math.min(25, yScale2.bandwidth()))
        .attr("width", Math.min(300, xScale2.bandwidth()))
        .style("opacity", 1)
        .attr("fill", (d) => colorScale(d.key));
    },
    function (exit) {
      return exit.call((exit) =>
        exit.transition().style("opacity", 0).remove()
      );
    }
  );
}
