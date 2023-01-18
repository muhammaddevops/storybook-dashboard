import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Traec from "traec";

import { BSCard } from "traec-react/utils/bootstrap";
import IndicatorIcon from "./icons/indicator";
import { metricName } from "./icons/utils";

import {
  sortAndCropData,
  dataToIconColors,
  dataToState,
  getFetchBody,
  getDispatchFetches
} from "./sustainabilityPanel/helpers";
import { ErrorBoundary } from "traec-react/errors/handleError";

import IndicatorDetailPanel from "./indicatorDetailPanel";
import { Spinner } from "traec-react/utils/entities";

import CompanyReportProjectResults from "./lists/companyProjects";

function IndicatorDetailWrapper(props) {
  if (props.hide) {
    return null;
  }
  return <IndicatorDetailPanel {...props} />;
}

function TableDataWrapper(props) {
  let { companyId, hide } = props;

  if (!hide && companyId) {
    return <CompanyReportProjectResults {...props} />;
  }

  return null;
}

const preDispatchHook = (action, props) => {
  let { fetchBody } = props;
  action.fetchParams.body = fetchBody;
  action.fetchParams.headers = { "content-type": "application/json" };
  action.fetchParams.rawBody = false;
  //action.fetchParams.throttleTimeCheck = 1000 * 3600; // Throttle request to every hour (to prevent calling backend every click)
  action.stateParams.stateSetFunc = (state, data) => dataToState(props, state, data);
  console.log("Calling company_dispatch for INDICATOR_RAG data", action);
  return action;
};

const selectIndicator = (iconData, setSelected, selected, setSelectedIndicator) => {
  let newSelected = selected.has(iconData.get("_key"))
    ? selected.delete(iconData.get("_key"))
    : selected.set(iconData.get("_key"), iconData);
  setSelectedIndicator(newSelected);
  setSelected(newSelected);
};

const reduxDataToStateData = ({ data, fromDate, toDate, category_id }) => {
  let key = "INDICATOR_RAG_DATA";
  return dataToIconColors(sortAndCropData(data, fromDate, toDate, key), key, i => i.get("category_id") === category_id);
};

const getInitOrder = (iconColors, indicatorOrder) => {
  if (!iconColors) {
    return Traec.Im.Map();
  }
  let order = indicatorOrder || Traec.Im.Map();
  //let order = Traec.Im.Map()  // For debugging only (pretending there are no orders in the database)

  // Get every possible icon name from indicatorOrder and from iconColors
  let iconNames = new Traec.Im.Set(iconColors.toList().map(i => i.get("name"))).union(
    new Traec.Im.Set(order.keySeq().toList())
  );

  // Get the order
  let _order = iconNames.reduce((acc, name) => acc.set(name, order.get(name, 1e6)), Traec.Im.Map());

  // Ensure we have a nice sequence of rankings
  _order = _order
    .keySeq()
    .toList()
    .sortBy(id => _order.get(id))
    .reduce((acc, id, i) => acc.set(id, i), Traec.Im.Map());

  console.log("Set initial order for indicators", _order.toJS());
  return _order;
};

function IndicatorPanel(props) {
  let { category, hostId, category_id, iconPath, indicatorOrder, data, query_params, setSelectedIndicator } = props;

  let [state, setState] = useState({});
  let [selected, setSelected] = useState(Traec.Im.Map());
  let [maxIconHeight, setMaxIconHeight] = useState(0);
  let [cumulated, setCumulated] = useState("total");
  let [iconColors, setIconColors] = useState(null);
  let [order, setOrder] = useState(indicatorOrder || Traec.Im.Map());

  const requiredFetches = getDispatchFetches(props, action => preDispatchHook(action, props));

  useEffect(() => {
    if (category_id) {
      Traec.fetchRequiredFor({
        props,
        requiredFetches,
        state,
        setState
      });
    }
  });

  useEffect(() => {
    if (data) {
      let _iconColors = reduxDataToStateData(props);
      setIconColors(_iconColors);
      setOrder(getInitOrder(_iconColors, indicatorOrder));
    }
  }, [data, query_params]);

  if (!category || !category_id) {
    return null;
  }

  if (!iconColors?.size) {
    return <Spinner title="Loading indicator data" />;
  }

  // Set the initial order for all

  let curEleHeight = 0;
  let iconWidth = "col-sm-6 col-md-4 col-lg-3 col-l-2 col-xl-2";
  // console.log("icon order >>", order.toJS(), "icon colors>>", iconColors.toJS());

  const iconHeightHandler = element => {
    // console.log("element >>", element);
    let eleHeight = element.clientHeight;
    let TOL = 0.98; // Use a tolerance
    if (curEleHeight < eleHeight * TOL) {
      //console.log("SETTING MAX ICON HEIGHT", this.curEleHeight, this.state.maxIconHeight, eleHeight)
      curEleHeight = eleHeight;
      setMaxIconHeight(eleHeight);
    }
  };

  let icons = iconColors
    .sortBy(iconData => (order ? order.get(iconData.get("name"), 1e6) : iconData.get("name")))
    .map((iconData, i) => (
      <IndicatorIcon
        key={i}
        hostId={hostId}
        widthOffset={iconWidth}
        iconCategory={category}
        iconName={iconData.get("name")}
        iconColor={iconData.get("color")}
        iconHeightHandler={iconHeightHandler}
        iconHeight={maxIconHeight}
        indicatorId={iconData.get("_key")}
        iconPath={iconPath}
        selected={selected.has(iconData.get("_key"))}
        setOrder={setOrder}
        order={order}
        index={i}
        onClickHandler={() => selectIndicator(iconData, setSelected, selected, setSelectedIndicator)}
      />
    ));

  return (
    <ErrorBoundary>
      <div className="row">
        <BSCard
          widthOffset="col-sm-12"
          title={`${metricName(category)} Indicators`}
          body={<div className="row">{icons}</div>}
        />
      </div>

      <ErrorBoundary>
        <ErrorBoundary>
          <IndicatorDetailWrapper {...props} hide={!selected.size} selected={selected} indicatorData={null} />
        </ErrorBoundary>
      </ErrorBoundary>
      <ErrorBoundary>
        <TableDataWrapper {...props} hide={!!selected?.size} />
      </ErrorBoundary>
    </ErrorBoundary>
  );
}

const mapStateToProps = (state, ownProps) => {
  let { companyId, projectId, hostId, selected } = ownProps;
  console.log("state >>", state);

  hostId = hostId || companyId || projectId;

  // Get the selected category
  let { iconFullName: category, id: category_id } = selected || {};

  // Add the body of our API data call to the props (so we can get it in the requiredFetches above)
  let { fetchBody, filterHash, queryParams: query_params } = getFetchBody(ownProps, "INDICATOR_RAG_DATA");

  // Get the indicator_order information from the tenant meta_json
  let indicatorOrder =
    state.getInPath(`entities.project.${projectId}.meta_json.indicator_order`) ||
    state.getInPath("entities.tenant.meta_json.indicator_order");

  return { hostId, category, category_id, fetchBody, query_params, filterHash, indicatorOrder };
};

export default connect(mapStateToProps)(IndicatorPanel);
