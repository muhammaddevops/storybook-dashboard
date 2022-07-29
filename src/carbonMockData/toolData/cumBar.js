import { ISSUE_RAG_DATA } from "./_data";
import { SimpleBarChart } from "@carbon/charts-react";
import "@carbon/styles/css/styles.css";
import "@carbon/charts/styles.css";

export const toolDataJs = ISSUE_RAG_DATA.map((data) => {
  return data;
});
console.log("tool in parse data >>", toolDataJs[0]);

const ragStatus = toolDataJs[0].ISSUE_RAG_DATA.Waste.rag;

const chartColors = () => {
  if (ragStatus === "r") return "#db1919";
  if (ragStatus === "a") return "#36aa47";
  if (ragStatus === "g") return "#36aa47";
  else return "#cccccc";
};
const chartData = [
  {
    group: "Waste",
    value: toolDataJs[0].ISSUE_RAG_DATA.Waste.value,
  },
];

const chartOptions = {
  title: "Cumulative Data",
  color: {
    scale: { Waste: chartColors() },
  },
  axes: {
    left: {
      mapsTo: "group",
      scaleType: "labels",
    },
    bottom: {
      mapsTo: "value",
    },
  },
  height: "150px",
};
console.log("color", chartOptions.color);

export default function CumHorizBarPop() {
  return <SimpleBarChart options={chartOptions} data={chartData} />;
}
