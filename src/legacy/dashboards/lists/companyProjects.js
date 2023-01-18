import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { connect } from "react-redux";
import Traec from "traec";
import { Tooltip } from "react-tippy";
import { BSCard } from "traec-react/utils/bootstrap";
import { DateString } from "../components";
import { getColor } from "../icons/utils";
import { charToColor } from "./utils";
import Octicon from "react-octicon";
import { dataToState, getFetchBody } from "../sustainabilityPanel/helpers";
import { Spinner } from "traec-react/utils/entities";

const { Im } = Traec;

const ReportProjectCell = props => {
  let [redirectTo, setRedirectTo] = useState(null);

  // Do any pending redirection
  if (redirectTo) {
    return <Navigate to={redirectTo} />;
  }

  // Render the cell
  let { projectId, categoryId, category: categoryName, indicatorId, reportPeriod, issue, cumulation } = props;

  let _pathStart = indicatorId ? "INDICATOR_RAG_BY_PROJECT_DATA" : "ISSUE_RAG_BY_PROJECT_DATA";
  let _pathEnd = indicatorId ? `.${indicatorId}` : `.${categoryName}`;
  let _path = `${_pathStart}.${cumulation || "total"}.projects.${projectId}${_pathEnd}`;
  let result = reportPeriod.getInPath(_path);

  let { color, content } = getReportingPeriodRAG({ result, categoryId, indicatorId, issueName: issue?.fullName });

  let styleObj = {
    backgroundColor: color,
    cursor: "pointer",
    border: "1px solid gray"
  };
  return (
    <div className="col-sm-1" style={styleObj} onClick={() => setRedirectTo(`/project/${projectId}/`)}>
      {indicatorId ? content : null}
    </div>
  );
};

const getReportingPeriodRAG = ({ result }) => {
  return {
    color: getColor(charToColor(result?.get("rag"))),
    content: result?.get("value")?.toFixed(2) || ""
  };
};

const ReportProjectRow = props => {
  let { project, selectedReportingPeriods } = props;
  if (!project) {
    return null;
  }
  let projectId = project.get("uid");

  let cells = selectedReportingPeriods
    ?.toList()
    .map((reportPeriod, i) => (
      <ReportProjectCell key={i} {...props} projectId={projectId} reportPeriod={reportPeriod} />
    ));

  return (
    <div className="row">
      <div className="col-sm-5">
        <Link to={`/project/${projectId.substring(0, 8)}/`}>{project.get("name")}</Link>
      </div>
      {cells}
      <div className="col-sm-1" />
    </div>
  );
};

const ReportHeaderRow = ({ reportingPeriods }) => {
  return (
    <div className="row">
      <div className="col-sm-5">
        <b>Period Starting</b>
      </div>
      {reportingPeriods
        ? reportingPeriods.toList().map((rp, i) => (
            <div className="col-sm-1" key={i}>
              <b>
                <DateString obj={rp} field={"endDate"} add={-1} prefix={"To: "} />
              </b>
            </div>
          ))
        : null}
      <div className="col-sm-1" />
    </div>
  );
};

const TitleTooltip = props => {
  let { text } = props;

  if (!text) {
    return null;
  }
  return (
    <Tooltip animateFill={false} html={<div className="text-left">{text}</div>}>
      <Octicon name="info" className="ml-2" />
    </Tooltip>
  );
};

const getTitleAndHelpText = ({ indicatorOnly, categoryName, indicator }) => {
  let title;
  let helpText;

  if (indicatorOnly) {
    title = `Performance of projects for Indicator: ${indicator?.get("name")}`;
    helpText = (
      <div className="text-left">
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
        <p>Indicator id: {indicator?.getInPath("_key")?.substring(0, 8)}</p>
      </div>
    );
  } else {
    title = `Performance of projects for issue: ${categoryName}`;
    helpText = (
      <div className="text-left">
        <p>
          This table uses a Red, Amber and Green (RAG) system to indicate the performance of each project evaluated on
          the selected indicator, based on the targets and thresholds at the project level.
        </p>
        <p>A red cell indicates underperformance for the selected indicator.</p>
        <p>
          An amber cell indicates performance above the red/amber threshold but below the target for the selected
          indicator.
        </p>
        <p>A green cell indicates satisfactory performance for the selected indicator.</p>
        <p>A grey cell indicates no targets or thresholds were set or that no data has been reported.</p>
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
    console.log("Calling dispatch for ISSUE/INDICATOR_RAG_BY_PROJECT data", action);
    return action;
  };
};

const CompanyReportProjectResults = props => {
  let {
    indicator,
    category: categoryName,
    category_id: categoryId,
    indicatorId,
    indicatorOnly,
    selectedReportingPeriods,
    projects,
    query_string
  } = props;

  useEffect(() => {
    Traec.fetchRequiredFor({
      props,
      requiredFetches: [
        new Traec.Fetch("company_dispatch", "post", {}, { preDispatchHook: getPreDispatchHook(props) }),
        new Traec.Fetch("project", "list")
      ]
    });
  }, [indicatorId, query_string]);

  if ((indicatorOnly && !indicator) || !categoryId) {
    return null;
  }

  if (!projects?.size) {
    return (
      <div className="col-sm-12">
        <Spinner title="Loading performance data for issues" />
      </div>
    );
  }

  let { title, helpText } = getTitleAndHelpText({ indicatorOnly, categoryName, indicator });

  const rows = projects
    .filter(i => i)
    .map((project, index) => {
      return <ReportProjectRow key={index} {...props} project={project} />;
    });

  return (
    <BSCard
      widthOffset="col-sm-12"
      title={
        <>
          <span>{title}</span>
          <TitleTooltip text={helpText} />
        </>
      }
      body={
        <>
          <ReportHeaderRow reportingPeriods={selectedReportingPeriods} />
          {rows}
        </>
      }
    />
  );
};

const mapStateToProps = (state, ownProps) => {
  let { category_id, indicatorId, selectedReportingPeriods, cumulation } = ownProps;

  let _key = indicatorId ? "INDICATOR_RAG_BY_PROJECT_DATA" : "ISSUE_RAG_BY_PROJECT_DATA";

  let { fetchBody, filterHash, queryParams: query_params } = getFetchBody(
    {
      ...ownProps,
      cumulation: indicatorId ? cumulation : "total",
      category_id: category_id,
      indicator_id: indicatorId,
      filters: Im.Map({})
    },
    _key
  );
  let query_string = new URLSearchParams(query_params).toString();

  let projectsByReportingPeriods = selectedReportingPeriods?.map(rp =>
    rp.getInPath(`${_key}.${cumulation || "total"}.projects`)
  );

  let projectIds = projectsByReportingPeriods
    ?.filter(rp => rp)
    ?.map(rp => [...rp.keys()])
    .reduce((ids, id) => ids.merge(id), Im.List())
    .toSet();

  let projects = projectIds?.map(projectId => state.getInPath(`entities.projects.byId.${projectId}`)).toList();

  return {
    projects,
    projectsByReportingPeriods,
    fetchBody,
    filterHash,
    query_params,
    query_string
  };
};

export default connect(mapStateToProps)(CompanyReportProjectResults);
