import React from "react";
import Traec from "traec";

import { ReportPeriodString } from "storybook-dashboard/legacy/utils/dates";

export const getTerm = (term, props) => {
  let { tenant_meta } = props;
  let term_map = (tenant_meta || Traec.Im.Map()).get("term_map") || Traec.Im.Map();
  return term_map.get(term) || term;
};

const getDisciplineOptions = disciplines => {
  if (!disciplines) {
    return [];
  }
  return disciplines
    .toList()
    .map((element, i) => (
      <option key={i} value={element.get("base_uid")}>
        {element.get("name")}
      </option>
    ))
    .unshift(<option key={-1} value={""} />)
    .toArray();
};

const getReportingPeriodOptions = projectReportingPeriods => {
  if (!projectReportingPeriods) {
    return [];
  }
  return projectReportingPeriods
    .toList()
    .sortBy(i => i.get("startDate"))
    .map((item, i) => (
      <option key={i} value={item.get("uid")}>
        {ReportPeriodString(item)}
      </option>
    ))
    .unshift(<option key={-1} value={""} />)
    .toArray();
};

export function setNewWorkPackageFields(fields, disciplines, projectReportingPeriods) {
  let setFields = Object.assign({}, fields);
  setFields.latest_commit__discipline.options = getDisciplineOptions(disciplines);
  setFields.latest_commit__reporting_period.options = getReportingPeriodOptions(projectReportingPeriods);
  return setFields;
}

export function nestDunderKeys(data) {
  let nestedData = {};
  for (let [key, value] of Object.entries(data)) {
    let parts = key.split("__");
    let _key = parts[0];
    let _nest_key = parts.slice(1).join("__");
    nestedData[_key] = _nest_key ? nestDunderKeys({ ...nestedData[_key], [_nest_key]: value }) : value;
  }
  return nestedData;
}
