import React, { useState, useEffect, useRef } from "react";
import { getColor, getLogo, getBgGradient } from "./utils";
import { iconNameSwaps } from "../utils";

function CategoryIcon(props) {
  let {
    iconHeightHandler,
    iconHeight,
    iconFullName,
    iconColor,
    iconName,
    iconPath,
    selected,
    onClickHandler,
    widthOffset
  } = props;

  // Some refs, state and effects
  const heightEl = useRef(null);
  let [highlight, setHighlight] = useState(false);
  useEffect(() => {
    if (iconHeightHandler) {
      iconHeightHandler(heightEl);
    }
  });

  // The body of the logic
  let styleObj = iconHeight ? { minHeight: `${iconHeight}px` } : {};
  let cardStyle = { paddingBottom: "1em" };

  let outline = highlight ? "3px solid white" : null;
  outline = selected ? "3px solid black" : outline;

  // Transfer names to a standard name (ie  EMS to Environmental Management)
  let renderName = iconNameSwaps[iconFullName] || iconFullName;

  return (
    <div
      className={`${widthOffset}`}
      style={cardStyle}
      onClick={onClickHandler}
      onMouseEnter={e => setHighlight(true)}
      onMouseLeave={e => setHighlight(false)}
    >
      <div
        className={`card h-100 m-0 p-0`}
        style={{
          backgroundColor: getColor(iconColor),
          backgroundImage: getBgGradient(iconColor),
          outline: outline,
          outlineOffset: "-2px",
          boxShadow: selected
            ? "0 10px 16px 0 rgba(0,0,0,0.9),0 6px 20px 0 rgba(0,0,0,0.1)"
            : "0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)",
          borderRadius: "30px",
          cursor: selected ? "grab" : "pointer"
        }}
      >
        <div className="card-img">
          <img
            className="card-img-top-fluid mx-auto d-block"
            src={getLogo(iconName, iconPath)}
            width="80px"
            style={{ marginTop: "1em" }}
            alt=""
          />
        </div>

        <div className="card-body" style={{ color: "white" }}>
          <h6 className="card-title text-center" ref={heightEl} style={styleObj}>
            {renderName}
          </h6>
        </div>
      </div>
    </div>
  );
}

export default CategoryIcon;
