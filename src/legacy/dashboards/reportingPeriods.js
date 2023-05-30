import Moment from "moment";
import { parseReportingPeriods } from "storybook-dashboard/dashboards";

export const reportingPeriodsToFromDates = function(reportingPeriods) {
  //console.log('REPORTING PERIODS')
  let startDate = null;
  let endDate = null;
  reportingPeriods.map(
    period =>
      ({ startDate, endDate } = isAboveOrBelowDate(startDate, period.get("startDate"), endDate, period.get("endDate")))
    //console.log(period.toJS())
  );
  //console.log("START DATE", startDate, "END DATE", endDate)
  return { startDate, endDate };
};

export const isAboveOrBelowDate = function(startDateOrigin, startDate, endDateOrigin, endDate) {
  //console.log('START DATE', startDate, startDateOrigin, Moment(startDate).isBefore(Moment(startDateOrigin)))
  //console.log('END DATE', endDate, endDateOrigin, Moment(endDate).isAfter(Moment(endDateOrigin)))
  //console.log('')

  if (Moment(startDate).isBefore(Moment(startDateOrigin)) || !startDateOrigin) {
    startDateOrigin = startDate;
  }

  if (Moment(endDate).isAfter(Moment(endDateOrigin)) || !endDateOrigin) {
    endDateOrigin = endDate;
  }

  return { startDate: startDateOrigin, endDate: endDateOrigin };
};

export const shouldComponentReFetch = function(reportingPeriods, newDate, prevCommitId, prevIsCumulative) {
  let shouldReFetch = false;

  if (prevIsCumulative != this.props.isCumulative) {
    return true;
  }

  //console.log('REFETCH!!', prevCommitId, this.props.refId)
  if (prevCommitId !== this.props.refId) {
    this.setState({
      fetchedReportingPeriods: false,
      parsedReportingPeriods: false
    });

    return true;
  }

  if (reportingPeriods && this.state.fetchedReportingPeriods) {
    let { startDate, endDate } = reportingPeriodsToFromDates(reportingPeriods);
    //console.log(this.state.fromDate.format(), '<', Moment(startDate).subtract(1, 'month').format(), '-', Moment(endDate).add(1, 'month').format(), '>', this.state.toDate.format())
    //console.log(this.state.fromDate.isBefore(Moment(startDate).subtract(1, 'month')), this.state.toDate.isAfter(Moment(endDate).add(1, 'month')))

    if (newDate.fromDate) {
      let becauseDate = newDate.fromDate.isBefore(Moment(startDate).subtract(1, "month"));
      if (becauseDate) {
        //console.log("SETTING TO FALSE 1", newDate.fromDate, startDate, this.state);
        this.setState({
          fetchedReportingPeriods: false,
          parsedReportingPeriods: false
        });
      }
      return becauseDate;
    } else if (newDate.toDate) {
      let becauseDate = newDate.toDate.isAfter(Moment(endDate).add(1, "month"));
      if (becauseDate) {
        this.setState({
          fetchedReportingPeriods: false,
          parsedReportingPeriods: false
        });
      }
      return becauseDate;
    }
  } else {
    return false;
  }
};

export const shouldDashboardReparse = function(prevId, prevReports, currentId, currentReports, prevProps, thisProps) {
  // If we have changed cumulative to current
  if (prevProps.isCumulative !== thisProps.isCumulative) {
    return true;
  }
  // If any other details have changed
  if (prevReports && prevId && currentReports) {
    return prevId !== currentId || prevReports.size !== currentReports.size;
  }
};

export const fetchAndParse = function(reportingPeriods, targets, reParseData, reportType = "project") {
  // Get the reporting periods for this project (for the submit form at the bottom)
  if (!reportingPeriods || !this.state.fetchedReportingPeriods) {
    if (!this.state.fetchedReportingPeriods) {
      if (reportType === "project") {
        this.fetchProjectReportingPeriods(true);
      } else if (reportType === "company") {
        this.fetchCompanyReportingPeriods(true);
      }
      this.fetchExcelUrl();
      this.setState({
        indicatorData: null,
        iconColors: {},
        parsedReportingPeriods: false,
        fetchedReportingPeriods: true
      });
    } else {
      //console.log("Calling fetchProjectReportingPeriods")
      if (reportType === "project") {
        this.fetchProjectReportingPeriods(false);
      } else if (reportType === "company") {
        this.fetchCompanyReportingPeriods(false);
      }
      if (this.state.parsedReportingPeriods) {
        this.setState({
          indicatorData: null,
          iconColors: {},
          parsedReportingPeriods: false,
          fetchedReportingPeriods: false
        });
      }
    }
  }

  //console.log("AT IF STATEMENT", projectReportingPeriods, this.state.parsedReportingPeriods, reParseData)
  if (reportingPeriods && (!this.state.parsedReportingPeriods || reParseData)) {
    //Parsing for Icon Charts
    //console.log("Re-parsing PROJECT data")
    let data = parseReportingPeriods(reportingPeriods, targets, this.state.fromDate, this.state.toDate);
    //debugger
    //console.log("parsed PROJECT DATA", data)
    this.setState({
      indicatorData: data.indicators,
      iconColors: data.iconColors,
      parsedReportingPeriods: true
    });
  }
};

export const setDateRangeValue = function(e) {
  let { name, value } = e.target;

  // Adjust the value to the beginning of the day and remove timezone
  let momentValue = value
    ? Moment(value)
        .utc(true)
        .startOf("day")
    : null;
  //console.log("Moment value", momentValue);

  let defaultValue = new Moment().endOf("day");
  if (name && name.includes("from")) {
    defaultValue = new Moment().subtract(8, "months").startOf("day");
  }

  this.setState({
    [name]: momentValue || defaultValue,
    parsedReportingPeriods: false
  });
  // Also save to localStorage
  let { companyId, projectId, refId } = this.props;

  // Use 8-character UUIDs for saving the date range
  let _projectId = projectId && typeof projectId == "string" ? projectId.substring(0, 8) : undefined;
  let _refId = refId && typeof refId == "string" ? refId.substring(0, 8) : undefined;
  let _companyId = companyId && typeof companyId == "string" ? companyId.substring(0, 8) : undefined;

  if (momentValue) {
    let key = _companyId ? `${name}:${_companyId}` : `${name}:${_projectId}_${_refId}`;
    let storageValue = momentValue.toISOString();
    console.log(`Setting localStorage key: ${key} to ${storageValue}`);
    localStorage.setItem(key, storageValue);
  }

  let { projectReportingPeriods, companyReportingPeriods } = this.props;
  if (projectReportingPeriods) {
    this.shouldComponentReFetch(projectReportingPeriods, { [name]: momentValue });
  } else if (companyReportingPeriods) {
    this.shouldComponentReFetch(companyReportingPeriods, { [name]: momentValue });
  }
};
