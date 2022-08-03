import React from "react";
import { DetailedIconChart } from "./charts";
import { BSCard } from "traec-react/utils/bootstrap";
import Im from "traec/immutable";

export class IconDetailPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      metricData: props.detailInfo.data,
      chartData: {},
      shouldGenerateFromParent: true
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let nextState = {};

    if (nextProps.detailsName) {
      let nextMetricData = nextProps.detailInfo.get("data");
      let nextSliderState = nextProps.detailInfo.get("thresholds");
      let nextSliderMaxMin = nextProps.detailInfo.get("sliderValues");

      if (
        (nextSliderState !== prevState.sliderState || nextMetricData !== prevState.metricData) &&
        prevState.shouldGenerateFromParent
      ) {
        let thresholdData = IconDetailPanel.generateThresholdData(nextMetricData, nextSliderState);
        let chartData = IconDetailPanel.generateChartDataWithThresholds(nextMetricData, thresholdData);
        nextState.chartData = chartData;
      }

      nextState.metricData = nextMetricData;
      nextState.sliderState = nextSliderState;
      nextState.sliderMaxMin = nextSliderMaxMin;
      nextState.settingsActivated = prevState.settingsActivated;
      nextState.indicatorData = nextProps.indicatorData;
    } else {
      const nextMetricData = {};
      const nextSliderState = "";
      const nextSliderMaxMin = [];
      nextState.metricData = nextMetricData;
      nextState.sliderState = nextSliderState;
      nextState.sliderMaxMin = nextSliderMaxMin;
      nextState.settingsActivated = prevState.settingsActivated;
    }

    return nextState;
  }

  static generateThresholdData(metricData, sliderStates) {
    let color = "#36aa47";

    let lowerThresholdData = {
      label: "Red/Amber Threshold",
      data: Array(
        metricData
          .get("datasets")
          .first()
          .get("data").size
      ).fill(sliderStates.get(0)),
      backgroundColor: color,
      borderColor: color,
      type: "line"
    };

    let upperThresholdData = {
      label: "Upper Threshold",
      data: Array(
        metricData
          .get("datasets")
          .first()
          .get("data").size
      ).fill(sliderStates.get(1)),
      backgroundColor: color,
      borderColor: color,
      type: "line"
    };

    return Im.Map({ lower: lowerThresholdData, upper: upperThresholdData });
  }

  static generateChartDataWithThresholds(metricData, thresholdData) {
    const newData = metricData.set("datasets", [
      thresholdData.get("lower"),
      thresholdData.get("upper"),
      metricData
        .get("datasets")
        .first()
        .toJS()
    ]);
    return newData;
  }

  render() {
    if (!this.props.detailsName) {
      return false;
    }

    let chartData = {};
    chartData = this.state.chartData;

    return (
      <BSCard
        widthOffset="col-sm-12"
        title={this.props.detailsName}
        //button={<BSBtn onClick={this.onSettingsClick} text="Settings" />}
        body={
          <React.Fragment>
            <DetailedIconChart data={chartData} />
          </React.Fragment>
        }
      />
    );
  }
}
