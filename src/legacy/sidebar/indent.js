import React from "react";
import Octicon from "react-octicon";

function VerticalBars({ num }) {
  let vertical_bars = [];
  let style = {
    height: "100%",
    borderLeft: "1px solid black",
    marginLeft: "0.25rem",
    marginRight: "1rem",
    display: "inline-block"
  };
  for (let i = 0; i < num; i++) {
    vertical_bars.push(<div key={i} className="vertical_line" style={style}></div>);
  }
  return vertical_bars;
}

export function Indent({ depth, onClickHandler, expanded = true }) {
  if (!depth) {
    return null;
  }
  return (
    <div className="indent-container" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <VerticalBars num={depth} />
      <p
        className="m-0 p-0"
        style={{
          display: "inline-block",
          verticalAlign: "top",
          cursor: "pointer"
        }}
        onClick={onClickHandler}
      >
        <Octicon name={`triangle-${expanded ? "down" : "right"}`} />
      </p>
    </div>
  );
}
