import React from "react";
import Moment from "moment";

const dateString = (obj, field, add = 0, prefix = "") => {
  let m = Moment(obj.get(field));
  if (add) {
    m = m.add(add, "days");
  }
  return `${prefix}${m.format("Do MMM YY")}`;
};

export const DateString = ({ obj, field, add = 0, prefix = "" }) => {
  return <React.Fragment>{dateString(obj, field, add, prefix)}</React.Fragment>;
};

export const ReportPeriodString = ({ reportPeriod }) => {
  if (!reportPeriod) {
    return null;
  }
  let startDate = <DateString obj={reportPeriod} field={"startDate"} />;
  let endDate = <DateString obj={reportPeriod} field={"endDate"} add={-1} />;
  return (
    <React.Fragment>
      {startDate} to {endDate}
    </React.Fragment>
  );
};

export const reportPeriodString = rp => {
  return `${dateString(rp, "startDate")} to ${dateString(rp, "endDate", -1)}`;
};
