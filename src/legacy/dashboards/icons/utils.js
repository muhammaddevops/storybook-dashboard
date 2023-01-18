import { iconKeySwaps } from "../utils";

export const getColor = colorName => {
  if (colorName === "#cccccc" || colorName === "grey") {
    return "#a6a6a6";
  }
  if (!colorName) {
    return "#a6a6a6";
  }
  if (colorName.startsWith("#")) {
    return colorName;
  }
  //
  switch (colorName) {
    case "red":
      return "#db1919";
    case "green":
      return "#36aa47";
    case "amber":
      return "#ffcc00";
    case "grey":
      return "#c2c2c2";
  }
  //
  throw `colorName not supported. It has to be: red, green, amber or grey. Given value was: ${colorName}`;
};

export const getBgGradient = colorName => {
  switch (colorName) {
    //grey
    case "#cccccc":
      return "linear-gradient(#a6a6a6, #808080)";
    //red
    case "#db1919":
      return "linear-gradient(#FF5656, #c20000)";
    //green
    case "#36aa47":
      return "linear-gradient(#2ECC45, #007511)";
    //amber
    case "#ffcc00":
      return "linear-gradient(#ff8f00, #db7a00)";
    default:
      return "";
  }
};

export const availableIcons = new Set([
  "air-quality",
  "awards",
  "biodiversity",
  "carbon",
  "carbon-and-energy",
  "carbon-by-scope",
  "ceequal",
  "climate-change",
  "community",
  "community-wellbeing",
  "diversity-and-equality",
  "economic-prosperity",
  "edi",
  "employee-engagement",
  "employee-relations",
  "employees",
  "ems",
  "equality-diversity-inclusion",
  "ethics",
  "future-of-work",
  "governance-and-safety",
  "governance",
  "people-wellbeing",
  "health-safety",
  "local",
  "materials",
  "noise-and-vibration",
  "other",
  "process-and-productivity",
  "quality",
  "skills-and-employment",
  "social-value",
  "supply-chain",
  "waste",
  "water",
  "company-policies",
  "gender",
  "workforce",
  "survey-statistics",
  "company-policies",
  "recruitment",
  "gender",
  "ethnicity",
  "age",
  "disability",
  "religion-and-belief",
  "sexual-orientation",
  "pay-gap"
]);

export const getLogo = (logoName, iconPath) => {
  logoName = logoName.toLowerCase();
  logoName = iconKeySwaps[logoName] || logoName;
  logoName = logoName.replaceAll(" ", "-");

  if (!availableIcons.has(logoName)) {
    logoName = "other";
  }

  let basePath = iconPath || "/assets/images/icons/";
  let parts = basePath.split("/").filter(i => i);
  let extension = parts.pop();
  extension = extension.length === 3 ? extension : "png";
  return `${basePath}metric-category-${logoName}.${extension}`;
};

export const metricName = name => {
  if (name === "ems") {
    return "Environmental Management";
  } else if (name === "health-safety") {
    return "Health & Safety";
  } else if (name === "local") {
    return "Procurement";
  } else if (name === "process-and-productivity") {
    return "Process & Productivity";
  } else if (name === "workforce") {
    return "Employees";
  } else if (name == "equality-diversity-inclusion") {
    return "Equality, Diversity & Inclusion";
  } else if (name === "air-quality") {
    return "Air Quality";
  } else if (name === "value-social") {
    return "Social Value";
  } else {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
};

export const reverseMetricName = name => {
  if (name === "Environmental Management") {
    return "ems";
  } else if (name === "Health & Safety") {
    return "health-safety";
  } else if (name == "Equality, Diversity & Inclusion") {
    return "equality-diversity-inclusion";
  } else if (name === "Process & Productivity") {
    return "process-and-productivity";
  } else if (name === "Procurement") {
    return "local";
  } else if (name === "Employees") {
    return "workforce";
  } else if (name === "Air Quality") {
    return "air-quality";
  } else if (name === "Social Value") {
    return "social-value";
  } else if (name === "Climate Change") {
    return "climate-change";
  } else {
    return name.toLowerCase();
  }
};

export const updateHighlight = function(e, action) {
  e.preventDefault();
  this.setState({ highlight: action });
};
