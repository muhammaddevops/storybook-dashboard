import "./App.css";
import { sustainabilityTips } from "./sustainabilityTips";

function App() {
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  console.log(getRandomInt(2));
  let randomNumb = getRandomInt(2);
  let tipAtRuntime = randomNumb;

  return (
    <div className="App">
      <div className="spinner">
        <div className="spinner-children">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            fill="currentColor"
            className="bi bi-bar-chart-line-fill"
            viewBox="0 0 16 16"
          >
            <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1V2z" />
          </svg>
          <p style={{ fontSize: "1.5rem" }}> Building...</p>
          <p> This will take a few seconds</p>
        </div>
        <div className="spinner-sector spinner-sector-red"></div>
        <div className="spinner-sector spinner-sector-blue"></div>
        <div className="spinner-sector spinner-sector-green"></div>
      </div>
      <p>
        {sustainabilityTips[tipAtRuntime].message}{" "}
        <a href={sustainabilityTips[tipAtRuntime].link} target="_blank">
          Click here to learn how
        </a>
        .
      </p>
      {console.log("tipAtRuntime >", tipAtRuntime)}
    </div>
  );
}

export default App;