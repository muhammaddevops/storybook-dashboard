import React, { useState, useEffect } from "react";
import Traec from "traec";
import { ErrorBoundary } from "traec-react/errors/handleError";

export const transformFilters = (filters) => {
  if (!filters) {
    return {};
  }
  let _filters = Traec.Im.Map();
  for (let [key, value] of filters.entries()) {
    _filters = _filters.set(getFilterKey(key, value), value);
  }
  //console.log("Transformed filters from", filters?.toJS(), _filters?.toJS())
  return _filters.toJS();
};

export const formatDate = (date, add = 0) => {
  if (!date) {
    return null;
  }
  return date.clone().add(add, "days").format("YYYY-MM-DD");
};

export const getFetchBody = (props, part) => {
  let {
    fromDate,
    toDate,
    filters,
    selected,
    category_id,
    indicator_id,
    indicatorId,
    cumulation,
  } = props;
  let _filters = transformFilters(filters);

  let _categoryId = category_id || Traec.Im.fromJS(selected || {}).get("id");

  let fetchBody = {
    type: "SUSTOOL_DASHBOARD_DATA",
    payload: {
      part: part,
      //from_date: formatDate(fromDate),
      //to_date: formatDate(toDate, 1),
      category_id: _categoryId,
      //indicator_id: indicatorId || indicator_id,
      cumulation: cumulation || "total",
      filters: _filters,
      ignore_cache: false,
      only_latest: true,
      ignore_cache: false,
    },
  };

  // Get a unique hash of the filters
  let filterHash = Traec.Im.fromJS(_filters).hashCode();
  let payloadHash = Traec.Im.fromJS(fetchBody).hashCode();
  let queryParams = { payload_id: `${part}_${payloadHash}` };

  return { fetchBody, filterHash, payloadHash, queryParams };
};

const getPreDispatchHook = (props) => (action) => {
  let { part } = props;
  let { fetchBody } = getFetchBody(props, part);
  action.fetchParams.body = fetchBody;
  action.fetchParams.headers = { "content-type": "application/json" };
  action.fetchParams.rawBody = false;
  //action.fetchParams.throttleTimeCheck = 1000 * 3600; // Throttle request to every hour (to prevent calling backend every click)
  action.stateParams.stateSetFunc = (state, data) => {
    //dataToState(props, state, data)
    console.log("Got data from API", data);
    props.setRags(Traec.Im.fromJS(data).getInPath(`payload.payload.0.${part}`));
    return state;
  };
  console.log("Calling dispatch for data part", part, action);
  return action;
};

const ragToColor = (rag) => {
  let colorMap = {
    r: "red",
    g: "green",
    a: "orange",
  };
  return colorMap[rag] || "black";
};

function IndicatorListItem(props) {
  //let [selected, setSelected] = useState(false)
  let { selected, setSelected, indicator } = props;
  let indicator_id = indicator.get("_id");
  let isSelected = selected.has(indicator_id);
  return (
    <li
      className="indicator-list"
      style={{
        cursor: "pointer",
        backgroundColor: isSelected ? "rgb(204, 235, 255)" : null,
        marginLeft: "0",
      }}
      onClick={(e) =>
        setSelected(
          isSelected
            ? selected.delete(indicator_id)
            : selected.add(indicator_id)
        )
      }
    >
      <span
        className="dot"
        style={{
          backgroundColor:
            ragToColor(indicator.get("rag")) === "black"
              ? "transparent"
              : ragToColor(indicator.get("rag")),
        }}
      ></span>{" "}
      {indicator.get("name")}
    </li>
  );
}

function IssueIndicators(props) {
  let { companyId, category_id } = props;
  let [state, setState] = useState({});
  let [rags, setRags] = useState(Traec.Im.Map());

  useEffect(() => {
    Traec.fetchRequiredFor({
      props,
      state,
      setState,
      requiredFetches: [
        new Traec.Fetch(
          `company_dispatch`,
          "post",
          { companyId },
          {
            preDispatchHook: getPreDispatchHook({
              ...props,
              part: "INDICATOR_RAG_DATA",
              setRags,
              cumulation: "total",
              filters: Traec.Im.Map(),
            }),
          }
        ),
      ],
    });
  }, [companyId]);

  if (!rags) {
    return null;
  }
  //console.log("RENDERING INDICATOR_RAG_DATA", rags?.toJS())

  let items = rags
    .map((value, id) => value.set("_id", id))
    .toList()
    .filter((i) => i.get("category_id") == category_id)
    .sortBy((i) => i.get("name"))
    .map((indicator, i) => (
      <IndicatorListItem key={i} {...props} indicator={indicator} />
    ));

  return <ul className="ml-1 pl-1">{items}</ul>;
}

function IssueListItem(props) {
  let { companyId, issue } = props;
  let category_id = issue.get("category_id");

  let expandedStateKey = `expanded-${companyId}-${category_id}`;
  let [showIndicators, setShowIndicators] = useState(
    localStorage.getItem(expandedStateKey, "false") === "true"
  );

  return (
    <ErrorBoundary>
      <li
        style={{
          cursor: "pointer",
          backgroundColor: showIndicators ? "rgb(204, 235, 255)" : null,
        }}
        onClick={(e) => {
          localStorage.setItem(expandedStateKey, !showIndicators);
          setShowIndicators(!showIndicators);
        }}
      >
        <span
          className="dot"
          style={{
            backgroundColor:
              ragToColor(issue.get("rag")) === "black"
                ? "transparent"
                : ragToColor(issue.get("rag")),
          }}
        ></span>{" "}
        {issue.get("_key")}
      </li>
      {showIndicators ? (
        <IssueIndicators {...props} category_id={category_id} />
      ) : null}
    </ErrorBoundary>
  );
}

export default function DashboardSidebar(props) {
  let { companyId } = props;
  let [state, setState] = useState({});
  let [rags, setRags] = useState(Traec.Im.Map());

  useEffect(() => {
    Traec.fetchRequiredFor({
      props,
      state,
      setState,
      requiredFetches: [
        new Traec.Fetch(
          `company_dispatch`,
          "post",
          { companyId },
          {
            preDispatchHook: getPreDispatchHook({
              ...props,
              part: "ISSUE_RAG_DATA",
              setRags,
              cumulation: "total",
              filters: Traec.Im.Map(),
            }),
          }
        ),
      ],
    });
  }, [companyId]);

  if (!rags) {
    return null;
  }
  //console.log("RENDERING Sidebar with  ISSUE_RAG_DATA", rags?.toJS())

  let items = rags
    .map((value, key) => value.set("_key", key))
    .toList()
    .sortBy((i) => i.get("_key"))
    .map((issue, i) => <IssueListItem key={i} {...props} issue={issue} />);

  return <ul className="ml-1 pl-1">{items}</ul>;
}
