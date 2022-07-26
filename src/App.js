import TipsSpinner from "./spinners/tipsSpinner";
import { sustainabilityTips } from "./spinners/sustainabilityTips";
import StackedBarPopulated from "./chartComponents/StackedBarChart";

function App() {
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  console.log("array length", sustainabilityTips.length);
  let randomTip = getRandomInt(sustainabilityTips.length);
  let tipAtRuntime = randomTip;

  return (
    <>
      <TipsSpinner />
      <StackedBarPopulated />
    </>
  );
}

export default App;
