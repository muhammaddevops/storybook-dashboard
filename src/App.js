import React, { useState, useEffect } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import TipsSpinner from "./spinners/tipsSpinner";

//import StackedBarPopulated from "./chartComponents/StackedBarChart";
//import HorizontalStackedBarPopulated from "./chartComponents/horizontalStackedBar";
//import CumHorizBarPop from "./carbonMockData/toolData/cumBar";
import GaugeChart from "react-gauge-chart";
import HorizontalBarChart from "./carbonMockData/toolData/horizontalBarChart";
import { ISSUE_RAG_DATA } from "./carbonMockData/toolData/_data";
import { ErrorBoundary } from "traec-react/errors/handleError";
import NavBar from "traec-react/navBar";

import { BSCardGrid, BSCard } from "traec-react/utils/bootstrap";
import CategoryIcon from "./legacy/dashboards/icons/category";
import IndicatorIcon from "./legacy/dashboards/icons/indicator";
import { CumulativeButton } from "./legacy/dashboards/sustainabilityPanel/utils";
import { DetailedIconChart } from "./legacy/dashboards/charts";

import { issueIconData, indicatorIconData, indicatorChartData } from "./data";

import Traec from "traec";

import BootstrapSplitPane from "traec-react/utils/bootstrap/splitbs";
import GuageChart from "./chartComponents/guageChart";

import OriginalSidebar from "./legacy/sidebar";
import NewSidebar from "./sidebar";
import DashboardSidebar from "./sidebar/indicators";
import UploadFileDragDrop from "./utils/dragDropUpload";

function IndicatorBarChart() {
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

function IndicatorIcons({ category }) {
  let [selected, setSelected] = useState(Traec.Im.Set());
  let [maxIconHeight, setMaxIconHeight] = useState(0);
  let [order, setOrder] = useState(Traec.Im.Map());

  let hostId = "sustool";
  let iconWidth = "col-sm-6 col-md-3 col-l-2 col-xl-2";
  let iconColors = Traec.Im.fromJS(indicatorIconData);

  let iconHeightHandler = () => {
    console.log("iconHeightHandler not implemented");
  };

  let selectIndicator = () => {
    console.log("selectIndicator not implemented");
  };

  let setSelectedIndicator = () => {
    console.log("setSelectedIndicator not implemented");
  };

  let icons = iconColors
    .sortBy((iconData) =>
      order ? order.get(iconData.get("name"), 1e6) : iconData.get("name")
    )
    .map((iconData, i) => (
      <IndicatorIcon
        key={i}
        hostId={hostId}
        widthOffset={iconWidth}
        iconCategory={category || "Employees"}
        iconName={iconData.get("name")}
        iconColor={iconData.get("color")}
        iconHeightHandler={iconHeightHandler}
        iconHeight={maxIconHeight}
        indicatorId={iconData.get("_key")}
        iconPath={`AAA00${i}`}
        selected={selected.has(iconData.get("_key"))}
        setOrder={setOrder}
        order={order}
        index={i}
        onClickHandler={() =>
          selectIndicator(iconData, setSelected, selected, setSelectedIndicator)
        }
      />
    ));

  return (
    <div className="row">
      <BSCard
        widthOffset="col-sm-12"
        title={`Indicators`}
        body={<div className="row">{icons}</div>}
      />
    </div>
  );
}

function IssueIcons() {
  let [selected, setSelected] = useState([]);
  let [maxIconHeight, setMaxIconHeight] = useState(0);

  let hostId = "sustool";
  let iconWidth = "col-sm-6 col-md-3 col-l-2 col-xl-2";
  let iconColors = Traec.Im.fromJS(issueIconData);

  let iconHeightHandler = () => {
    console.log("iconHeightHandler not implemented");
  };

  let selectIssue = () => {
    console.log("selectIssue not implemented");
  };

  const icons = iconColors.map((iconData, i) => {
    let fullName = iconData.get("_key");
    let name = fullName;
    let _id = iconData.get("category_id");
    //console.log("ICON DATA", iconData?.toJS());
    return (
      <CategoryIcon
        key={i}
        hostId={hostId}
        category_id={_id}
        iconName={name}
        iconFullName={fullName}
        iconColor={iconData.get("color")}
        widthOffset={iconWidth}
        iconHeightHandler={iconHeightHandler}
        iconHeight={maxIconHeight}
        iconPath={undefined}
        selected={selected?.id === _id}
        onClickHandler={() => selectIssue(fullName, name, _id)}
      />
    );
  });

  return (
    <div className="row">
      <BSCardGrid
        widthOffset="col-sm-12"
        title={`Sustainability Issues`}
        body={icons}
        //button={(<CumulativeButton cumulation={cumulation} setCumulation={setCumulation} />)}
      />
    </div>
  );
}

function ReportCard({ value, title, dotColor, dotText }) {
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
  );
}

function GaugeChartCard() {
  return (
    <div className="card shadow p-3 mb-5 bg-white rounded text-center">
      <div className="card-body">
        <GaugeChart nrOfLevels={20} percent={0.86} textColor={null} />
      </div>
    </div>
  );
}

function ReportCards() {
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
function MockDashboard(props) {
  let { _type, _id } = props;

  let [selected, setSelected] = useState(Traec.Im.Set());
  let [loading, setLoading] = useState(false);
  let [showSideBar, setShowSideBar] = useState(true);

  // useEffect(() => {
  //   console.log("Dashboard will take 3 seconds to load");
  //   setTimeout(() => {
  //     setLoading(false);
  //   }, 3000);
  // }, []);

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
            <NewSidebar _type={_type} _id={_id} />
          </ErrorBoundary>
        </div>

        <div>
          <ErrorBoundary>
            {/*
            <ErrorBoundary>
              <IssueIcons />
            </ErrorBoundary>
            
            <ErrorBoundary>
              <IndicatorIcons />
            </ErrorBoundary>
            */}

            {/* <ErrorBoundary>
              <GuageChart />
            </ErrorBoundary> */}

            <UploadFileDragDrop />

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

function CompanyIDInput({ id, setId }) {
  return (
    <form className="form-inline my-2 my-lg-0">
      <input
        className="form-control form-control-sm mr-sm-2"
        type="search"
        placeholder="Company ID"
        aria-label="CompanyId"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <button
        className="btn btn-sm btn-outline-secondary my-2 my-sm-0"
        type="submit"
      >
        Load
      </button>
    </form>
  );
}

function MockDashboardWrapper(props) {
  let { _type, _id } = useParams();

  console.log("Rendering MockDashboardWrapper", _type, _id);

  return <MockDashboard _type={_type} _id={_id} />;
}

function Home() {
  return <p>I am home</p>;
}

function MainSwitch(props) {
  //console.log("REDIRECT AT MAINSWITCH", props);
  return (
    <Routes>
      {/* Route to a Company Dashboard */}
      <Route path="/:_type/:_id" element={<MockDashboardWrapper />} />

      {/* Route to a Project or WorkPackage Dashboard */}
      <Route
        path="/project/:_projectId/wpack/:_refId"
        element={<MockDashboardWrapper />}
      />

      {/* Default render homepage if no path matched */}
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

function App() {
  let [id, setId] = useState("80ba2bd1");

  return (
    <ErrorBoundary>
      <NavBar
        brand={<span style={{ color: "white" }}>Dashboard beta</span>}
        //preUserItems={<CompanyIDInput id={id} setId={setId} />}
        include_myprofile={false}
        //location={useLocation()}
        //createText={""}
        //azureConfig={getAzureConfig()}
      />
      <MainSwitch />
      {/*<MockDashboard companyId={id} />*/}
    </ErrorBoundary>
  );
}

export default App;
