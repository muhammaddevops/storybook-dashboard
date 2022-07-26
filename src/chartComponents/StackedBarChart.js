import { StackedBarChart } from "@carbon/charts-react";
import "@carbon/styles/css/styles.css";
import "@carbon/charts/styles.css";
import Data from "../carbonMockData/byPeriodStackedBar/data";
import Options from "../carbonMockData/byPeriodStackedBar/options.json";

export default function StackedBarPopulated() {
  return <StackedBarChart options={Options} data={Data} />;
}
