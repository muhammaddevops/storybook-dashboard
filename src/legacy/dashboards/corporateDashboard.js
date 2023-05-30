import React from "react";
import { BSCard, BSCardGrid } from "traec-react/utils/bootstrap";
import { BarChart, LineChart } from "storybook-dashboard/charts";

class ReportingPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chartData: props.chartData
    };
  }

  render() {
    return (
      <BSCard
        widthOffset="col-xl-6 col-sm-12"
        title="Reporting Status"
        body={<BarChart chartData={this.state.chartData} />}
      />
    );
  }
}

class TargetPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chartData: props.chartData
    };
  }

  render() {
    return (
      <BSCard
        widthOffset="col-xl-6 col-sm-12"
        title="Target Status"
        body={<LineChart chartData={this.state.chartData} />}
      />
    );
  }
}

export { ReportingPanel, TargetPanel };
