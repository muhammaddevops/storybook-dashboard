import React from "react";

//import StackedBarPopulated from "./chartComponents/StackedBarChart";
//import HorizontalStackedBarPopulated from "./chartComponents/horizontalStackedBar";
//import CumHorizBarPop from "./carbonMockData/toolData/cumBar";
import GaugeChart from 'react-gauge-chart'

  
function ReportCard({value, title, dotColor, dotText}) {
    return (
      <div className="card shadow p-3 mb-5 bg-white rounded text-center">
        <div className="card-body">
          <h1 className="card-title mb-3">{value}</h1>
          <p className="card-text">{title}</p>
          <p className="card-text">
            <small className="text-muted">
              <span className={`${dotColor}-dot mr-1 mt-2`}></span>
                {dotText}
              </small>
          </p>
        </div>
      </div>
    )
}
  
function GaugeChartCard() {
    return (
      <div className="card shadow p-3 mb-5 bg-white rounded text-center">
        <div className="card-body">
          <GaugeChart
            nrOfLevels={20} 
            percent={0.86} 
            textColor={null}
          />
        </div>
      </div>
  
    )
}
  
export default function ReportCards() {
    return (
      <>
        <div className="card-deck m-3">
          <ReportCard 
            value="3/5"
            title="of reports submitted"
            dotColor="green"
            dotText="everything is awesome"
          />
  
          <GaugeChartCard />
  
          <ReportCard 
            value="73%"
            title="of Reports Approved"
            dotColor="red"
            dotText="2 reports are overdue"
          />
        </div>
      </>
    );
}