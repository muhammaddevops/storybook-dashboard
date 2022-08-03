import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Traec from "traec";
import { Tooltip } from "react-tippy";
import { BSCard } from "traec-react/utils/bootstrap";
import { DateString } from "../components";
import { BSBtnDropdown } from "traec-react/utils/bootstrap";
import Octicon from "react-octicon";
import { Spinner } from "traec-react/utils/entities";

import { dataToState, getFetchBody } from "../sustainabilityPanel/helpers";

import { getMetricIdsFromIndicator, TableCell } from "./projectInputValues";
import { ErrorBoundary } from "traec-react/errors";

const { Im } = Traec;

const getTotalMetricValue = (reportPeriod, baseMetricId) => {
  /* basemetric id refers to the rows in the second table (amount of co2, construction value) */
  return reportPeriod.getInPath(`metric_totals.${baseMetricId}`);
};

function TableRow({ title, dropdown, values, total }) {
  return (
    <div className="row" style={{ backgroundColor: "#ddd" }}>
      <div className="col-sm-5">
        {title}
        {dropdown}
      </div>
      {values.map((value, i) => (
        <TableCell key={i} value={value} />
      ))}
      {total ? <TableCell value={total} /> : null}
    </div>
  );
}

function MetricInputRefValueRow(props) {
  let { companyReportingPeriods, baseMetricId, cumulation_period, _ref } = props;

  let refId = _ref.get("uid");
  let refName = _ref.get("name");

  let values = companyReportingPeriods.map(rp => {
    let total = (rp.getInPath(`INDICATOR_INPUT_VALUES.${cumulation_period || "current"}`) || Traec.Im.Map())
      .toList()
      .filter(i => i.getInPath(`basemetric.uid`) === baseMetricId && i.getInPath(`commit.ref`) === refId)
      .reduce((acc, cur) => acc + cur.get("value"), 0);
    return total;
  });

  let projectName = _ref.getInPath("project.name");
  let projectId = (_ref.getInPath("project.uid") || "").substring(0, 8);

  return (
    <TableRow
      title={
        <span>
          <i>{refName}</i>
          <Tooltip animateFill={false} html={`Project: ${projectName} [${projectId}]`}>
            <Octicon name="info" className="ml-2" />
          </Tooltip>
        </span>
      }
      values={values}
    />
  );
}

function MetricInputRefValueRows(props) {
  let { companyReportingPeriods, baseMetricId, cumulation_period, hide } = props;
  if (hide || !companyReportingPeriods) {
    return null;
  }

  // Get the unique commits for each input_value for this metric
  let refs = Traec.Im.Set();
  companyReportingPeriods.map(rp => {
    let refList = (rp.getInPath(`INDICATOR_INPUT_VALUES.${cumulation_period || "current"}`) || Traec.Im.Map())
      .toList()
      .filter(i => i.getInPath(`basemetric.uid`) === baseMetricId)
      .map(i => i.getInPath("ref")?.set("project", i.getInPath("commit.project")));

    refs = refs.union(Traec.Im.Set(refList));
  });

  console.log("GOT REFS FOR", baseMetricId, refs.toJS());

  let rows = refs.toList().map((_ref, i) => <MetricInputRefValueRow key={i} {...props} _ref={_ref} />);

  return <ErrorBoundary>{rows}</ErrorBoundary>;
}

const getCellValuesAndTotal = ({ selectedCompanyReportingPeriods, baseMetricId }) => {
  //Company
  let cellValues = selectedCompanyReportingPeriods
    ? selectedCompanyReportingPeriods.toList().map((reportPeriod, i) => getTotalMetricValue(reportPeriod, baseMetricId))
    : null;

  // Add up the values for the totals
  let total = null;
  try {
    total = cellValues.reduce((a, b) => {
      return a + b;
    });
  } catch (e) {}

  return { cellValues, total };
};

function MetricInputValueRow(props) {
  let { baseMetricId, baseMetrics, isCumulative, cumulation_period, selectedCompanyReportingPeriods } = props;
  let [showRefs, setShowRefs] = useState(false);

  // Get the full baseMetric from state
  let baseMetric = baseMetrics ? baseMetrics.get(baseMetricId) : null;

  // Exclude rows that amount to nothing
  let { cellValues, total } = getCellValuesAndTotal(props);
  if (total === null) {
    return null;
  }

  return (
    <ErrorBoundary>
      <TableRow
        title={baseMetric ? baseMetric.get("name") : baseMetricId}
        dropdown={
          null
        } /*}  <BSBtnDropdown
        header={" "}
        links={[
          {
            name: `${showRefs ? "Hide" : "Show"} Reporting Packages`,
            onClick: e => setShowRefs(!showRefs)
          }
        ]}
      />
    }*/
        values={cellValues}
        total={isCumulative ? null : total}
      />
      <ErrorBoundary>
        <MetricInputRefValueRows
          cumulation_period={cumulation_period}
          baseMetricId={baseMetricId}
          companyReportingPeriods={selectedCompanyReportingPeriods}
          hide={!showRefs}
        />
      </ErrorBoundary>
    </ErrorBoundary>
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

const toggleCumulative = props => {
  let { isCumulative, dispatch, projectId, companyId } = props;
  dispatch({
    type: "UI_SET_IN",
    payload: !isCumulative,
    stateParams: { itemPath: `dashboards.${companyId}.inputs.cumulativeValues` }
  });
};

function TitleToolTip({ text }) {
  if (!text) {
    return null;
  }
  return (
    <Tooltip animateFill={false} html={text}>
      <Octicon name="info" className="ml-2" />
    </Tooltip>
  );
}

const getTitleAndHelpText = indicator => {
  //let { isCumulative } = this.props;
  let isCumulative = false;
  let _cumtext = isCumulative ? "cumulative" : "per period";
  let title = `Reported metric values (${_cumtext}) for indicator: ${indicator.get("name")}`;
  let helpText = (
    <div className="text-left">
      <p>
        This table displays the aggregated data reported for the metric used to calculate the selected indicator. By
        clicking on each metric, the data reported by each reporting package will be displayed.
      </p>
    </div>
  );
  return { title, helpText };
};

function TableBody(props) {
  let { baseMetricIds, selectedCompanyReportingPeriods, isCumulative } = props;

  const rows = baseMetricIds
    ? baseMetricIds.map((baseMetricId, i) => {
        return <MetricInputValueRow key={i} {...props} baseMetricId={baseMetricId} />;
      })
    : null;

  if (rows) {
    return (
      <React.Fragment>
        <ReportHeaderRow reportingPeriods={selectedCompanyReportingPeriods} isCumulative={isCumulative} />
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

const getPreDispatchHook = props => {
  let { fetchBody } = props;
  return action => {
    action.fetchParams.body = fetchBody;
    action.fetchParams.headers = { "content-type": "application/json" };
    action.fetchParams.rawBody = false;
    //action.fetchParams.throttleTimeCheck = 1000 * 3600; // Throttle request to every hour (to prevent calling backend every click)
    action.stateParams.stateSetFunc = (state, data) => dataToState(props, state, data);
    console.log("Calling company_dispatch for INDICATOR_INPUT_VALUES data", action);
    return action;
  };
};

function CompanyReportIndicatorValues(props) {
  let { indicator, indicatorId, query_string } = props;

  useEffect(() => {
    Traec.fetchRequiredFor({
      props,
      requiredFetches: [
        new Traec.Fetch("company_dispatch", "post", {}, { preDispatchHook: getPreDispatchHook(props) }),
        new Traec.Fetch("project", "list")
      ]
    });
  }, [indicatorId, query_string]);

  if (!indicator) {
    return null;
  }

  let { title, helpText } = getTitleAndHelpText(indicator);

  return (
    <BSCard
      widthOffset="col-sm-12"
      title={
        <React.Fragment>
          <span>{title}</span>
          <TitleToolTip text={helpText} />
        </React.Fragment>
      }
      body={<TableBody {...props} />}
    />
  );
}

/*
  button={
    <BSBtnDropdown
      header={null}
      links={[
        {
          name: `Show ${isCumulative ? "monthly reported" : "total cumulative"} values`,
          onClick: this.toggleCumulative
        }
      ]}
    />
  }
*/

const appendMetricTotals = ({ reportPeriods, projectId, indicatorId, baseMetricIds, cumluation_period }) => {
  if (!reportPeriods) {
    return reportPeriods;
  }

  reportPeriods = reportPeriods.map(rp => {
    let newRp = rp;

    //console.log("APPENDING METRIC TOTALS", cumluation_period, rp.toJS())

    if (newRp.get("INDICATOR_INPUT_VALUES")) {
      for (let baseMetricId of baseMetricIds) {
        let input_values = (rp.getInPath(`INDICATOR_INPUT_VALUES.${cumluation_period || "current"}`) || Traec.Im.Map())
          .toList()
          .filter(i => i.getInPath(`basemetric.uid`) == baseMetricId);

        let value = input_values.reduce((acc, cur) => acc + cur.get("value"), 0);

        //console.log("GOT METRIC TOTAL", baseMetricId, value)
        newRp = newRp.setInPath(`metric_totals.${baseMetricId}`, value);
      }
    }

    return newRp;
  });

  return reportPeriods;
};

const mapStateToProps = (state, ownProps) => {
  let { companyId, indicator, selectedReportingPeriods, cumulation } = ownProps;

  // Get the metrics that make up the indicator
  let baseMetricIds = getMetricIdsFromIndicator({ indicator });
  let baseMetrics = state.getInPath("entities.baseMetrics.byId");

  // Get if we should show cumulative values
  let isCumulative = cumulation == "total" ? true : false;

  // Get the fetch query to use
  let { fetchBody, filterHash, queryParams: query_params } = getFetchBody(ownProps, "INDICATOR_INPUT_VALUES");
  let query_string = new URLSearchParams(query_params).toString();

  // For each reporting period turn the input_values into a map by baseMetricId
  let selectedCompanyReportingPeriods = appendMetricTotals({
    reportPeriods: selectedReportingPeriods,
    baseMetricIds,
    cumluation_period: isCumulative ? "current" : null
  });

  // Add to props
  return {
    baseMetrics,
    baseMetricIds,
    selectedCompanyReportingPeriods,
    isCumulative,
    fetchBody,
    query_params,
    query_string
  };
};

export default connect(mapStateToProps)(CompanyReportIndicatorValues);
