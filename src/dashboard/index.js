import React, { useState, useEffect } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import TipsSpinner from "storybook-dashboard/spinners/tipsSpinner";

//import StackedBarPopulated from "./chartComponents/StackedBarChart";
//import HorizontalStackedBarPopulated from "./chartComponents/horizontalStackedBar";
//import CumHorizBarPop from "./carbonMockData/toolData/cumBar";
import HorizontalBarChart from "storybook-dashboard/carbonMockData/toolData/horizontalBarChart";
import { ErrorBoundary } from "traec-react/errors/handleError";



import Traec from "traec";

import BootstrapSplitPane from "traec-react/utils/bootstrap/splitbs";

import NewSidebar from "storybook-dashboard/sidebar"


import IndicatorBarChart from "./charts"
import ReportCards from "./cards";
  

function MockDashboard(props) {
    let { _type, _id } = props;
  
    let [selected, setSelected] = useState(Traec.Im.Set());
    let [loading, setLoading] = useState(true);
    let [showSideBar, setShowSideBar] = useState(true);
  
    useEffect(() => {
      console.log("Dashboard will take 3 seconds to load");
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }, []);
  
    if (loading) {
      return <TipsSpinner />;
    }
  
    return (
      <ErrorBoundary>
        <BootstrapSplitPane
          localStorageKey={`dashboard-sidebar-grid-split-${_id}`}
          allowZero={true}
          pane1ClassName={"page-sidebar vh100-navbar"}
          onCollapseHook={() => {
            setShowSideBar(false);
          }}
          onExpandHook={() => {
            setShowSideBar(true);
          }}
          pane1Style={{
            borderRight: "1px solid grey",
          }}
        >
          <div>
            <ErrorBoundary>
              <NewSidebar 
                _type={_type}
                _id={_id}
              />
            </ErrorBoundary>
          </div>
  
          <div>
            <ErrorBoundary>
              <ErrorBoundary>
                <ReportCards />
              </ErrorBoundary>
  
              <ErrorBoundary>
                <HorizontalBarChart />
              </ErrorBoundary>
  
              <ErrorBoundary>
                <IndicatorBarChart />
              </ErrorBoundary>
            </ErrorBoundary>
          </div>
        </BootstrapSplitPane>
      </ErrorBoundary>
    );
  }
  
  
export default function MockDashboardRouteHandler(props) {
  
    let {_type, _id, _refId} = useParams()
     
    console.log("Rendering MockDashboardRouteHandler", _type, _id, _refId)
    if (_refId && _type !== "project") {
        return <p>ERROR:  refId can only be used on a /project type url, not {`/${_type}`} </p>
    }
  
    return (
      <MockDashboard 
        _type={_type}
        _id={_id}
      />
    )
  }
  