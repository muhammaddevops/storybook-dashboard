import React from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { Bar, Line, ctx } from "react-chartjs-2";

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

class DetailedIconChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: props.data ? props.data.toJS() : null };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!nextProps) {
      return null;
    } else if (nextProps.data && nextProps.data.toJS() !== prevState.data) {
      return { data: nextProps.data.toJS() };
    }
  }

  render() {
    if (!this.state.data.labels) {
      return null;
    }

    let options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: 'Indicator Bar Chart'
        }
      }
    }

    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Dataset 1',
          data: labels.map(() => Math.random()),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }
      ]
    }

    return (
      <div>
        <Bar
          options={options} 
          data={data} 
        />
      </div>
    );
  }
}

export { BarChart, LineChart, DetailedIconChart };
