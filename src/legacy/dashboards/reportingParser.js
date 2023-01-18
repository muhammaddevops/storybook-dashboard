import Im from "traec/immutable";
import Moment from "moment";
import chroma from "chroma-js";
import { getColor } from "./utils";

const getIndicatorValues = (data, indicators, staticTargets = null, cum_period = "total") => {
  /* Data should be already sorted before passing here */
  for (let item of data) {
    // If we don't have any indicator data then continue on
    let indicatorList = item.getInPath(`summary.${cum_period}.indicators`);
    if (!indicatorList) {
      continue;
    }
    // We have some indicators so try to parse them and the targets
    // First create a map of the targets by metriId (we are reducing the list down to a map)
    // NOTE:  The map is a plain JS Object but the entries are Immutable
    let targetList = staticTargets || item.getInPath(`summary.${cum_period}.targets`);
    let metricTargetMap = targetList
      ? targetList.reduce((obj, item) => {
          let metricId = item.getIn(["metric", "uid"]);
          obj[metricId] = item;
          return obj;
        }, {})
      : {};

    // Now go through each indicator and match up with the targets
    for (let indicatorData of indicatorList) {
      let metricId = indicatorData.getInPath("resultBaseMetric.uid");
      let indicatorTarget = metricTargetMap[metricId]; // NOTE:  The map is a plain JS Object but the entries are Immutable
      // Set the target within the indicator (for consistency with how data is presented for MetricTargetSet)
      indicatorData = indicatorData.set("metricTarget", indicatorTarget);

      let greenBelow = indicatorTarget ? indicatorTarget.getInPath("meta_json.greenBelow") : null;
      let indicatorName = indicatorData.getInPath("resultBaseMetric.name");
      let indicatorCategory = indicatorData.getInPath("resultBaseMetric.category");

      /*if (indicatorName.startsWith("Total GHG emissions")) {
        console.log("INDICATOR DETAILS", greenBelow, indicatorData.toJS(), indicatorTarget ? indicatorTarget.toJS() : null)
      }*/

      // Add the category to the indicators object if it doesnt already exist

      if (!indicators[indicatorCategory]) {
        indicators[indicatorCategory] = {};
      }

      // Add the indicatorName to this category
      if (!indicators[indicatorCategory][indicatorName]) {
        indicators[indicatorCategory][indicatorName] = {
          value: [],
          target: [],
          threshold: [],
          indicator: indicatorData,
          metricTarget: indicatorTarget,
          greenAbove: !greenBelow
        };
      }
      // Push the results into the indicator object
      indicators[indicatorCategory][indicatorName]["value"].push(indicatorData.get("resultValue"));

      // Push the target and threshold value
      let key = item.get("startDate");
      pushIndicatorTargets(indicators, indicatorCategory, indicatorName, indicatorTarget, key);
      pushIndicatorThresholds(indicators, indicatorCategory, indicatorName, indicatorTarget, key);
    }
  }
  return indicators;
};

export const getTargetFromList = (date, targets, key = "target") => {
  if (!date || !targets) {
    return null;
  }

  let valid_targets = targets.filter(i => i.get("startDate") <= date);
  let item = valid_targets.sortBy(i => i.get("startDate")).last();
  let target = item ? item.get(key) : null;

  //console.log("GETTING TARGET FROM LIST", date, target, item ? item.toJS() : null, targets.toJS())
  return target;
};

export const pushIndicatorTargets = (indicators, indicatorCategory, indicatorName, indicatorTarget, key) => {
  let target = null;
  if (indicatorTarget) {
    target = getTargetFromList(key, indicatorTarget.getInPath("meta_json.byDate"));
    target = target || indicatorTarget.get("value");
    //target = (target == null) ? indicatorTarget.get("value") : target
  }
  return indicators.setIn(
    [indicatorCategory, indicatorName, "target"],
    indicators.getIn([indicatorCategory, indicatorName, "target"]).push(target)
  );
};

export const pushIndicatorThresholds = (indicators, indicatorCategory, indicatorName, indicatorTarget, key) => {
  let threshold = null;
  if (indicatorTarget) {
    threshold = getTargetFromList(key, indicatorTarget.getInPath("meta_json.byDate"), (key = "threshold"));
    threshold = threshold || indicatorTarget.getInPath("meta_json.thresholdLow");
    //threshold = (threshold == null) ? indicatorTarget.getInPath("meta_json.thresholdLow") : threshold
  }

  return indicators.setIn(
    [indicatorCategory, indicatorName, "threshold"],
    indicators.getIn([indicatorCategory, indicatorName, "threshold"]).push(threshold)
  );
};

export const generateHashColor = name => {
  let colorNumber =
    "0x" +
    crypto.createHash("sha1")
      .update(name)
      .digest("hex")
      .substring(0, 6);

  let scale = chroma
    .scale([
      "fec0ce",
      "ce7da5",
      "90fcf9",
      "235789",
      "56638a",
      "483a58",
      "56203d",
      "8d6346",
      "f7b801",
      "f9e784",
      "826aed",
      "c879ff",
      "cb48b7",
      "ffb7ff",
      "ff708d",
      "ffb997",
      "fac8cd",
      "f3d9dc",
      "d4cbe5",
      "bbada0",
      "ef8354",
      "793302",
      "72655a",
      "50473f",
      "645902",
      "a39000",
      "ffcf56",
      "fde849",
      "ffe196",
      "fff5ad",
      "4d9de0",
      "4a5ae8",
      "1e07b0",
      "0e0e52",
      "36413e",
      "12918d",
      "6eede9",
      "42e2b8",
      "8be8cb",
      "d7fdec"
    ])
    .domain([0, 16777215]);

  return scale(parseInt(Number(colorNumber), 10)).hex();
};

export const createChartData = (dates, color, dataset, label) => {
  let data = {};
  data.labels = dates;

  if (Object.entries(dataset).length === 0 && dataset.constructor === Object) {
    dataset = Array(dates.length).fill(0);
  }

  data.datasets = [{ label: label, data: dataset, backgroundColor: color }];

  return data;
};

export const computeIndicatorColor = indicatorData => {
  let { value: data, target: targets, threshold: thresholds, greenAbove } = indicatorData;

  const lastValidData = data[nonNullIndex(data)];
  const target = targets[nonNullIndex(targets)];
  const threshold = thresholds[nonNullIndex(thresholds)];
  let colorValue = null;

  if (lastValidData == null || target == null) {
    return { color: "#c2c2c2", value: null };
  } else if (threshold) {
    let thresDiff = target - threshold;
    let valueDiff = lastValidData - threshold;
    colorValue = thresDiff ? valueDiff / thresDiff : 1 * (lastValidData.toFixed(2) >= target);
  } else {
    colorValue = 1 * (lastValidData.toFixed(2) >= target);
  }
  // Crop the color value to between 0 and 1
  if (colorValue < 0.0) {
    colorValue = 0.0;
  } else if (colorValue > 1.0) {
    colorValue = 1.0;
  }

  /* DEBUGGING ONLY 
  let name = indicatorData.indicator.get("name");
  if ( name.startsWith("Total GHG emissions") ) {
    console.log("indicatorData", indicatorData, target, threshold, colorValue)
    debugger
  }*/

  // Flip the color if greenBelow
  if (threshold === null || threshold === undefined) {
    colorValue = greenAbove ? colorValue : 1 - colorValue;
  }

  let ret = {
    color: getColor(colorValue, greenAbove).hex(),
    value: colorValue
  };

  return ret;
};

const reverse = arr => {
  let cpy = [...arr];
  cpy.reverse();
  return cpy;
};

const nonZeroIndex = arr => {
  let res = arr.length - 1 - reverse(arr).findIndex(e => e !== 0.0);
  return res === arr.length ? -1 : res;
};

const nonNullIndex = arr => {
  let res = arr.length - 1 - reverse(arr).findIndex(e => e != null);
  return res === arr.length ? -1 : res;
};

const isAllNull = dataArray => {
  /* O(N) check if all elements are null */
  return dataArray.reduce((a, b) => (b == null && a == null ? null : true), null) == null;
};

export const removeEmptyIndicators = (indicatorData, iconColor) => {
  const [...keys] = indicatorData.keys();
  for (let index in keys) {
    let tempData = indicatorData.get(keys[index]).filter(i => !isAllNull(i.getInPath("dataset.datasets.0.data")));
    if (!tempData.isEmpty()) {
      indicatorData = indicatorData.set(keys[index], tempData);
    } else {
      indicatorData = indicatorData.delete(keys[index]);
      iconColor = iconColor.delete(keys[index]);
    }
  }
  return { filteredData: indicatorData, filteredColors: iconColor };
};

export const getLabel = reportPeriod => {
  return `To ${Moment(reportPeriod.get("endDate"))
    .add(-1, "day")
    .format("Do MMM YYYY")}`;
};

const wrapSummaryToChartData = (
  summaryData,
  staticTargetList = null,
  fromDate = null,
  toDate = null,
  cum_period = "total"
) => {
  // Sort the incoming (immutable) data
  summaryData = summaryData.toList().sortBy(i => i.get("endDate"));

  // Remove data, which is out of the date boundary
  if (fromDate && toDate) {
    summaryData = summaryData.filter(
      i =>
        Moment(i.get("endDate")).isAfter(fromDate) && Moment(i.get("endDate")).isBefore(toDate.clone().add(1, "days"))
    );
  }

  // Remove entries that do not have any summary data attached
  summaryData = summaryData.filter(i => i.getInPath(`summary.${cum_period}.indicators`) != null);

  // Get the date labels
  const labels = summaryData.map(i => getLabel(i));

  let indicators = {
    "Air Quality": {},
    Awards: {},
    Biodiversity: {},
    Carbon: {},
    Community: {},
    "Environmental Management": {},
    Ethics: {},
    "H&S": {},
    Procurement: {},
    Materials: {},
    Waste: {},
    Water: {},
    Employees: {}
  };

  // Parse the indicators into
  let indicatorValues = getIndicatorValues(summaryData, indicators, staticTargetList, cum_period);
  let indicatorData = {};
  let iconColor = {};

  // Get the issues that are in the indicators

  for (let key of Object.keys(indicatorValues)) {
    indicatorData[key] = {};
    let indicator = indicatorValues[key];
    iconColor[key] = 1.0;
    let allColorsInvalid = true;

    for (let subkey in indicator) {
      /*if (subkey.startsWith('Total GHG emissions')) {
        console.log(subkey, "::", indicator[subkey])
        debugger
      }*/
      let computedColor = computeIndicatorColor(indicator[subkey]);

      if (computedColor.value !== null) {
        if (computedColor.value < iconColor[key]) {
          iconColor[key] = computedColor.value;
        }
        allColorsInvalid = false;
      }

      indicatorData[key][subkey] = {
        thresholds: { target: indicator[subkey].target, lower: indicator[subkey].threshold },
        dataset: createChartData(labels, generateHashColor(subkey), indicator[subkey].value, subkey),
        color: computedColor.color,
        indicator: indicator[subkey].indicator,
        metricTarget: indicator[subkey].metricTarget
      };
    }

    if (allColorsInvalid) {
      iconColor[key] = "#c2c2c2";
    } else {
      iconColor[key] = getColor(iconColor[key]).hex();
    }
  }

  // Handle health and safety separately (merge H&S and Health & Safety)
  let healthSafetyData = Im.fromJS(indicatorData["H&S"] || {}).merge(Im.fromJS(indicatorData["Health & Safety"] || {}));
  let healthSafetyColor = iconColor["H&S"] || iconColor["Health & Safety"];

  indicatorData["Health & Safety"] = healthSafetyData.toJS();
  iconColor["Health & Safety"] = healthSafetyColor;
  delete iconColor["H&S"];
  delete indicatorData["H&S"];

  let { filteredData, filteredColors } = removeEmptyIndicators(Im.fromJS(indicatorData), Im.fromJS(iconColor));

  return { indicators: filteredData, iconColors: filteredColors };
};

const parseReportingPeriods = (
  projectReportingPeriods,
  staticTargetList = null,
  fromDate = null,
  toDate = null,
  cum_period = "total"
) => {
  if (projectReportingPeriods) {
    const wrappedData = wrapSummaryToChartData(projectReportingPeriods, staticTargetList, fromDate, toDate, cum_period);
    return wrappedData;
  }
  return null;
};

export { parseReportingPeriods };
