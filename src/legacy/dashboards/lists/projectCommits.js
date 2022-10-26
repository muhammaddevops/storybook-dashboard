import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { connect } from "react-redux";
import Traec from "traec";
import { BSCard } from "traec-react/utils/bootstrap";
import { DateString } from "../components";
import { getColor } from "../icons/utils";
import { charToColor } from "./utils";
import { Spinner } from "traec-react/utils/entities";
import { dataToState, getFetchBody } from "../sustainabilityPanel/helpers";
import { TitleTooltip, getRefsFromReportingPeriods } from "./utils";

function ReportCommitCell(props) {
  let { projectId, indicatorId, refId, reportPeriod, cumulation_period } = props;
  let [redirectTo, setRedirectTo] = useState(null);

  // Do any pending redirection
  let redirectUrl = `/project/${projectId?.substring(0, 8)}/wpack/${refId?.substring(0, 8)}/`;
  if (redirectTo) {
    return <Navigate to={redirectTo} />;
  }

  // Get the rag character and color of this cell
  //let result = getProjectResults(reportPeriod, refId, categoryName, indicator, indicatorOnly);
  let result = getIndicatorResult(reportPeriod, refId, cumulation_period, indicatorId);
  let rag = result ? result.get("rag") : null;
  let color = getColor(charToColor(rag));

  //console.log("AAAA ReportCommitCell", rag, color, result?.toJS());

  // Get the link to the cell itself
  let styleObj = {
    backgroundColor: color,
    cursor: "pointer",
    border: "1px solid gray"
  };

  let content = result
    ? result.get("value") === null || result.get("value") === undefined
      ? "No Data"
      : result.get("value").toFixed(2)
    : null;
  // console.log("CONTENT", content);
  return (
    <div className="col-sm-1" style={styleObj} onClick={e => setRedirectTo(redirectUrl)}>
      {content}
    </div>
  );
}

const getIndicatorResult = (reportPeriod, refId, cumulation_period, indicatorId) => {
  let commits = reportPeriod.getInPath(`PROJECT_REPORT_INDICATOR_RAG.${cumulation_period}`) || Traec.Im.Map();
  let commit = commits.filter(i => i.getInPath("ref.uid") == refId).first() || Traec.Im.Map();
  let indicator = (commit.getInPath("results.indicators") || Traec.Im.Map()).get(indicatorId);
  return indicator;
};

export function ReportCommitRow(props) {
  let { projectId, indicatorId, cref, selectedReportingPeriods, cumulation } = props;

  if (!cref || !selectedReportingPeriods) {
    return null;
  }
  let refId = cref.get("uid");
  let cumulation_period = cumulation ? cumulation : "total";

  let results = selectedReportingPeriods
    .toList()
    .map((reportPeriod, i) => getIndicatorResult(reportPeriod, refId, cumulation_period, indicatorId));

  let allNull = results ? results.reduce((acc, val) => val?.get("value") != null || acc, false) : true;
  //console.log("AAAA ReportCommitRow", allNull, results?.toJS());
  if (!allNull) {
    return null;
  }

  let cells = selectedReportingPeriods
    ? selectedReportingPeriods
        .toList()
        .map((reportPeriod, i) => (
          <ReportCommitCell
            key={i}
            {...props}
            refId={cref.get("uid")}
            reportPeriod={reportPeriod}
            cumulation_period={cumulation_period}
          />
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
}

export function ReportHeaderRow({ reportingPeriods }) {
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
}

function ProjectReportTableBody(props) {
  let { categoryName, indicator, selectedReportingPeriods, refs } = props;

  if (!refs) {
    return null;
  }
  //console.log("AAAA ProjectReportTableBody", refs?.toJS());

  // Map redux values to props, and sort results by name for reporting packages
  const rows = refs
    .toList()
    .filter(cref => cref) // Ensure that all the refs are populated (no nulls)
    .sortBy(cref => cref.get("name"))
    .map((cref, i) => {
      return <ReportCommitRow key={i} {...props} cref={cref} />;
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

const titleAndText = props => {
  let { categoryName, indicator, indicatorName, indicatorOnly, isCumulative, cumulation } = props;

  let title = null;
  let helpText = null;

  let _cumtext = cumulation == "total" ? "cumulative" : "per period";
  if (indicatorOnly) {
    title = `Performance of reporting packages (${_cumtext}) for indicator: ${indicatorName}`;
    helpText = (
      <div>
        <p>
          This table uses a Red, Amber and Green (RAG) system to indicate the performance of each reporting package
          evaluated on the selected indicator, based on the targets and thresholds at the reporting package level.
        </p>
        <p>A red cell indicates underperformance for the selected indicator.</p>
        <p>
          An amber cell indicates performance above the red/amber threshold but below the target for the selected
          indicator.
        </p>
        <p>A green cell indicates satisfactory performance for the selected indicator.</p>
        <p>A grey cell indicates no targets or thresholds were set or that no data has been reported.</p>
        <p>Indicator id: {indicator ? indicator.get("uid").substring(0, 8) : null}</p>
      </div>
    );
  } else {
    title = `Performance of reporting packages for: ${categoryName}`;
    helpText = (
      <div>
        <p>
          This table uses a Red, Amber and Green (RAG) system to indicate the performance of each reporting package
          evaluated on indicators in the selected issue, based on the targets and thresholds at the reporting package
          level.
        </p>
        <p>A red cell indicates underperformance for at least one indicator in the selected issue.</p>
        <p>
          An amber cell indicates performance above the red/amber threshold for all indicators but below the target for
          at least one indicator in the selected issue.
        </p>
        <p>A green cell indicates satisfactory performance for all indicators in the selected issue.</p>
        <p>A grey cell indicates no targets or thresholds were set or that no data has been reported</p>
      </div>
    );
  }
  return { title, helpText };
};

const getPreDispatchHook = props => {
  let { fetchBody } = props;
  return action => {
    action.fetchParams.body = fetchBody;
    action.fetchParams.headers = { "content-type": "application/json" };
    action.fetchParams.rawBody = false;
    //action.fetchParams.throttleTimeCheck = 1000 * 3600; // Throttle request to every hour (to prevent calling backend every click)
    action.stateParams.stateSetFunc = (state, data) => dataToState(props, state, data);
    console.log("Calling tracker_dispatch for PROJECT_REPORT_INDICATOR_RAG data", action);
    return action;
  };
};

function ProjectReportCommitResults(props) {
  let { indicatorId, query_string } = props;

  useEffect(() => {
    //console.log("AAAA useEffect", props);
    Traec.fetchRequiredFor({
      props,
      requiredFetches: [new Traec.Fetch("tracker_dispatch", "post", {}, { preDispatchHook: getPreDispatchHook(props) })]
    });
  }, [indicatorId, query_string]);

  let { selectedReportingPeriods } = props;

  if (!selectedReportingPeriods) {
    return null;
  }

  let refs = getRefsFromReportingPeriods(props);
  let { title, helpText } = titleAndText(props);

  return (
    <BSCard
      widthOffset="col-sm-12"
      title={
        <React.Fragment>
          <span>{title}</span>
          <TitleTooltip text={helpText} />
        </React.Fragment>
      }
      body={<ProjectReportTableBody {...props} refs={refs} />}
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
    "PROJECT_REPORT_INDICATOR_RAG"
  );
  let query_string = new URLSearchParams(query_params).toString();

  // For each reporting period turn the commit_results into a map by refId
  /*if (selectedReportingPeriods) {
    selectedReportingPeriods = selectedReportingPeriods.map(rp => {
      let commitResults = rp.getInPath(`PROJECT_REPORT_INDICATOR_RAG`);
      let refResults = commitResults
        ? commitResults.mapEntries(([commitId, result]) => {
            return [result.getInPath("ref.uid"), result];
          })
        : null;
      return rp.set("STATUS_BY_REF", refResults);
    });
  }*/

  return {
    fetchBody,
    query_params,
    query_string,
    filterHash,
    selectedReportingPeriods
  };
};

export default connect(mapStateToProps)(ProjectReportCommitResults);
