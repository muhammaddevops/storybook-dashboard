import React, {useState, useEffect} from "react"
import TipsSpinner from "./spinners/tipsSpinner";


//import StackedBarPopulated from "./chartComponents/StackedBarChart";
//import HorizontalStackedBarPopulated from "./chartComponents/horizontalStackedBar";
//import CumHorizBarPop from "./carbonMockData/toolData/cumBar";
import HorizontalBarChart from "./carbonMockData/toolData/horizontalBarChart"
import { ISSUE_RAG_DATA } from "./carbonMockData/toolData/_data";
import { ErrorBoundary } from "traec-react/errors/handleError";

import { BSCardGrid, BSCard } from "traec-react/utils/bootstrap";
import CategoryIcon from "./legacy/icons/category";
import IndicatorIcon from "./legacy/icons/indicator";
import { CumulativeButton } from "./legacy/sustainabilityPanel/utils";
import { DetailedIconChart } from "./legacy/charts";

import { issueIconData, indicatorIconData, indicatorChartData } from "./data";

import Traec from "traec"


function IndicatorBarChart() {
  let [cumulation, setCumulation] = useState("current")

  return (
  <div className="row">
    <ErrorBoundary>
      <BSCard
        widthOffset="col-sm-12"
        title={"Selected indicator chart"}
        button={<CumulativeButton cumulation={cumulation} setCumulation={setCumulation} />}
        body={
          <React.Fragment>
            <DetailedIconChart data={Traec.Im.fromJS(indicatorChartData)} />
          </React.Fragment>
        }
      />
    </ErrorBoundary>
  </div>
  )
}


function IndicatorIcons({category}) {

  let [selected, setSelected] = useState(Traec.Im.Set())
  let [maxIconHeight, setMaxIconHeight] = useState(0)
  let [order, setOrder] = useState(Traec.Im.Map())

  let hostId = "sustool"
  let iconWidth = "col-sm-6 col-md-3 col-l-2 col-xl-2";
  let iconColors = Traec.Im.fromJS(indicatorIconData)

  let iconHeightHandler = () => {
    console.log("iconHeightHandler not implemented")
  }

  let selectIndicator = () => {
    console.log("selectIndicator not implemented")
  }

  let setSelectedIndicator = () => {
    console.log("setSelectedIndicator not implemented")
  }

  let icons = iconColors
    .sortBy(iconData => (order ? order.get(iconData.get("name"), 1e6) : iconData.get("name")))
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
        onClickHandler={() => selectIndicator(iconData, setSelected, selected, setSelectedIndicator)}
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
  )

}


function IssueIcons() {

  let [selected, setSelected] = useState([])
  let [maxIconHeight, setMaxIconHeight] = useState(0)

  let hostId = "sustool"
  let iconWidth = "col-sm-6 col-md-3 col-l-2 col-xl-2";
  let iconColors = Traec.Im.fromJS(issueIconData)

  let iconHeightHandler = () => {
    console.log("iconHeightHandler not implemented")
  }

  let selectIssue = () => {
    console.log("selectIssue not implemented")
  }

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
    )
  })

  return (
    <div className="row">
      <BSCardGrid
        widthOffset="col-sm-12"
        title={`Sustainability Issues`}
        body={icons}
        //button={(<CumulativeButton cumulation={cumulation} setCumulation={setCumulation} />)}
      />
    </div>
  )

}


function MockDashboard() {

  let [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("Dashboard will take 3 seconds to load")
    setTimeout(() => {setLoading(false)}, 3000)
  }, [])

  if (loading) {
    return (<TipsSpinner />)
  }

  return (
    <ErrorBoundary>

      <ErrorBoundary>
        <IssueIcons />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <IndicatorIcons />
      </ErrorBoundary>

      <ErrorBoundary>
        <HorizontalBarChart />
      </ErrorBoundary>

      <ErrorBoundary>
        <IndicatorBarChart />
      </ErrorBoundary>

    </ErrorBoundary>
  )
}


function App() {
  return (<MockDashboard />)
}

export default App
