import Moment from "moment";


export function ReportPeriodString(item) {
    return `${Moment(item.get("startDate")).format("Do MMM YY")} to ${Moment(item.get("endDate"))
      .add(-1, "days")
      .format("Do MMM YY")}`;
}