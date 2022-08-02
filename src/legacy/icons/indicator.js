import Traec from "traec";
import React, { useState, useEffect, useRef } from "react";
import { getColor, getLogo, reverseMetricName, getBgGradient } from "./utils";

const saveOrderToBackend = ({ order, projectId }) => {
  // More work required here - because we need to know where to save the ordering
  // Do we save it at the tenant.meta_json (highest level) - or just at the project, reporting package levels
  let fetch = Traec.Fetch("project", "patch", { projectId });
  fetch.updateFetchParams({
    body: {
      meta_json: {
        indicator_order: order.toJS()
      }
    }
  });
  fetch.dispatch();
};

function IndicatorIcon(props) {
  let {
    selected,
    iconHeightHandler,
    iconHeight,
    iconName,
    iconColor,
    iconCategory,
    widthOffset,
    iconPath,
    onClickHandler,
    order,
    setOrder,
    index
  } = props;

  // Some refs, state and effects
  const heightEl = useRef(null);
  let [highlight, setHighlight] = useState(!!selected);
  const [hoveredBorder, sethoveredBorder] = useState(false);
  useEffect(() => {
    if (iconHeightHandler) {
      iconHeightHandler(heightEl);
    }
  });
  let cardStyle = { paddingBottom: "1em" };

  let outline = highlight ? `3px solid white` : hoveredBorder ? "5px dotted black" : null;
  outline = selected ? "3px solid black" : outline;

  return (
    <div
      className={widthOffset}
      style={cardStyle}
      onClick={onClickHandler}
      onMouseEnter={e => setHighlight(true)}
      onMouseLeave={e => setHighlight(false)}
    >
      <div
        className="card h-100 m-0 p-0"
        style={{
          backgroundColor: getColor(iconColor),
          backgroundImage: getBgGradient(iconColor),
          outline: outline,
          outlineOffset: "-2px",
          boxShadow: selected
            ? "0 10px 16px 0 rgba(0,0,0,0.9),0 6px 20px 0 rgba(0,0,0,0.1)"
            : "0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)",
          borderRadius: "30px",
          cursor: selected ? "grab" : "pointer",
          opacity: hoveredBorder ? 0.8 : 1
        }}
        draggable={false}
        onDragStart={e => {
          console.log("im starting drag", iconName);
          e.dataTransfer.setData("indicator_key", iconName);
        }}
        onDragOver={e => {
          e.preventDefault();
          let id = e.dataTransfer.getData("indicator_key");
          //console.log("im over this", id);
          sethoveredBorder(true);
        }}
        onDragLeave={e => {
          e.preventDefault();
          //console.log("on leave");
          sethoveredBorder(false);
        }}
        onDrop={e => {
          e.stopPropagation();
          e.preventDefault();
          sethoveredBorder(false);
          let id = e.dataTransfer.getData("indicator_key");
          //console.log("im dropping out", id, jsOrders[id]);
          console.log("Orders BEFORE being moved", order.toJS());

          let targetRank = order.get(iconName);
          if (targetRank === undefined) {
            targetRank = order.toList().max() + 1;
          }
          console.log("Target icon being dropped on has rank", iconName, targetRank);

          // This is just moving all icons with rank > the dropped icon up by 1 (to make space)
          // then setting the source icon to have the same rank as the target icon (it replaced it)
          let _order = order.map(rank => (rank >= targetRank ? rank + 1 : rank)).set(id, targetRank); // This is where we are setting the dragged icon to the same rank as the target

          // This is just sorting the icon ranks so that they are nice and sequential all the time
          _order = _order
            .keySeq()
            .toList()
            .sortBy(id => _order.get(id))
            .reduce((acc, id, i) => acc.set(id, i), Traec.Im.Map());

          console.log("Orders AFTER being moved", _order.toJS());

          //
          setOrder(_order);
          // saveOrderToBackend({order: _order, projectId})
        }}
      >
        <div className="card-img">
          <img
            className="card-img-top-fluid mx-auto d-block"
            src={getLogo(reverseMetricName(iconCategory), iconPath)}
            style={{ marginTop: "1em" }}
            alt=""
          />
        </div>

        <div className="card-body" style={{ color: "white" }}>
          <h6 className="card-title text-center" ref={heightEl}>
            {iconName}
          </h6>
        </div>
      </div>
    </div>
  );
}

export default IndicatorIcon;
