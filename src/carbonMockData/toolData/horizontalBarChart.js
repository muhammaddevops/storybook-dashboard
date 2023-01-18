import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import Octicon from "react-octicon";
import "./horizontalBarChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  indexAxis: "y",
  barThickness: 30,
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
    },
    title: {
      display: false,
      text: "Chart.js Horizontal Bar Chart",
    },
  },
};

const labels = [
  "% of people aged 20-25",
  "% of people aged 25-30",
  "Total number of people that completed apprenticeships",
  "Some other really long name for an indicator",
];

export const data = {
  labels,
  datasets: [
    {
      label: "Indicator values",
      data: labels.map(() => Math.random()),
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
  ],
};

function TopbarIcon({ name }) {
  return (
    <span className="pr-2 pl-2 topBarIcon">
      <Octicon name={name} />
      <a href=""></a>
    </span>
  );
}

function ChartTopBar() {
  return (
    <div>
      <h5>
        Cumulative Data
        <span className="float-right pr-1">
          <TopbarIcon name="file-media" />
          <TopbarIcon name="cloud-download" />
          <TopbarIcon name="link-external" />
        </span>
      </h5>
    </div>
  );
}

export default function HorizontalBarChart() {
  let height = labels.length * 60;

  return (
    <React.Fragment>
      <div className="card shadow p-3 mb-5 bg-white rounded text-center">
        <ChartTopBar />
        <div style={{ height: `${height}px` }}>
          <Bar options={options} data={data} height={height} />
        </div>
      </div>
    </React.Fragment>
  );
}
