import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Traec from "traec";

import { DetailedIconChart } from "AppSrc/charts";
import { BSCard } from "traec-react/utils/bootstrap";
import { generateIndicatorChart, generateIndicatorTargetMap } from "./utils";
import { CumulativeButton } from "./sustainabilityPanel/utils";
import { ErrorBoundary } from "traec-react/errors/handleError";

import { sortAndCropData, dataToState, getFetchBody, getDispatchFetches } from "./sustainabilityPanel/helpers";
import { Spinner } from "traec-react/utils/entities";

import ProjectReportCommitResults from "AppSrc/dashboards/lists/projectCommits";
import ProjectReportInputValues from "AppSrc/dashboards/lists/projectInputValues";

import CompanyReportProjectResults from "AppSrc/dashboards/lists/companyProjects";
import CompanyReportIndicatorValues from "AppSrc/dashboards/lists/companyInputValues";
import { Benchmarks } from "./targetSet";

const getIndicator = indicators => {
  let indicator;
  let indicatorId;
  if (indicators && indicators.size == 1) {
    indicator = indicators.first();
    indicatorId = indicator.get("_key");
    indicator = indicator.set("uid", indicatorId);
  }
  return { indicator, indicatorId };
};

const CompanyContributions = props => {
  let { indicators, hide, indicator } = props;

  if (hide || !indicator) {
    return null;
  }

  //console.log("Rendering CompanyContributions", props);

  let indicatorName = indicator?.get("name");
  let indicatorId = indicator?.get("uid");
  //console.log("AAAAAA CompanyContributions", indicator);

  return (
    <React.Fragment>
      <div className="row">
        <ErrorBoundary>
          <CompanyReportProjectResults
            {...props}
            indicatorOnly={true}
            indicator={indicator}
            indicatorId={indicatorId}
          />
        </ErrorBoundary>
      </div>
      {/* //For displaying indicator data regarding company */}
      <div className="row">
        <ErrorBoundary>
          <CompanyReportIndicatorValues {...props} indicator={indicator} indicatorId={indicatorId} />
        </ErrorBoundary>
      </div>
    </React.Fragment>
  );
};

const ProjectContributions = props => {
  let { hide, indicator } = props;
  if (hide || !indicator) {
    return null;
  }

  let indicatorName = indicator?.get("name");
  let indicatorId = indicator?.get("uid");

  return (
    <React.Fragment>
      <div className="row">
        <ErrorBoundary>
          <ProjectReportCommitResults
            {...props}
            indicatorOnly={true}
            indicatorName={indicatorName}
            indicatorId={indicatorId}
          />
        </ErrorBoundary>
      </div>

      <div className="row">
        <ErrorBoundary>
          <ProjectReportInputValues {...props} indicatorName={indicatorName} indicatorId={indicatorId} />
        </ErrorBoundary>
      </div>
    </React.Fragment>
  );
};

const getPreDispatchHook = props => {
  return action => {
    action.fetchParams.body = props.fetchBody;
    action.fetchParams.headers = { "content-type": "application/json" };
    action.fetchParams.rawBody = false;
    //action.fetchParams.throttleTimeCheck = 1000 * 3600; // Throttle request to every hour (to prevent calling backend every click)
    action.stateParams.stateSetFunc = (state, data) => dataToState(props, state, data);
    console.log("Calling dispatch for INDICATOR_DETAIL data", action);
    return action;
  };
};

const IndicatorDetailPanel = props => {
  let [indicatorChartData, setIndicatorChartData] = useState(null);
  let [state, setState] = useState({ fetchedUrls: {} });

  let {
    selected,
    indicator,
    data,
    fromDate,
    toDate,
    targets,
    category,
    query_params,
    query_string,
    cumulation,
    setCumulation,
    projectId,
    refId,
    companyId,
    isRootRef,
    filters
  } = props;

  useEffect(() => {
    Traec.fetchRequiredFor({
      props,
      state,
      setState,
      requiredFetches: getDispatchFetches(props, getPreDispatchHook(props))
    });
  }, [companyId, refId, query_string]);

  useEffect(() => {
    let indicatorNames = selected?.map(data => data.get("name")).toList();

    // Get the data
    let _data = sortAndCropData(data, fromDate, toDate, "INDICATOR_DATA");

    setIndicatorChartData(getChartData(_data, targets, cumulation, category, indicatorNames) || Traec.Im.Map());
  }, [query_params, selected, category, data]);

  if (!indicatorChartData || !indicatorChartData.size) {
    return <Spinner title="Loading indicator graphs" />;
  }

  let indicatorId = indicator?.get("_key");
  let indicatorName = indicator?.get("name");

  let title = indicatorName || `All Indicators for ${category}`;
  //title = title + ` (${cumulation == "current" ? "per period" : "cumulative"})`;

  //console.log("AAAA IndicatorDetailPanel", props);
  return (
    <ErrorBoundary>
      <div className="row">
        <ErrorBoundary>
          <BSCard
            widthOffset="col-sm-12"
            title={title}
            button={<CumulativeButton cumulation={cumulation} setCumulation={setCumulation} />}
            body={
              <React.Fragment>
                <DetailedIconChart data={indicatorChartData} />
                <Benchmarks
                  hide={true} //(cumulation == "current")
                  target={targets?.find(target => target.getInPath("metric.uid") === indicator?.get("baseMetric"))}
                  indicator={indicator}
                />
              </React.Fragment>
            }
          />
        </ErrorBoundary>
      </div>

      <ErrorBoundary>
        <ProjectContributions {...props} hide={!projectId || !isRootRef || filters?.size} />
      </ErrorBoundary>

      <ErrorBoundary>
        <CompanyContributions {...props} hide={!companyId || filters?.size} />
      </ErrorBoundary>
    </ErrorBoundary>
  );
};

const mapStateToProps = (state, ownProps) => {
  let { companyId, projectId, hostId, selected, refId } = ownProps;

  hostId = hostId || companyId || projectId;

  // Get the selected category
  let category_id = selected?.first()?.get("category_id");
  let category = selected?.first()?.get("category");

  let commitId = state.getInPath(`entities.refs.byId.${refId}.latest_commit.uid`);
  let indicators = null;
  if (hostId === companyId) {
    indicators = state.getInPath(`entities.companyObjects.byId.${hostId}.indicators`);
  } else {
    indicators = state.getInPath(`entities.commitEdges.byId.${commitId}.indicators`);
  }

  // Get the indicator details
  let indicator = selected?.size === 1 ? selected.first() : null;
  indicator = indicator ? indicator.set("uid", indicator.get("_key")) : null;
  indicator =
    indicators && indicator
      ? indicator.set("baseMetric", indicators.getInPath(`${indicator.get("uid")}.resultBaseMetric.uid`))
      : indicator;

  // Add the body of our API data call to the props (so we can get it in the requiredFetches above)
  let { fetchBody, filterHash, queryParams: query_params } = getFetchBody(ownProps, "INDICATOR_DATA");
  let query_string = new URLSearchParams(query_params).toString();

  return { hostId, category, indicator, category_id, fetchBody, query_params, query_string, filterHash };
};

export default connect(mapStateToProps)(IndicatorDetailPanel);

const getChartData = (data, targets, cumulation, category, indicatorNames) => {
  if (!data) {
    return null;
  }

  let indicatorTargetMap = generateIndicatorTargetMap(data, targets, cumulation, "INDICATOR_DATA");
  let indicatorChartData = generateIndicatorChart(indicatorTargetMap, category, indicatorNames);

  console.log("indicatorChartData", indicatorChartData?.toJS());
  return indicatorChartData.has("labels") ? indicatorChartData : null;
};
