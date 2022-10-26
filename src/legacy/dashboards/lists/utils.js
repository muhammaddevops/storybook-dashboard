import React from "react";
import Traec from "traec";
import { Tooltip } from "react-tippy";
import Octicon from "react-octicon";

export function TitleTooltip({ text }) {
  if (!text) {
    return null;
  }
  return (
    <Tooltip animateFill={false} html={<div className="text-left">{text}</div>}>
      <Octicon name="info" className="ml-2" />
    </Tooltip>
  );
}

export const charToColor = c => {
  switch (c) {
    case "r":
      return "red";
    case "g":
      return "green";
    case "a":
      return "amber";
    default:
      return "grey";
  }
};

export function getCompanyResults(reportPeriod, projectId, categoryName, indicator, indicatorOnly) {
  let resultList = reportPeriod.getInPath(`project_results.${projectId}`);
  return getResults(resultList, indicatorOnly, indicator, categoryName);
}

export function getProjectResults(reportPeriod, refId, categoryName, indicator, indicatorOnly) {
  let resultList = reportPeriod.getInPath(`ref_results.${refId}`);
  return getResults(resultList, indicatorOnly, indicator, categoryName);
}

export const getResults = function(resultList, indicatorOnly, indicator, categoryName) {
  if (indicatorOnly && !indicator) {
    return null;
  }
  let indicatorId = indicator ? indicator.getInPath("indicator.uid") : null;

  // Get the color of this cell
  let result = null;
  if (resultList) {
    if (indicatorOnly && indicatorId) {
      result = resultList.getInPath(`results.indicators.${indicatorId}`);
    } else {
      result = resultList.getInPath(`results.categories.${categoryName}`);
    }
  }
  return result;
};

export const getRefsFromReportingPeriods = props => {
  // Get all of the refs with commit_results in the reporting periods we have selected
  let { selectedReportingPeriods, cum_period } = props;
  let refs = Traec.Im.Set();
  if (!selectedReportingPeriods) {
    return refs;
  }
  for (let rp of selectedReportingPeriods.toList()) {
    let commitResults = rp.getInPath(`PROJECT_REPORT_COMMIT_STATUS`);
    if (commitResults) {
      for (let commit of commitResults.toList()) {
        refs = refs.add(commit.get("ref"));
      }
    }
  }
  return refs;
};
