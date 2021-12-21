import UnitchartGridLayout from "./js/UnitchartGridLayout.js";
import UnitchartGridLayout2 from "./js/UnitchartGridLayout2.js";
import UnitchartGridLayout3 from "./js/UnitchartGridLayout3.js";
import HorizontalBarChart from "./js/barchart.js";
import HorizontalBarChart2 from "./js/barchart2.js";
import UnitChartForceLayout from "./js/UnitChartForceLayout.js";
const main = d3.select("main");
const scrolly = main.select("#scrolly");
const figure = scrolly.select("figure");
const article = scrolly.select("article");
const canvas = figure.append("svg");
const step = article.selectAll(".step");
const scroller = scrollama();
const simulation = d3.forceSimulation();

function normalize_column(name) {
  return name
    .toLowerCase() // map to lower case
    .replace(/[%#$£()\'\"]/g, "") // remove unwanted characters
    .replace(/[ /,+.*:\-\r\n@]/g, "_") // replace spacing and punctuation with an underscore
    .replace(/_+/g, "_") // collapse repeated underscores
    .normalize("NFD") // perform unicode normalization
    .replace(/[\u0300-\u036f]/g, ""); // strip accents from characters
}

function normalize(table) {
  const name = table.columnNames();
  return aq
    .table({ name, norm: name.map(normalize_column) }) // create table of names & normalized names
    .groupby("norm") // group by normalized name
    .derive({ index: aq.op.row_number(), count: aq.op.count() }) // count duplicates, generate index for each
    .objects() // generate an array of { name, norm } objects
    .map((o) => ({ [o.name]: o.norm + (o.count > 1 ? `_${o.index}` : "") })); // rename, adding index as needed
}

let aqTable = await aq.load("./data/Data with all codes dichotomised.csv", {
  using: aq.fromCSV,
});

aqTable = aqTable
  .select(normalize)
  .derive({ id: aq.op.row_number() })
  .relocate(aq.not("id"), { after: "id" })
  .derive({
    publisher: (d) =>
      d.publisher == "Fairfax Media Management Pty Limited"
        ? "Fairfax"
        : d.publisher == "News Ltd."
        ? "News"
        : "Others",
  });

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
  // console.log(response);
  // response = { element, direction, index }

  // add color to current step only
  step.classed("is-active", (_, i) => i === index);
  console.log(direction);

  switch (index) {
    case 0:
      UnitchartGridLayout(aqTable.slice(0, 1), canvas, simulation);
      break;

    case 1:
      UnitchartGridLayout(aqTable.slice(0, 4), canvas, simulation);
      break;

    case 2:
      UnitchartGridLayout(aqTable, canvas, simulation);
      break;

    case 3:
      UnitchartGridLayout2(aqTable, canvas, simulation);
      break;

    case 4:
      canvas.select("#figure2Group").attr("opacity", 1);
      UnitchartGridLayout3(aqTable, canvas, simulation);
      break;

    case 5:
      canvas
        .select("#figure1Group")
        .selectAll("rect")
        .transition()
        .duration(500)
        .attr("opacity", 0)
        .attr("y", (d) => -500);
      canvas.select("#figure2Group").attr("opacity", 0);
      HorizontalBarChart(aqTable, canvas, simulation);
      break;

    case 6:
      HorizontalBarChart(aqTable, canvas, simulation);
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
