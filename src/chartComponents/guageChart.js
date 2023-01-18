import { Doughnut } from "react-chartjs-2";
import React from "react";

function GuageChart() {
  const doughnutOptions = {
    cutoutPercentage: 50,
    // rotation: 270, // start angle in degrees
    // circumference: 180, // sweep angle in degrees
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  const doughnutData = {
    datasets: [
      {
        data: [20, 5],
        backgroundColor: ["rgba(0, 204, 68, 0.5)", "rgba(102, 153, 255, 0.5)"],
      },
    ],
    labels: ["Submitted", "Not submitted"],
  };

  return (
    <React.Fragment>
      <div className="col">
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </div>
    </React.Fragment>
  );
}

export default GuageChart;
