export default function UnitchartGridLayout(aqTable, canvas, simulation) {
  simulation.stop();
  // CANVAS SETUP
  let margin = {
      top: 100,
      right: 100,
      bottom: 100,
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

  const tooltip = d3.select("#tooltipContainer");

  g3.transition().duration(750).attr("opacity", 0);
  gx.attr("opacity", 1);
  gy.attr("opacity", 1);
  g1.attr("opacity", 1);
  gm.attr("transform", `translate(${margin.left},${margin.top})`);
  g1.transition()
    .duration(750)
    .attr("transform", `translate(${margin.left},${margin.top})`);
  g2.transition()
    .duration(750)
    .attr("transform", `translate(${margin.left},${margin.top})`);
  g3.attr("transform", `translate(${margin.left},${margin.top})`);

  // DATA MANIPULATE

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

  const data = aqTable25.orderby("id").objects();

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
    .range([0, width - canvas.attr("width") * 0.4])
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

      // exit.remove();

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

  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------

  const data2 = aqTable25
    .fold(atLeast25GroIssArray)
    .filter((d) => d.value == 1)
    .derive({
      groups_or_issues: aq.escape((d) =>
        atLeast25GroupsArray.includes(d.key) ? "groups" : "issues"
      ),
    })
    .groupby("key")
    .derive({ value_stackmax: aq.rolling((d) => op.sum(d.value)) })
    .derive({ value_stackmin: (d) => op.lag(d.value_stackmax, 1, 0) })
    .orderby("key", "id")
    .objects({ grouped: "entries" })
    .sort((a, b) => a[1].at(-1).value_stackmax - b[1].at(-1).value_stackmax);

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

  let promiseQueue = [];

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

      const rectEnterTransition = rectEner
        .transition()
        .duration(500)
        .delay((d, i) => d.id * 2)
        .style("opacity", 1);

      if (!rectEnterTransition.empty()) {
        promiseQueue.push(rectEnterTransition.end());
      }

      return rectEnterTransition;
    },
    function (update) {
      const rectUpdateTransition = update
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

      if (!rectUpdateTransition.empty()) {
        promiseQueue.push(rectUpdateTransition.end());
      }
      return rectUpdateTransition;
    },
    function (exit) {
      const rectExitTransition = exit.transition().style("opacity", 0);

      exit.remove();

      if (!rectExitTransition.empty()) {
        promiseQueue.push(rectExitTransition.end());
      }
      return rectExitTransition;
    }
  );

  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------

  gx.attr("transform", `translate(${margin.left},${margin.top + height})`);
  gy.attr(
    "transform",
    `translate(${margin.left + canvas.attr("width") * 0.52},${margin.top})`
  );

  const xValue3 = (d) => d[0];
  const yValue3 = (d) => d.value_stackmax;

  const xScale3 = d3
    .scaleLinear()
    .domain([0, d3.max(data2.map((d) => d[1]).flat(), yValue3)])
    .range([canvas.attr("width") * 0.52, width])
    .nice();

  const yScale3 = d3
    .scaleBand()
    .domain(data2.map(xValue3))
    .range([height, 0])
    .padding(0.2);

  gx.transition().call(d3.axisBottom(xScale3));

  gy.transition()
    .call(d3.axisLeft(yScale3))
    .call(function (g) {
      g.selectAll("line").remove();
      g.selectAll("text").style("text-anchor", "start").attr("x", 6);
      return g;
    });

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

  console.log(data3);

  function morphRect() {
    g2.selectAll(".morphRectGroups").select(function () {
      const newNode = document.getElementById("morphGroup");
      return newNode.appendChild(this.cloneNode(true));
    });

    // g2.transition().duration(750).attr("opacity", 0);
    gm.transition().duration(750).attr("opacity", 1);

    gy.raise();
    const morphRectClonedGroups = gm
      .selectAll("g")
      .data(data2, (d) => d[0])
      .join("g")
      .attr("class", (d) => `morphRectClonedGroups ${d[0]}`);

    const morphClonedRectGroup = morphRectClonedGroups
      .selectAll("rect")
      .data((d) => d[1]);

    morphClonedRectGroup.join(
      function (enter) {
        return enter;
      },
      function (update) {
        const rectUpdateTransition = update
          .transition()
          .ease(d3.easeExpIn)
          .delay(
            (d, i) => (keyArray.length - keyArray.indexOf(d.key)) * 500 + i * 10
          )
          .attr("stroke", (d) => colorScale(d.key))
          .attr("stroke-width", 10)
          .transition()
          .duration(500)
          .attr("y", (d) => yScale3(d.key))
          .transition()
          .attr("x", (d) => xScale3(d.value_stackmin))
          .attr("height", yScale3.bandwidth())
          .attr(
            "width",
            (d) => xScale3(d.value_stackmax) - xScale3(d.value_stackmin)
          )
          .attr("stroke-width", 0);

        return rectUpdateTransition;
      },
      function (exit) {
        const rectExitTransition = exit.transition().style("opacity", 0);
        exit.remove();
        return rectExitTransition;
      }
    );

    const brect = g3.selectAll("rect").data(data3, (d) => d.key);

    brect
      .join("rect")
      .attr("id", (d, i) => "krect" + d.key)
      .attr("x", (d) => xScale3(0))
      .attr("y", (d) => yScale3(d.key))
      .attr("height", yScale3.bandwidth())
      .attr("fill", (d) => colorScale(d.key))
      .attr("width", (d) => xScale3(d.value_sum) - xScale3(0));
  }

  Promise.all(promiseQueue).then(morphRect);
}
