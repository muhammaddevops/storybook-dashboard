import Im from "traec/immutable";
import chroma from "chroma-js";
import {
  getLabel,
  pushIndicatorTargets,
  pushIndicatorThresholds,
  generateHashColor,
  removeEmptyIndicators,
  computeIndicatorColor,
  createChartData
} from "./reportingParser";
import traec from "traec";

export const colorScale = chroma.scale([
  "#db1919",
  "#e75818",
  "#f18215",
  "#f9a80e",
  "#ffcc00",
  "#d5c523",
  "#a9bd33",
  "#78b43e",
  "#36aa47"
]);
export const amberColorScale = chroma.scale([
  "#ff6f00",
  "#fe7f00",
  "#fd8d00",
  "#fb9c00",
  "#f9a900",
  "#f7b500",
  "#f4c300",
  "#f1ce00",
  "#eddb00"
]);

export const getIndicatorMap = (data, staticTargets = null, cum_period = "total", baseKey = "INDICATOR_DATA") => {
  let indicators = Im.Map({});

  /* Data should be already sorted before passing here */
  data.map(item => {
    // If we don't have any indicator data then continue on
    let indicatorList = item.getInPath(`${baseKey}.${cum_period}.indicators`)?.toList();
    if (!indicatorList) {
      return;
    }

    // We have some indicators so try to parse them and the targets
    // First create a map of the targets by metriId (we are reducing the list down to a map)
    // NOTE:  The map is a plain JS Object but the entries are Immutable
    let targetList = staticTargets || (item.getInPath(`${baseKey}.${cum_period}.targets`) || traec.Im.Map()).toList();
    let metricTargetMap = targetList
      ? targetList.reduce((obj, item) => ({ ...obj, [item.getInPath("metric.uid")]: item }), {})
      : {};

    // Now go through each indicator and match up with the targets
    indicatorList.map(indicatorData => {
      let metricId = indicatorData.getInPath("resultBaseMetric.uid");
      let indicatorTarget = metricTargetMap[metricId]; // NOTE:  The map is a plain JS Object but the entries are Immutable
      // Set the target within the indicator (for consistency with how data is presented for MetricTargetSet)
      indicatorData = indicatorData.set("metricTarget", indicatorTarget);

      let greenBelow = indicatorTarget ? indicatorTarget.getInPath("meta_json.greenBelow") : null;
      let indicatorName = indicatorData.getInPath("resultBaseMetric.name");
      let indicatorCategory = indicatorData.getInPath("resultBaseMetric.category");

      // Add the indicatorName to this category
      if (!indicators.hasIn([indicatorCategory, indicatorName])) {
        indicators = indicators.setIn(
          [indicatorCategory, indicatorName],
          Im.Map({
            value: Im.List(),
            target: Im.List(),
            threshold: Im.List(),
            indicator: indicatorData,
            metricTarget: indicatorTarget,
            greenAbove: !greenBelow
          })
        );
      }

      // Push the results into the indicator object
      indicators = indicators.setIn(
        [indicatorCategory, indicatorName, "value"],
        indicators.getIn([indicatorCategory, indicatorName, "value"]).push(indicatorData.get("resultValue"))
      );

      // Push the target and threshold value
      let key = item.get("startDate");
      indicators = pushIndicatorTargets(indicators, indicatorCategory, indicatorName, indicatorTarget, key);
      indicators = pushIndicatorThresholds(indicators, indicatorCategory, indicatorName, indicatorTarget, key);
      return;
    });
  });
  //console.log("INDICATORS", indicators.length);
  return indicators;
};

export function generateIndicatorTargetMap(
  summaryData,
  staticTargetList,
  cum_period = "total",
  baseKey = "INDICATOR_DATA"
) {
  let indicatorValues = getIndicatorMap(summaryData, staticTargetList, cum_period, baseKey);

  // Get the date labels
  const labels = summaryData
    .filter(i => i.getInPath(`${baseKey}.${cum_period}.indicators`)?.size)
    .map(i => getLabel(i));

  // Get the issues that are in the indicators
  let indicatorData = indicatorValues.map(indicator => {
    return indicator.map((subElement, subKey) => {
      let computedColor = computeIndicatorColor(subElement.toJS());

      return Im.Map({
        thresholds: { target: subElement.get("target"), lower: subElement.get("threshold") },
        dataset: createChartData(labels, generateHashColor(subKey), subElement.get("value"), subKey),
        color: computedColor.color,
        indicator: subElement.get("indicator"),
        metricTarget: subElement.get("metricTarget")
      });
    });
  });
  let { filteredData } = removeEmptyIndicators(indicatorData, Im.fromJS({}));

  return filteredData;
}

export function generateIndicatorChart(indicatorData, category, indicatorNames = Im.List()) {
  if (!category) {
    return false;
  }

  /*console.log("indicatorData", indicatorData?.toJS());
  console.log("category", category);
  console.log("indicatorNames", indicatorNames?.toJS());*/

  let chartData = Im.Map({ labels: [], datasets: Im.List([]) });

  if (indicatorNames.size > 1) {
    chartData = chartData.set("labels", indicatorData.getIn([category, indicatorNames.first(), "dataset", "labels"]));
    indicatorNames.map(
      name =>
        (chartData = chartData.setIn(
          ["datasets", chartData.get("datasets").size],
          indicatorData.getIn([category, name, "dataset", "datasets", 0])
        ))
    );
  } else if (indicatorNames.size === 1) {
    let indicatorName = indicatorNames.first();
    let targetData = indicatorData.getIn([category, indicatorName, "thresholds", "target"]);

    targetData = targetData ? targetData.toJS() || [] : [];
    let lowerThresholdData = indicatorData.getIn([category, indicatorName, "thresholds", "lower"]);

    lowerThresholdData = lowerThresholdData ? lowerThresholdData.toJS() || [] : [];
    //let isTargetAbove = targetData[targetData.length - 1] > lowerThresholdData[lowerThresholdData.length - 1]

    let color = "#36aa47";
    let target = {
      label: "Target",
      data: targetData,
      backgroundColor: color,
      borderColor: color,
      type: "line"
    };

    chartData = chartData.setIn(["datasets", chartData.get("datasets").size], target);

    if (lowerThresholdData) {
      color = "#db1919";
      let lower = {
        label: "Red/Amber Threshold",
        data: lowerThresholdData,
        backgroundColor: color,
        borderColor: color,
        type: "line"
      };
      chartData = chartData.setIn(["datasets", chartData.get("datasets").size], lower);
    }

    chartData = chartData.set("labels", indicatorData.getIn([category, indicatorNames.first(), "dataset", "labels"]));
    chartData = chartData.setIn(
      ["datasets", chartData.get("datasets").size],
      indicatorData.getIn([category, indicatorNames.first(), "dataset", "datasets", 0])
    );
  }
  return chartData;
}

export function getIconColor() {
  if (!this.state.indicatorData) {
    return "";
  }

  const [...colorKeys] = this.state.indicatorData.keys();

  let colors = {};
  for (let key in colorKeys) {
    colors[colorKeys[key]] = this.state.indicatorData.getIn([colorKeys[key], "color"]);
  }

  return Im.fromJS(colors);
}

export function getIndicatorColors() {
  if (!this.state.indicatorData || !this.state.iconActivated) {
    return "";
  }

  let categoryIndicators = this.state.indicatorData.get(this.state.iconActivated);

  if (!categoryIndicators) {
    return "";
  }

  let colors = {};
  for (let [key, indicatorData] of categoryIndicators.entries()) {
    colors[key] = {
      indicator: indicatorData,
      name: key,
      color: indicatorData.get("color")
    };
  }

  return colors;
}

export function getColor(colorValue) {
  const TOL = 1e-3;
  let _colorScale = colorScale;
  if (colorValue > TOL && colorValue < 1 - TOL) {
    _colorScale = amberColorScale;
  }
  return _colorScale(colorValue);
}

export function exceedingThreshold(sliderValue, data, iconName) {
  let maxValue = Math.max.apply(
    null,
    data
      .get("datasets")
      .first()
      .get("data")
      .toJS()
  );

  if (maxValue >= sliderValue[1]) {
    let newData = this.state.iconData.setIn([iconName, "color"], "#db1919");
    this.setState({ iconData: newData });
  } else if (maxValue <= sliderValue[0]) {
    let newData = this.state.iconData.setIn([iconName, "color"], "#36aa47");
    this.setState({ iconData: newData });
  } else {
    let colorValue = (maxValue - sliderValue[0]) / (sliderValue[1] - sliderValue[0]);
    //Original colors['#db1919', '#ffcc00', '#36aa47']
    let newData = this.state.iconData.setIn([iconName, "color"], getColor(colorValue).hex());
    this.setState({ iconData: newData });
  }
}

export const iconNames = {
  "air-quality": "Air Quality",
  awards: "Awards",
  biodiversity: "Biodiversity",
  carbon: "Carbon",
  "carbon-by-scope": "CO2e by scope",
  "climate-change": "Climate Change",
  community: "Community",
  "diversity-and-equality": "Diversity & Equality",
  workforce: "Employees",
  "employee-engagement": "Employee Engagement",
  ems: "Environmental Management",
  ethics: "Ethics",
  "economic-prosperity": "Economic Prosperity",
  "community-wellbeing": "Community Wellbeing",
  "equality-diversity-inclusion": "Equality, Diversity & Inclusion",
  "future-of-work": "Future of Work",
  "governance-and-safety": "Governance & Safety",
  governance: "Governance",
  "health-safety": "Health & Safety",
  materials: "Materials",
  "people-wellbeing": "People Wellbeing",
  "process-and-productivity": "Process & Productivity",
  local: "Procurement",
  "social-value": "Social Value",
  waste: "Waste",
  water: "Water",
  other: "Other"
};

export const iconNameSwaps = {
  EMS: "Environmental Management"
};

export const iconKeySwaps = {
  EMS: "ems",
  "skills & employment": "skills-and-employment",
  "employee relations": "employee-relations",
  "supply chain": "supply-chain",
  "co2e by scope": "carbon-by-scope"
};

/**********
 * UNUSED UTILITIES
 */

export function onIconClick(e, iconName) {
  e.preventDefault();
  if (this.state.iconActivated === iconName) {
    this.setState({
      iconActivated: false,
      indicatorActivated: false
    });
  } else {
    this.setState({
      iconActivated: iconName,
      indicatorActivated: false,
      //detailedIconChart: this.state.iconData.get(iconName),
      indicatorChart: this.generateIndicatorChart(iconName)
    });
  }
}

export function onIndicatorClick(e, indicatorName, indicator) {
  e.preventDefault();
  let { indicatorActivated, iconActivated } = this.state;
  if (indicatorActivated && indicatorActivated.name === indicatorName) {
    this.setState({
      indicatorActivated: false,
      indicatorChart: this.generateIndicatorChart(iconActivated)
    });
  } else {
    this.setState({
      indicatorActivated: {
        name: indicatorName,
        indicator,
        metricTarget: indicator.metricTarget
      },
      indicatorChart: this.generateIndicatorChart(iconActivated, indicatorName)
    });
  }
}
