import TipsSpinner from "./spinners/tipsSpinner";
import StackedBarPopulated from "./chartComponents/StackedBarChart";
import HorizontalStackedBarPopulated from "./chartComponents/horizontalStackedBar";
import CumHorizBarPop from "./carbonMockData/toolData/cumBar";
import { ISSUE_RAG_DATA } from "./carbonMockData/toolData/_data";

function App() {
  return (
    <>
      <TipsSpinner />
      <CumHorizBarPop />
    </>
  );
}

export default App;
