import React, { useState } from "react";

//import StackedBarPopulated from "./chartComponents/StackedBarChart";
//import HorizontalStackedBarPopulated from "./chartComponents/horizontalStackedBar";
//import CumHorizBarPop from "./carbonMockData/toolData/cumBar";
import HorizontalBarChart from "AppSrc/carbonMockData/toolData/horizontalBarChart";
import { ErrorBoundary } from "traec-react/errors/handleError";

import { CumulativeButton } from "AppSrc/legacy/dashboards/sustainabilityPanel/utils";
import { DetailedIconChart } from "AppSrc/legacy/dashboards/charts";

import { indicatorChartData } from "AppSrc/data";

import Traec from "traec";


export default function IndicatorBarChart() {
    let [cumulation, setCumulation] = useState("current");
  
    return (
      <>
        <div className="card shadow p-3 mb-5 bg-white rounded text-center">
          <CumulativeButton
            cumulation={cumulation}
            setCumulation={setCumulation}
          />
          <DetailedIconChart data={Traec.Im.fromJS(indicatorChartData)} />
        </div>
        {/* <div className="row">
          <ErrorBoundary>
            <BSCard
              widthOffset="col-sm-12"
              title={"Selected indicator chart"}
              button={
                <CumulativeButton
                  cumulation={cumulation}
                  setCumulation={setCumulation}
                />
              }
              body={
                <React.Fragment>
                  <DetailedIconChart data={Traec.Im.fromJS(indicatorChartData)} />
                </React.Fragment>
              }
            />
          </ErrorBoundary>
        </div> */}
      </>
    );
  }