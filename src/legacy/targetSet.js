import Im from "traec/immutable";
import React from "react";
import Traec from "traec";
import Octicon from "react-octicon";

export const Benchmarks = props => {
  let { header, target, hide } = props;
  if (hide) {
    return null;
  }

  let targetValue = target ? target.get("value") : "";
  let thresholdLow = target ? target.getInPath("meta_json.thresholdLow") : "";
  header = header || <h5 className="mt-5">Set Target and Threshold</h5>;
  let arrowUp = thresholdLow ? thresholdLow < targetValue : !target?.getInPath("meta_json.greenBelow");
  let arrow = arrowUp ? <Octicon name="arrow-up" /> : <Octicon name="arrow-down" />;

  return (
    <>
      {header}
      <div className="row">
        <div className="col-sm-6 form-group">
          <label htmlFor="thresholdLow">Red/Amber threshold value</label>
          <input
            className="form-control"
            type="text"
            id="thresholdLow"
            name="thresholdLow"
            value={thresholdLow}
            disabled={true}
          />
        </div>
        <div className="col-sm-6 form-group">
          <label htmlFor="thresholdLow">Target (Green) value {arrow}</label>
          <input className="form-control" type="text" id="target" name="target" value={targetValue} disabled={true} />
        </div>
      </div>
    </>
  );
};

export class MetricTargetSet extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      metricTargetId: null,
      indicatorData: null,
      thresholdHigh: "",
      thresholdLow: "",
      greenBelow: null,
      target: ""
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.saveTarget = this.saveTarget.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    let { indicator: indicatorData } = props;
    indicatorData = indicatorData || Im.Map();
    //console.log("DERIVING STATE FROM PROPS", indicatorData.equals(state.indicatorData))
    if (!indicatorData.equals(state.indicatorData)) {
      return {
        indicatorData,
        greenBelow: indicatorData.getInPath("metricTarget.meta_json.greenBelow"),
        thresholdHigh: indicatorData.getInPath("metricTarget.meta_json.thresholdHigh"),
        thresholdLow: indicatorData.getInPath("metricTarget.meta_json.thresholdLow"),
        target: indicatorData.getInPath("metricTarget.value")
      };
    }
    return {};
  }

  onInputChange(e) {
    e.preventDefault();
    this.setState({ [e.target.name]: e.target.value });
  }

  saveTarget(e) {
    e.preventDefault();
    let { commitId, companyId, dispatch, indicator, trackerId } = this.props;

    let metricTargetId = indicator ? indicator.getInPath("metricTarget.uid") : null;
    //console.log('METRIC TARGET', metricTargetId)

    // Get the baseMetric against which to set this target
    let baseMetricId = null;
    if (indicator) {
      baseMetricId = indicator.getInPath("resultBaseMetric.uid");
    }

    // Get the fetchHandler that we should used (based on if it is a company or project-level target)
    let apiId = null;
    let method = null;
    let args = [];
    if (companyId) {
      apiId = "company_target";
      method = metricTargetId ? "put" : "post";
      args = { companyId, metricTargetId };
    } else {
      apiId = "tracker_commit_target";
      method = metricTargetId ? "put" : "post";
      args = { trackerId, commitId, metricTargetId };
    }
    let fetch = new Traec.Fetch(apiId, method, args);

    // Add the data payload to this fetch
    fetch.updateFetchParams({
      body: {
        metric: baseMetricId,
        value: this.state.target,
        date: new Date(),
        meta_json: {
          thresholdHigh: this.state.thresholdHigh,
          thresholdLow: this.state.thresholdLow
        }
      },
      postSuccessHook: () => {
        location.reload();
      }
    });
    // Dispatch this to the state
    fetch.dispatch();
  }

  render_close_button() {
    let { closeButtonHandler } = this.props;
    if (!closeButtonHandler) {
      return null;
    }
    return (
      <button className="btn btn-default btn-sm" onClick={this.props.closeButtonHandler}>
        Close
      </button>
    );
  }

  render_buttons() {
    if (this.props.disableInput) {
      return null;
    }
    return (
      <React.Fragment>
        {this.render_close_button()}
        <button className="btn btn-primary btn-sm float-right" onClick={this.saveTarget}>
          Save
        </button>
      </React.Fragment>
    );
  }

  render() {
    let { indicator } = this.props;
    //console.log("RENDERING METRIC SETTER PANEL", indicator ? indicator.toJS() : null)
    if (!indicator) {
      return null;
    }

    // Return null if we have time-varying targets set
    if ((indicator.getInPath("metricTarget.meta_json.byDate") || Traec.Im.List()).size) {
      return null;
    }

    let header = this.props.header || <h5 className="mt-5">Set Target and Threshold</h5>;

    // Get the threshold and values
    let thresholdLow = this.state.thresholdLow == null ? "" : this.state.thresholdLow;
    let targetValue = this.state.target == null ? "" : this.state.target;

    let arrowUp = thresholdLow ? thresholdLow < targetValue : !this.state.greenBelow;
    let arrow = arrowUp ? <Octicon name="arrow-up" /> : <Octicon name="arrow-down" />;

    return (
      <React.Fragment>
        {header}
        <div className="row">
          <div className="col-sm-6 form-group">
            <label htmlFor="thresholdLow">Red/Amber threshold value</label>
            <input
              className="form-control"
              type="text"
              id="thresholdLow"
              name="thresholdLow"
              value={thresholdLow}
              onChange={this.onInputChange}
              disabled={this.props.disableInput}
            />
          </div>
          <div className="col-sm-6 form-group">
            <label htmlFor="thresholdLow">Target (Green) value {arrow}</label>
            <input
              className="form-control"
              type="text"
              id="target"
              name="target"
              value={targetValue}
              onChange={this.onInputChange}
              disabled={this.props.disableInput}
            />
          </div>
        </div>
        {this.render_buttons()}
      </React.Fragment>
    );
  }
}
