import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { BSCardGrid } from "traec-react/utils/bootstrap";
import CategoryIcon from "../icons/category";
import { CumulativeButton, IndicatorPanelWrapper } from "./utils";
import { iconNames } from "../utils";
import Traec from "traec";
import { ErrorBoundary } from "traec-react/errors/handleError";
import { Spinner } from "traec-react/utils/entities";
import {
  dataToIconColors,
  dataToState,
  getFetchBody,
  getReverseIconNames,
  reduxDataPath,
  sortAndCropData
} from "./helpers";
import ProjectReportCommitStatus from "AppSrc/dashboards/lists/projectCommitStatus";

const getPreDispatchHook = props => action => {
  let { fetchBody } = props;
  action.fetchParams.body = fetchBody;
  action.fetchParams.headers = { "content-type": "application/json" };
  action.fetchParams.rawBody = false;
  //action.fetchParams.throttleTimeCheck = 1000 * 3600; // Throttle request to every hour (to prevent calling backend every click)
  action.stateParams.stateSetFunc = (state, data) => dataToState(props, state, data);
  console.log("Calling dispatch for ISSUE_RAG data", action);
  return action;
};

const SustainabilityPanel = props => {
  let [maxIconHeight, setMaxIconHeight] = useState(0);
  let [currentElementHeight, setCurrentElementHeight] = useState(0);
  let [selected, setSelected] = useState(null);
  let [iconColors, setIconColors] = useState(Traec.Im.List());
  let [state, setState] = useState({ fetchedUrls: {} });

  let {
    companyId,
    trackerId,
    iconPath,
    hostId,
    cumulation,
    setCumulation,
    fetchBody,
    query_params,
    query_string,
    filterHash,
    data,
    fromDate,
    toDate,
    isRootRef
  } = props;

  useEffect(() => {
    Traec.fetchRequiredFor({
      props,
      state,
      setState,
      requiredFetches: [
        new Traec.Fetch(
          `${companyId ? "company" : "tracker"}_dispatch`,
          "post",
          {},
          {
            preDispatchHook: getPreDispatchHook(props)
          }
        )
      ]
    });
  }, [companyId, trackerId, query_string]);

  useEffect(() => {
    let key = "ISSUE_RAG_DATA";
    let iconColors = dataToIconColors(sortAndCropData(data, fromDate, toDate, key), key);
    console.log("Data has changed. Recalculated ISSUE_RAG icon colors", iconColors?.toJS());
    setIconColors(iconColors);
  }, [hostId, fetchBody, query_params, filterHash, data]);

  const iconHeightHandler = element => {
    let eleHeight = element.clientHeight;
    let TOL = 0.98; // Use a tolerance
    if (currentElementHeight < eleHeight * TOL) {
      setCurrentElementHeight(eleHeight);
      setMaxIconHeight(eleHeight);
    }
  };

  const selectIssue = (fullName, name, _id) => {
    let { setSustainabilityIssue } = props;
    if (setSustainabilityIssue) {
      // Set the state elsewhere (ie. in CompanyHome or ProjectHome components)
      setSustainabilityIssue(selected ? null : { fullName, name, id: _id });
    }
    // Set the state of this component
    setSelected(selected ? null : { name, iconFullName: fullName, id: _id });
  };

  let iconWidth = "col-sm-6 col-md-3 col-l-2 col-xl-2";
  if (!iconColors || !iconColors.size) {
    return <Spinner title="Loading dashboard data" timedOutComment="No dashboard data found" />;
  }

  // Flip the icon names
  let reverseIconNames = getReverseIconNames(iconNames);

  const icons = iconColors.map((iconData, i) => {
    let fullName = iconData.get("_key");
    let name = reverseIconNames[fullName] || fullName;
    let _id = iconData.get("category_id");
    //console.log("ICON DATA", iconData?.toJS());
    return (
      <CategoryIcon
        key={i}
        hostId={hostId}
        category_id={_id}
        iconName={name}
        iconFullName={fullName}
        iconColor={iconData.get("color")}
        widthOffset={iconWidth}
        iconHeightHandler={iconHeightHandler}
        iconHeight={maxIconHeight}
        iconPath={iconPath}
        selected={selected?.id === _id}
        onClickHandler={() => selectIssue(fullName, name, _id)}
      />
    );
  });

  return (
    <ErrorBoundary>
      <div className="row">
        <BSCardGrid
          widthOffset="col-sm-12"
          title={`Sustainability Issues`}
          body={icons}
          //button={(<CumulativeButton cumulation={cumulation} setCumulation={setCumulation} />)}
        />
      </div>

      <IndicatorPanelWrapper {...props} selected={selected} />

      <ErrorBoundary>
        <div className="row">
          <ProjectReportCommitStatus hide={!isRootRef} {...props} />
        </div>
      </ErrorBoundary>
    </ErrorBoundary>
  );
};

const mapStateToProps = (state, ownProps) => {
  let { companyId, refId, hostId } = ownProps;

  // Get the hostId (it could be companyId or projectId - hostId is deprecated)
  hostId = hostId || companyId || refId;

  // Override the cumulation setting (to always use the total)
  let _ownProps = { ...ownProps, cumulation: "total" };

  // Add the body of our API data call to the props (so we can get it in the requiredFetches above)
  let { fetchBody, filterHash, queryParams: query_params } = getFetchBody(_ownProps, "ISSUE_RAG_DATA");
  let query_string = new URLSearchParams(query_params).toString();

  // Load any data that has been fetched to redux
  let data = state.getInPath(`entities.${reduxDataPath({ ..._ownProps, filterHash })}`);

  // Get the reporting periods
  let selectedReportingPeriods = data
    ?.toList()
    .sortBy(i => i.get("startDate"))
    .reverse()
    .slice(0, 6)
    .reverse();

  // Get the path for the icons to use
  let iconPath = state.getInPath(`ui.styles.iconPath`);

  return { hostId, fetchBody, filterHash, query_params, query_string, data, iconPath, selectedReportingPeriods };
};

export default connect(mapStateToProps)(SustainabilityPanel);
