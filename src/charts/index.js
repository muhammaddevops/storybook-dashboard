import React from "react";
import Traec from "traec";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { Bar, Line, ctx } from "react-chartjs-2";
import ChartJSWrapper from "./chartjs";
import { ErrorBoundary } from "traec-react/errors";
import { index } from "d3-array";

class BarChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chartData: props.chartData
    };
  }

  render() {
    return (
      <div>
        <Bar
          data={this.state.chartData}
          height={400}
          width={100}
          options={{
            legend: {
              display: true,
              position: "bottom"
            },
            responsive: true,
            maintainAspectRatio: false
          }}
        />
      </div>
    );
  }
}

class LineChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chartData: props.chartData
    };
  }

  render() {
    return (
      <div>
        <Line
          data={this.state.chartData}
          height={400}
          width={100}
          options={{
            legend: {
              display: true,
              position: "bottom"
            },
            responsive: true,
            maintainAspectRatio: false
          }}
        />
      </div>
    );
  }
}

const roundDecimals = (label, index, labels) => {
  if (label >= 1000) {
    //Adding commas to thousands
    let commaLabel = label.toFixed();
    commaLabel = commaLabel.toString();
    commaLabel = commaLabel.split(/(?=(?:...)*$)/);
    commaLabel = commaLabel.join(",");
    return commaLabel;
  }
  return label == 0
    ? label
    : label < 0.001
    ? label.toFixed(5)
    : label < 0.01
    ? label.toFixed(4)
    : label < 0.1
    ? label.toFixed(3)
    : label < 1000
    ? label.toFixed(2)
    : label.toFixed(0);
};

const tooltipRounding = (tooltipItem, data) => {
  let label = data.datasets[tooltipItem.datasetIndex].label || "";
  console.log("yeahyeah", label, "and", tooltipItem);

  if (label) {
    label += ": ";
  }

  label += roundDecimals(tooltipItem.yLabel);
  return label;
};

function DetailedIconChart({ data }) {
  let _data = data?.toJS();

  if (!_data.labels) {
    return null;
  }

  let options = {
    legend: {
      display: true
    },
    responsive: true,
    maintainAspectRatio: true,
    height: 400,
    elements: {
      line: {
        fill: false
      }
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            userCallback: roundDecimals
          }
        }
      ]
    },
    tooltips: {
      callbacks: {
        label: tooltipRounding
      }
    }
  };

  let chartData = {
    type: "bar",
    data: _data,
    options
  };

  return (
    <ErrorBoundary>
      <ChartJSWrapper chartData={chartData} />
    </ErrorBoundary>
  );
}

export { BarChart, LineChart, DetailedIconChart };
