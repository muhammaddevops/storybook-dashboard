import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Traec from "traec";
import { Tooltip } from "react-tippy";
import { BSCard } from "traec-react/utils/bootstrap";
import { DateString } from "AppSrc/project/components";
import { BSBtnDropdown } from "traec-react/utils/bootstrap";
import Octicon from "react-octicon";
import { Spinner } from "traec-react/utils/entities";
import { dataToState, getFetchBody } from "../sustainabilityPanel/helpers";
import { TitleTooltip, getRefsFromReportingPeriods } from "./utils";
import { select } from "d3-selection";
import { listsToDicts } from "AppSrc/dashboards/sustainabilityPanel/helpers";

const cellStyles = {
  backgroundColor: null,
  border: "1px solid gray"
};

export const getMetricIdsFromIndicator = ({ indicator }) => {
  if (!indicator) {
    return [];
  }
  let text = indicator.getInPath("operation.text");
  if (!text) {
    return [];
  }

  let matches = text.match(/[0-9a-f-]{36}/g);
  let distinct_matches = [...new Set(matches)];
  return distinct_matches;
};

const getValues = (reportPeriod, cumulation_period, filterFunction) => {
  let values = (
    reportPeriod.getInPath(`PROJECT_REPORT_INPUT_VALUES.${cumulation_period || "current"}`) || Traec.Im.Map()
  ).toList();
  return filterFunction ? values.filter(i => filterFunction(i)) : values;
};

const sumValues = values => {
  return values.reduce((acc, cur) => acc + cur.get("value"), null);
};

const getValueFilter = (baseMetricId, refId) => {
  return value =>
    value.getInPath(`basemetric.uid`) == baseMetricId && (refId ? value.getInPath("ref.uid") == refId : true);
};

const getCellValuesAndTotal = ({ cref, baseMetricId, selectedReportingPeriods, isCumulative }) => {
  // Get the cell values and totals
  let refId = cref?.get("uid");
  let cumulation_period = isCumulative ? "total" : "current";
  let baseMetric = null; // Get the basemetric
  let refs = Traec.Im.Set(); // Get all the refs that we have values for

  let cellValues = (selectedReportingPeriods || Traec.Im.Map()).toList().map((reportPeriod, i) => {
    // Get all values that match baseMetricId (and refId if provided)
    let values = getValues(reportPeriod, cumulation_period, getValueFilter(baseMetricId, refId));
    refs = refs.union(values.map(i => i.get("ref")));
    // Get the basemetric object from the first if required
    if (!baseMetric && values.size) {
      baseMetric = values.first().get("basemetric");
    }
    // Sum the values (note: if refId is provided then there should only be one)
    return sumValues(values);
  });

  let total = null;
  try {
    total = cellValues.reduce((a, b) => a + b);
  } catch (e) {}

  return { cellValues, total, baseMetric, refs };
};

export function TableCell({ value }) {
  return (
    <div className="col-sm-1" style={cellStyles}>
      {value != null ? value.toFixed(2) : value}
    </div>
  );
}

function MetricTooltip({ baseMetric }) {
  if (!baseMetric) {
    return null;
  }
  return (
    <Tooltip animateFill={false} html={<p>BaseMetric id: {baseMetric.get("uid").substring(0, 8)}</p>}>
      <Octicon name="info" className="ml-2" />
    </Tooltip>
  );
}

function MetricRefValues(props) {
  let { hide, refs } = props;
  //console.log("AAAA MetricRefValues", hide, refs)
  // Show the contribution by reporting packages (Recursive call to this component)
  if (hide || !refs) {
    return null;
  }
  return refs
    .filter(cref => cref)
    .sortBy(cref => cref.get("name"))
    .map((cref, i) => <MetricInputValueRow key={i} cref={cref} {...props} />);
}

function MetricInputValueRow(props) {
  let { cref, baseMetricId, isCumulative } = props;
  let [showRefs, setShowRefs] = useState(false);

  if (!baseMetricId) {
    return null;
  }

  let { cellValues, total, baseMetric, refs } = getCellValuesAndTotal(props);
  //console.log("AAAA getCellValuesAndTotal", baseMetric?.toJS(), refs?.toJS(), cellValues?.toJS(), total)

  if (total === null || !baseMetric) {
    return null;
  }

  let title = null;
  if (cref) {
    title = <i>{cref.get("name")}</i>;
  } else if (baseMetricId) {
    title = (
      <React.Fragment>
        {baseMetric?.get("name") || baseMetricId}
        {<MetricTooltip baseMetric={baseMetric} />}
        {/*<BSBtnDropdown
          header={" "}
          links={[
            {
              name: `${showRefs ? "Hide" : "Show"} Reporting Packages`,
              onClick: e => setShowRefs(!showRefs)
            }
          ]}
        />*/}
      </React.Fragment>
    );
  }

  let styleObj = cref ? {} : { backgroundColor: "#ddd" };

  return (
    <React.Fragment>
      <div className="row" style={styleObj}>
        <div className="col-sm-5">{title}</div>
        {cellValues.map((value, i) => (
          <TableCell key={i} value={value} />
        ))}
        {isCumulative ? null : <TableCell value={total} />}
      </div>
      <MetricRefValues {...props} refs={refs} hide={!showRefs} />
    </React.Fragment>
  );
}

function ReportHeaderRow({ reportingPeriods, isCumulative }) {
  let cells = reportingPeriods
    ? reportingPeriods.toList().map((rp, i) => (
        <div className="col-sm-1" key={i}>
          <b>
            <DateString obj={rp} field={"endDate"} add={-1} prefix={"To: "} />
          </b>
        </div>
      ))
    : null;

  return (
    <div className="row">
      <div className="col-sm-5">
        <b>Period Starting</b>
      </div>
      {cells}
      <div className="col-sm-1">
        <b>{isCumulative ? "" : "Total for these periods"}</b>
      </div>
    </div>
  );
}

const getPreDispatchHook = props => {
  let { fetchBody } = props;
  return action => {
    action.fetchParams.body = fetchBody;
    action.fetchParams.headers = { "content-type": "application/json" };
    action.fetchParams.rawBody = false;
    //action.fetchParams.throttleTimeCheck = 1000 * 3600; // Throttle request to every hour (to prevent calling backend every click)
    /*action.stateParams.stateSetFunc = (state, data) => {
      // Remap the input-values to by indexed by basemetricId
      data.payload.payload = Traec.Im.fromJS(data.payload.payload)
        .map(item => listsToDicts(item, 2, "basemetric.uid"))
      // Put this into the Redux state
      return dataToState(props, state, data)
    };*/
    action.stateParams.stateSetFunc = (state, data) => dataToState(props, state, data);
    console.log("Calling tracker_dispatch for PROJECT_REPORT_INPUT_VALUES data", action);
    return action;
  };
};

function TableBody(props) {
  let { baseMetricIds, selectedReportingPeriods, isCumulative } = props;

  const rows = baseMetricIds
    ? baseMetricIds.map((baseMetricId, i) => {
        return <MetricInputValueRow key={i} {...props} baseMetricId={baseMetricId} />;
      })
    : null;

  if (rows) {
    return (
      <React.Fragment>
        <ReportHeaderRow reportingPeriods={selectedReportingPeriods} isCumulative={isCumulative} />
        {rows}
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <Spinner title="Loading Data..." timeOutComment="Insufficient data to generate table" />
      </React.Fragment>
    );
  }
}

function ProjectReportIndicatorValues(props) {
  let { indicator, indicatorId, cumulation, query_string } = props;

  if (!indicatorId || !indicator) {
    return null;
  }

  //let [refs, setRefs] = useState(Traec.Im.Set())
  //let refs = getRefsFromReportingPeriods()

  useEffect(() => {
    Traec.fetchRequiredFor({
      props,
      requiredFetches: [new Traec.Fetch("tracker_dispatch", "post", {}, { preDispatchHook: getPreDispatchHook(props) })]
    });
  }, [indicatorId, query_string]);

  let _text = cumulation == "total" ? "cumulative" : "per period";
  let title = `Reported metric values (${_text}) for indicator: ${indicator.get("name")}`;
  let helpText = (
    <div className="text-left">
      <p>
        This table displays the aggregated data reported for the metric used to calculate the selected indicator. By
        clicking on each metric, the data reported by each reporting package will be displayed.
      </p>
    </div>
  );

  return (
    <BSCard
      widthOffset="col-sm-12"
      title={
        <React.Fragment>
          <span>{title}</span>
          <TitleTooltip text={helpText} />
        </React.Fragment>
      }
      button={
        null /*
        <BSBtnDropdown
          header={null}
          links={[
            {
              name: `Show ${isCumulative ? "monthly reported" : "total cumulative"} values`,
              onClick: () => {
                console.log("Toggle cumulative");
              }
            }
          ]}
        />
      */
      }
      body={<TableBody {...props} />}
    />
  );
}

const mapStateToProps = (state, ownProps) => {
  let { indicator, indicatorId, projectId, selectedReportingPeriods, cumulation } = ownProps;
  let isCumulative = cumulation == "total" ? true : false;

  let { fetchBody, filterHash, queryParams: query_params } = getFetchBody(
    {
      ...ownProps,
      indicator_id: indicatorId,
      filters: Traec.Im.Map()
    },
    "PROJECT_REPORT_INPUT_VALUES"
  );
  let query_string = new URLSearchParams(query_params).toString();

  // Get the metrics that make up the indicator
  let baseMetricIds = getMetricIdsFromIndicator({ indicator });
  let baseMetrics = state.getInPath("entities.baseMetrics.byId");

  // Add to props
  return {
    fetchBody,
    query_params,
    query_string,
    filterHash,
    baseMetrics,
    baseMetricIds,
    selectedReportingPeriods,
    isCumulative
  };
};

export default connect(mapStateToProps)(ProjectReportIndicatorValues);
