import React, { useRef, useEffect, useState } from "react";
import Chart from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { v4 as uuidv4 } from "uuid";

Chart.plugins.register(annotationPlugin);

const _data = {
  type: "line",
  data: {
    labels: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    datasets: [
      {
        data: [86, 114, 106, 106, 107, 111, 133],
        label: "Total",
        borderColor: "#3e95cd",
        backgroundColor: "#7bb6dd",
        fill: false
      },
      {
        data: [70, 90, 44, 60, 83, 90, 100],
        label: "Accepted",
        borderColor: "#3cba9f",
        backgroundColor: "#71d1bd",
        fill: false
      },
      {
        data: [10, 21, 60, 44, 17, 21, 17],
        label: "Pending",
        borderColor: "#ffa500",
        backgroundColor: "#ffc04d",
        fill: false
      },
      {
        data: [6, 3, 2, 2, 7, 0, 16],
        label: "Rejected",
        borderColor: "#c45850",
        backgroundColor: "#d78f89",
        fill: false
      }
    ]
  }
};

const annotation = {
  // Array of annotation configuration objects
  // See below for detailed descriptions of the annotation options
  annotations: [
    {
      drawTime: "afterDraw", // overrides annotation.drawTime if set
      id: "a-line-1", // optional
      type: "line",
      mode: "vertical",
      scaleID: "x-axis-0",
      value: 70,
      endValue: 70,
      borderColor: "red",
      borderWidth: 2,
      label: {
        // Whether the label is enabled and should be displayed
        enabled: true,
        // Text to display in label - default is null
        content: "Target",
        position: "top",
        xAdjust: 30
      }
    },
    {
      drawTime: "afterDraw", // overrides annotation.drawTime if set
      id: "a-line-2", // optional
      type: "line",
      mode: "vertical",
      scaleID: "x-axis-0",
      value: 90,
      endValue: 90,
      borderColor: "red",
      borderWidth: 2,
      label: {
        // Whether the label is enabled and should be displayed
        enabled: true,
        // Text to display in label - default is null
        content: "Threshold",
        position: "top",
        xAdjust: 45
      }
    }
  ]
};

const templateChartData = {
  type: "horizontalBar",
  options: {
    indexAxes: "y",
    scales: {
      xAxes: [
        {
          ticks: {
            beginAtZero: true
            //max: 95
          }
        }
      ],
      yAxes: [
        {
          ticks: {
            beginAtZero: true
            //max: 95
          }
        }
      ]
    },
    annotation
  },
  data: {
    labels: ["1"],
    datasets: [
      {
        data: [80],
        label: "Selected indicator",
        borderColor: "#ffa500",
        backgroundColor: "#ffc04d",
        fill: false
      }
    ]
  }
};

// See section "Dynamic Data" here:
// https://blog.bitsrc.io/customizing-chart-js-in-react-2199fa81530a
//let chart;

let CHART_MAP = {};

export default function ChartJSWrapper(props) {
  console.log("Rendering ChartJSWrapper");

  let { chartData, chartId, height } = props;
  if (!chartData) {
    return null;
  }

  let [_id, setId] = useState(chartId || `${uuidv4()}`);
  const chartRef = useRef(null);

  useEffect(() => {
    let chart = CHART_MAP[_id];
    //console.log("Running UseEffect on ChartJSWrapper", chart)
    if (chart) {
      console.log("Destroyed ChartJSWrapper chart element", _id);
      chart.destroy();
    }
    const ctx = chartRef.current.getContext("2d");
    CHART_MAP[_id] = new Chart(ctx, chartData);
    console.log("Created new ChartJSWrapper chart", _id);
  });

  return (
    <div>
      <canvas id={_id} ref={chartRef} />
    </div>
  );
}
