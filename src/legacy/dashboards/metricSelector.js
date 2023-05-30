import React from "react";
import { MetricSlider } from "storybook-dashboard/sliders";
import { DetailedIconChart } from "storybook-dashboard/charts";
import { BSCard, BSBtn } from "traec-react/utils/bootstrap";
import { IndicatorIcon, metricName } from "storybook-dashboard/dashboards/icons";
import Im from "traec/immutable";

export class MetricSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chartValueType: props.chartValueType
    };
  }

  reverseIndicatorsOrTotals() {
    if (this.props.indicatorsOrTotals === "totals") {
      return "Indicators";
    } else {
      return "Totals";
    }
  }

  render() {
    return (
      <div className="row" style={{ minHeight: "100px" }}>
        {/*<button type="button" className="btn btn-light h-50">Periodic Values</button>*/}
        {/*<button type="button" className="btn btn-light h-50">Cumulative Values</button>*/}
        <button type="button" className="btn btn-light h-50" onClick={this.props.indicatorsOrTotalsHandler}>
          {this.reverseIndicatorsOrTotals()}
        </button>
      </div>
    );
  }
}
