import { ErrorBoundary } from "traec-react/errors/handleError";
import React from "react";
import IndicatorPanel from "../indicatorPanel";
import { BSBtn } from "traec-react/utils/bootstrap";

export const IndicatorPanelWrapper = props => {
  if (!props.selected) {
    return null;
  }
  return (
    <ErrorBoundary>
      <IndicatorPanel {...props} />
    </ErrorBoundary>
  );
};

export const CumulativeButton = ({ cumulation, setCumulation }) => {
  setCumulation = setCumulation || (() => {});
  let _text = cumulation == "total" ? "View data by report" : "View cumulative data";
  let _info = cumulation == "total" ? "Cumulative data" : "Data by period";
  return (
    <span className="float-right" style={{ marginTop: "-0.1rem" }}>
      <h6 style={{ display: "inline" }}>{_info} </h6>
      <BSBtn
        noFloatRight={true}
        extra_className="mb-1"
        text={_text}
        onClick={() => setCumulation(cumulation == "total" ? "current" : "total")}
        //disabled={true}
      />
    </span>
  );
};
