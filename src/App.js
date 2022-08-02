import React, {useState, useEffect} from "react"
import TipsSpinner from "./spinners/tipsSpinner";

/*
import StackedBarPopulated from "./chartComponents/StackedBarChart";
import HorizontalStackedBarPopulated from "./chartComponents/horizontalStackedBar";
//import CumHorizBarPop from "./carbonMockData/toolData/cumBar";
//import HorizontalBarChart from "./carbonMockData/toolData/horizontalBarChart"
import { ISSUE_RAG_DATA } from "./carbonMockData/toolData/_data";

import { BSCardGrid } from "traec-react/utils/bootstrap";
import CategoryIcon from "./legacy/icons/category";

//import Traec from "traec"


function IssueIcons() {

  let [selected, setSelected] = useState([])
  let [maxIconHeight, setMaxIconHeight] = useState(0)

  let iconColors = Traec.Im.fromJS([
    {
      _key: "Waste",
      category_id: "abc123",
      hostId: "sustool",
      color: "#ff0000"
    },
    {
      _key: "Material",
      category_id: "abc123",
      hostId: "sustool",
      color: "#0000ff"
    }
  ])

  let iconWidth = "col-sm-6 col-md-3 col-l-2 col-xl-2";

  let iconHeightHandler = () => {
    console.log("iconHeightHandler not implemented")
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
*/

function MockDashboard() {

  let [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("Dashboard will take 5 seconds to load")
    setTimeout(() => {setLoading(false)}, 5000)
  }, [])

  if (loading) {
    return (<TipsSpinner />)
  }

  return (
    <>
      {/*<CumHorizBarPop />*/}
      {/*<HorizontalBarChart />*/}
    </>
  )
}


function App() {
  return (<MockDashboard />)
}

export default App
