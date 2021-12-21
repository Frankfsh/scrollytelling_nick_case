import UnitchartGridLayoutId from "./js/UnitchartGridLayoutId.js";
import UnitchartGridLayoutKey from "./js/UnitchartGridLayoutKey.js";
import BarChartHorizontal from "./js/BarChartHorizontal.js";
import BarChartVertical from "./js/BarChartVertical.js";
import SankeyChart from "./js/SankeyChart.js";
import UnitChartForceLayout from "./js/UnitChartForceLayout.js";

const main = d3.select("main");
const scrolly = main.select("#scrolly");
const figure = scrolly.select("figure");
const article = scrolly.select("article");
const canvas = figure.append("svg");
const step = article.selectAll(".step");
const scroller = scrollama();
const simulation = d3.forceSimulation();

const data_articleIndentity = await aq.loadCSV(
  "./data/data_articleIndentity.csv"
);
const data_characteristicsScore = await aq.loadCSV(
  "./data/data_characteristicsScore.csv"
);
const data_groupsIssues = await aq.loadCSV("./data/data_groupsIssues.csv");
const data_atLeast25groupsIssues = await aq.loadCSV(
  "./data/data_atLeast25groupsIssues.csv"
);
const data_atLeast25articleIdentity = await aq.loadCSV(
  "./data/data_atLeast25articleIdentity.csv"
);

const handleResize = () => {
  const stepHeight = Math.floor(window.innerHeight * 0.75);

  step.style("height", stepHeight + "px");

  const figureHeight = window.innerHeight;
  const figureMarginTop = (window.innerHeight - figureHeight) / 2;

  figure
    .style("height", figureHeight + "px")
    .style("top", figureMarginTop + "px");

  scroller.resize();

  const containerRect = figure.node().getBoundingClientRect(),
    containerWidth = containerRect.width,
    containerHeight = containerRect.height;

  canvas.attr("width", containerWidth).attr("height", containerHeight);
};

// scrollama event handlers
const handleStepChange = ({ element, direction, index }) => {
  // response = { element, direction, index }

  // add color to current step only
  step.classed("is-active", (_, i) => i === index);
  console.log(element, direction, index);

  switch (index) {
    case 0:
      UnitchartGridLayoutId(
        data_articleIndentity.filter((d) => d.id == 1),
        canvas,
        simulation
      )();
      UnitchartGridLayoutKey(
        data_groupsIssues.filter((d) => d.id == 1),
        canvas,
        simulation
      )();
      break;

    case 1:
      canvas
        .select("#figure3Group")
        .transition()
        .duration(500)
        .style("opacity", 0);
      canvas
        .select("#xAxisGroup")
        .transition()
        .duration(500)
        .style("opacity", 0);
      canvas
        .select("#yAxisGroup")
        .transition()
        .duration(500)
        .style("opacity", 0);

      UnitchartGridLayoutId(
        data_articleIndentity.filter((d) => d.id < 5),
        canvas,
        simulation
      )();
      UnitchartGridLayoutKey(
        data_groupsIssues.filter((d) => d.id < 5),
        canvas,
        simulation
      )();
      break;

    case 2:
      UnitchartGridLayoutId(data_articleIndentity, canvas, simulation).margin({
        top: 100,
        right: 800,
        bottom: 100,
        left: 100,
      })();
      UnitchartGridLayoutKey(data_groupsIssues, canvas, simulation).margin({
        top: 100,
        right: 800,
        bottom: 100,
        left: 100,
      })();

      BarChartVertical(data_groupsIssues, canvas, simulation).margin({
        top: 100,
        right: 100,
        bottom: 100,
        left: 1250,
      })();
      break;

    case 3:
      UnitchartGridLayoutId(
        data_atLeast25articleIdentity,
        canvas,
        simulation
      ).margin({
        top: 100,
        right: 800,
        bottom: 100,
        left: 100,
      })();
      UnitchartGridLayoutKey(
        data_atLeast25groupsIssues,
        canvas,
        simulation
      ).margin({
        top: 100,
        right: 800,
        bottom: 100,
        left: 100,
      })();

      BarChartVertical(data_atLeast25groupsIssues, canvas, simulation).margin({
        top: 100,
        right: 100,
        bottom: 100,
        left: 1250,
      })();

      break;

    case 4:
      canvas
        .select("#figure1Group")
        .selectAll("rect")
        .transition()
        .ease(d3.easeExpIn)
        .duration(500)
        .attr("y", -500)
        .attr("opacity", 0);
      canvas
        .select("#figure2Group")
        .transition()
        .duration(750)
        .style("opacity", 0)
        .end()
        .then(canvas.select("#figure2Group").selectAll("*").remove());

      canvas
        .select("#linksGroup")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .end()
        .then(d3.selectAll(".linkGroup").remove());

      canvas
        .select("#anotationGroup")
        .transition()
        .duration(500)
        .style("opacity", 0);

      BarChartHorizontal(data_atLeast25groupsIssues, canvas, simulation)();
      break;

    case 5:
      canvas
        .select("#xAxisGroup")
        .transition()
        .duration(500)
        .style("opacity", 0);

      canvas
        .select("#yAxisGroup")
        .transition()
        .duration(500)
        .style("opacity", 0);

      simulation.stop();
      SankeyChart(data_atLeast25groupsIssues, canvas, simulation)();

      UnitchartGridLayoutId(
        data_atLeast25articleIdentity,
        canvas,
        simulation
      ).margin({
        top: 100,
        right: 1050,
        bottom: 100,
        left: 100,
      })();
      break;

    case 6:
      SankeyChart(
        data_atLeast25groupsIssues.filter((d) => d.id == 1),
        canvas,
        simulation
      )();

      UnitChartForceLayout(
        data_atLeast25articleIdentity.filter((d) => d.id == 1),
        canvas,
        simulation
      ).margin({
        top: 100,
        right: 1050,
        bottom: 100,
        left: 100,
      })();
      break;

    case 7:
      SankeyChart(
        data_atLeast25groupsIssues.filter((d) => d.id < 5),
        canvas,
        simulation
      )();

      UnitChartForceLayout(
        data_atLeast25articleIdentity.filter((d) => d.id < 5),
        canvas,
        simulation
      ).margin({
        top: 100,
        right: 1050,
        bottom: 100,
        left: 100,
      })();
      break;

    case 8:
      SankeyChart(data_atLeast25groupsIssues, canvas, simulation)();

      UnitChartForceLayout(
        data_atLeast25articleIdentity,
        canvas,
        simulation
      ).margin({
        top: 200,
        right: 1050,
        bottom: 100,
        left: 100,
      })();
      break;

    case 9:
      simulation.stop();
      SankeyChart(data_atLeast25groupsIssues, canvas, simulation)();

      UnitchartGridLayoutId(
        data_atLeast25articleIdentity,
        canvas,
        simulation
      ).margin({
        top: 100,
        right: 1050,
        bottom: 100,
        left: 100,
      })();
      break;

    case 10:
      // SankeyChart(data_groupsIssues, canvas, simulation)();

      // UnitchartGridLayoutId(data_articleIndentity, canvas, simulation).margin({
      //   top: 100,
      //   right: 1050,
      //   bottom: 100,
      //   left: 100,
      // })();
      break;
  }
};

const initialRender = () => {
  canvas.append("g").attr("id", "figure1Group");
  canvas.append("g").attr("id", "figure2Group");
  canvas.append("g").attr("id", "figure3Group");
  canvas.append("g").attr("id", "xAxisGroup");
  canvas.append("g").attr("id", "yAxisGroup");
  canvas.append("g").attr("id", "morphGroup");
  canvas.append("g").attr("id", "anotationGroup");
  canvas.append("g").attr("id", "linksGroup");
  canvas.append("g").attr("id", "nodesGroup");
};

const init = () => {
  handleResize();
  initialRender();
  scroller
    .setup({
      step: "#scrolly article .step",
      offset: 0.4,
      debug: false,
    })
    .onStepEnter(handleStepChange);
};

window.onload = init();
