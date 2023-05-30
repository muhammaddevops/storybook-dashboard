import React, { useState } from "react";

import { CumulativeButton } from "storybook-dashboard/legacy/dashboards/sustainabilityPanel/utils";
import { DetailedIconChart } from "storybook-dashboard/legacy/dashboards/charts";

import { indicatorChartData } from "storybook-dashboard/data";

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