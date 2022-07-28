import { StackedBarChart } from "@carbon/charts-react";
import "@carbon/styles/css/styles.css";
import "@carbon/charts/styles.css";
import Data from "../carbonMockData/horizontalStackedBar/data";
import Options from "../carbonMockData/horizontalStackedBar/options.json";

export default function HorizontalStackedBarPopulated() {
  return <StackedBarChart options={Options} data={Data} />;
}
