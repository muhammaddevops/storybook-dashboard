import React from "react";
import { ErrorBoundary } from "traec-react/errors";

export default function ReportRowErrorBoundary(props) {
  let msg = props.msg || (
    <td colSpan="100%">
      <span>Error loading report row</span>
    </td>
  );
  return (
    <ErrorBoundary title={null} ContainerTag="tr" className="alert alert-warning m-0 p-0" msg={msg}>
      {props.children}
    </ErrorBoundary>
  );
}

export function MiniErrorBoundary(props) {
  return (
    <ErrorBoundary title={null} ContainerTag="span" className="badge badge-warning" msg={"Err"}>
      {props.children}
    </ErrorBoundary>
  );
}

export function CellSpanErrorBoundary(props) {
  let msg = props.msg || (
    <td colSpan={props.colSpan}>
      <span>Error loading cells</span>
    </td>
  );
  return (
    <ErrorBoundary title={null} ContainerTag="td" className="badge badge-warning" msg={msg}>
      {props.children}
    </ErrorBoundary>
  );
}
