import React, { useState, useEffect } from "react";
import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import Traec from "traec";
import { BSCard } from "traec-react/utils/bootstrap";
import { DateString } from "../components";
import { colorScale } from "AppSrc/dashboards/utils";
import { Spinner } from "traec-react/utils/entities";
import { dataToState, getFetchBody } from "../sustainabilityPanel/helpers";
import { TitleTooltip, getRefsFromReportingPeriods } from "./utils";

const getStatus = ({ projectId, reportPeriod, refId }) => {
  let result = reportPeriod.getInPath(`STATUS_BY_REF.${refId}`);
  let status = result ? result.getInPath("status.name") : null;
  if (status == null) {
    status = result ? "Nothing Received" : "No Report";
  }
  if (status.startsWith("Not for")) {
    status = "On Hold";
  }
  if (status.startsWith("OK")) {
    status = "Approved";
  }
  let content = result ? <Link to={`/project/${projectId}/wpack/${refId}/evals/`}>{status}</Link> : "No Report";
  return { content, status, result };
};

const getColorFromStatus = status => {
  let colorValue = null;
  switch (status) {
    case "Nothing Received":
      colorValue = 0;
      break;
    case "Approved":
      colorValue = 1;
      break;
    case "Pending Approval":
      colorValue = 0.5;
      break;
    case "On Hold":
      return "#c2c2c2";
    case "Requires Revision":
      return "#acd2ff";
    default:
      colorValue = null;
  }
  return colorScale(colorValue)
    .brighten(2)
    .hex();
};

function ReportCommitCell(props) {
  let { projectId, refId } = props;
  let [redirectTo, setRedirectTo] = useState(null);

  // Do any pending redirection
  let redirectUrl = `/project/${projectId?.substring(0, 8)}/wpack/${refId?.substring(0, 8)}/`;
  if (redirectTo) {
    return <Redirect to={redirectTo} />;
  }

  let { content, status } = getStatus(props);

  let styleObj = {
    backgroundColor: getColorFromStatus(status),
    cursor: "pointer",
    border: "1px solid gray"
  };

  return (
    <div className="col-sm-1" style={styleObj} onClick={() => setRedirectTo(redirectUrl)}>
      {content}
    </div>
  );
}

export const ReportCommitRow = function({ projectId, cref, selectedReportingPeriods }) {
  if (!cref) {
    return null;
  }
  let cells = selectedReportingPeriods
    ? selectedReportingPeriods
        .toList()
        .map((reportPeriod, i) => (
          <ReportCommitCell key={i} projectId={projectId} refId={cref.get("uid")} reportPeriod={reportPeriod} />
        ))
    : null;

  return (
    <div className="row">
      <div className="col-sm-5">
        <Link to={`/project/${projectId.substring(0, 8)}/wpack/${cref.get("uid").substring(0, 8)}/`}>
          {cref.get("name")}
        </Link>
      </div>
      {cells}
      <div className="col-sm-1" />
    </div>
  );
};

export const ReportHeaderRow = ({ reportingPeriods }) => {
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
      <div className="col-sm-1" />
    </div>
  );
};

const getPreDispatchHook = props => {
  let { fetchBody } = props;
  return action => {
    action.fetchParams.body = fetchBody;
    action.fetchParams.headers = { "content-type": "application/json" };
    action.fetchParams.rawBody = false;
    //action.fetchParams.throttleTimeCheck = 1000 * 3600; // Throttle request to every hour (to prevent calling backend every click)
    action.stateParams.stateSetFunc = (state, data) => dataToState(props, state, data);
    console.log("Calling tracker_dispatch for COMMIT_STATUS data", action);
    return action;
  };
};

function ProjectReportTableBody(props) {
  let { projectId, categoryName, indicator, selectedReportingPeriods, refs } = props;

  // Map redux values to props, and sort results by name for reporting packages
  const rows = refs
    .toList()
    .filter(cref => cref) // Ensure that all the refs are populated (no nulls)
    .sortBy(cref => cref.get("name"))
    .map((cref, i) => {
      return (
        <ReportCommitRow
          key={i}
          projectId={projectId}
          cref={cref}
          selectedReportingPeriods={selectedReportingPeriods}
        />
      );
    });

  if (rows.size) {
    let isListEmpty = rows.every(elem => !elem);
    if (isListEmpty && categoryName && indicator) {
      return (
        <React.Fragment>
          <p>Indicator is computed from different Reporting Packages. Performance table can not be shown.</p>
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <ReportHeaderRow reportingPeriods={selectedReportingPeriods} />
        {rows}
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <Spinner title="Loading Data..." timedOutComment="Insufficient data to generate table" />
      </React.Fragment>
    );
  }
}

function ProjectReportCommitResults(props) {
  let { hide, selectedReportingPeriods } = props;
  //let [refs, setRefs] = useState(Im.Set())

  if (hide || !selectedReportingPeriods) {
    return null;
  }

  useEffect(() => {
    Traec.fetchRequiredFor({
      props,
      requiredFetches: [new Traec.Fetch("tracker_dispatch", "post", {}, { preDispatchHook: getPreDispatchHook(props) })]
    });
  }, []);

  return (
    <BSCard
      widthOffset="col-sm-12"
      title={
        <React.Fragment>
          <span>{`Status of reporting packages`}</span>
          <TitleTooltip
            text={
              <p>
                This table indicates whether data has been submitted, rejected or approved for each reporting package.
              </p>
            }
          />
        </React.Fragment>
      }
      body={<ProjectReportTableBody {...props} refs={getRefsFromReportingPeriods(props)} />}
    />
  );
}

const mapStateToProps = (state, ownProps) => {
  let { selectedReportingPeriods } = ownProps;

  let { fetchBody, filterHash, queryParams: query_params } = getFetchBody(
    {
      ...ownProps,
      filters: Traec.Im.Map()
    },
    "PROJECT_REPORT_COMMIT_STATUS"
  );

  // For each reporting period turn the commit_results into a map by refId
  if (selectedReportingPeriods) {
    selectedReportingPeriods = selectedReportingPeriods.map(rp => {
      let commitResults = rp.getInPath(`PROJECT_REPORT_COMMIT_STATUS`);
      let refResults = commitResults
        ? commitResults.mapEntries(([commitId, result]) => {
            return [result.getInPath("ref.uid"), result];
          })
        : null;
      return rp.set("STATUS_BY_REF", refResults);
    });
  }

  return {
    fetchBody,
    query_params,
    filterHash,
    selectedReportingPeriods
  };
};

export default connect(mapStateToProps)(ProjectReportCommitResults);
