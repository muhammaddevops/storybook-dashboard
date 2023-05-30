import React, { useState, useEffect, useRef} from "react";

import useLocalStorage from "storybook-dashboard/hooks/useLocalStorage";

import Pane from "./Pane";
import Resizer from "./Resizer";
import "./styles.css";
import { jiraExpand, jiraCollapse } from "./jira-icons";

/*
Fork of react-split-pane (https://github.com/tomkp/react-split-pane)
to snap to bootstrap 12-column grid and maintain responsiveness for mobile
*/

function unFocus(document, window) {
  if (document.selection) {
    document.selection.empty();
  } else {
    try {
      window.getSelection().removeAllRanges();
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }
}

function getDefaultSize(defaultSize, minSize, maxSize, draggedSize) {
  if (typeof draggedSize === "number") {
    const min = typeof minSize === "number" ? minSize : 0;
    const max = typeof maxSize === "number" && maxSize >= 0 ? maxSize : Infinity;
    return Math.max(min, Math.min(max, draggedSize));
  }
  if (defaultSize !== undefined) {
    return defaultSize;
  }
  return minSize;
}

function removeNullChildren(children) {
  return React.Children.toArray(children).filter(c => c);
}

const orientationStyleProps = {
  vertical: {
    flexDirection: "row",
    left: 0,
    right: 0
  },
  horizontal: {
    bottom: 0,
    flexDirection: "column",
    minHeight: "100%",
    top: 0,
    width: "100%"
  }
}

const getOuterDivStyles = (styleProps) => {
  const style = {
    display: "flex",
    flex: 1,
    height: "100%",
    outline: "none",
    overflow: "hidden",
    MozUserSelect: "text",
    WebkitUserSelect: "text",
    msUserSelect: "text",
    userSelect: "text",
    ...styleProps
  };

  Object.assign(style, orientationStyleProps[split])

  return style
}

const PaneContainer = React.forwardRef((props, ref) => (
  <div {...props} ref={ref}>
    {props.children}
  </div>
))

export default function SplitPane(props) {
  const {
    localStorageKey,
    initialSplit,
    extraOuterDivStyles,
  } = props;

  // Refs for the parent, and two panes
  const refParent = useRef()
  const refPane1 = useRef()
  const refPane2 = useRef()

  // Custom hook that is the same as useState but persists the value in localStorage
  let [splitGridNum, setSplitGridNum] = useLocalStorage(localStorageKey, initialSplit)

  let collapsed = !splitGridNum
  const notNullChildren = removeNullChildren(children);
  const classes = ["SplitPane", className, disabledClass];

  return (
    <PaneContainer
      ref={refParent}
      className={classes.join(" ")}
      style={getOuterDivStyles(extraOuterDivStyles)}
    >
      <Pane
        ref={refPane1}
        key="pane1"
        colWidth={splitGridNum}
        style={pane1Style}
      >
        {collapsed ? null : notNullChildren[0]}
      </Pane>

      <Resizer
        className={disabledClass}
        onClick={onResizerClick}
        onDoubleClick={onResizerDoubleClick}
        onMouseDown={this.onMouseDown}
        onTouchStart={this.onTouchStart}
        onTouchEnd={this.onMouseUp}
        key="resizer"
        resizerClassName={resizerClassName}
        style={resizerStyle || {}}
      />

      <div>
        <button className="jira-btn" style={{ zIndex: 100 }} onClick={this.collapseSidebar}>
          {isCollapsed ? jiraExpand : jiraCollapse}
        </button>
      </div>

      <Pane
        ref={refPane2}
        key="pane2"
        colWidth={12 - splitGridNum}
        style={pane2Style}
      >
        {notNullChildren[1]}
      </Pane>
    </PaneContainer>
  );
}
