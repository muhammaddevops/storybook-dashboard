import React from "react";
import { getColor } from "storybook-dashboard/dashboards/utils";

export function ColorScale({ show, nCells = 64 }) {
  if (!show) {
    return null;
  }

  let ints = [...Array(nCells).keys()];
  let floats = ints.map((i) => i / (nCells - 1));

  let colorCells = floats.map((f, i) => (
    <td key={i} style={{ backgroundColor: getColor(f).hex() }} />
  ));

  return (
    <table height="30px" width="100%">
      <tbody>
        <tr>{colorCells}</tr>
      </tbody>
    </table>
  );
}
