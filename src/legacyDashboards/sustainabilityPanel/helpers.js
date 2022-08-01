import Traec from "traec";
import Moment from "moment";
import { getColor } from "../utils";

export const sortAndCropData = (data, fromDate, toDate, key) => {
  //console.log("sortAndCropData", data?.toJS());
  if (!data) {
    return null;
  }

  // Sort the incoming (immutable) data
  data = data
    .toList()
    .filter(i => i)
    .sortBy(i => i.get("endDate"));

  // Remove data, which is out of the date boundary
  if (fromDate && toDate) {
    data = data.filter(
      i =>
        Moment(i.get("endDate")).isAfter(fromDate) && Moment(i.get("endDate")).isBefore(toDate.clone().add(1, "days"))
    );
  }

  // Remove entries that do not have any data attached to the period
  data = data.filter(i => {
    let _data = i.getInPath(key);
    return _data != null && _data.size != 0;
  });
  return data;
};

export const dataToIconColors = (data, key, filterFunc) => {
  //console.log("dataToIconColors", data?.toJS());
  let _data = (data?.last() || Traec.Im.Map()).get(key) || Traec.Im.Map();
  if (filterFunc) {
    _data = _data.filter(i => filterFunc(i));
  }
  //console.log("Getting colors for data", _data?.toJS());
  return _data
    .map((value, key) => value.set("color", getColor(value.get("color_value")).hex()).set("_key", key))
    .toList()
    .filter(value => value.get("value") !== null && value.get("value") !== undefined);
};

export const reduxDataPath = props => {
  let { companyId, refId, filterHash, category_id } = props;
  let _id = companyId || refId;
  let _prefix = companyId ? "company" : "project";
  return `${_prefix}DashboardData.byId.${_id}.byHash.${filterHash}.byId`;
};

const listToMap = (obj, key = "uid") => {
  return obj.reduce((acc, cur) => acc.set(cur.getInPath(key), cur), Traec.Im.Map());
};

export const listsToDicts = (obj, maxDepth = 2, key = "uid", depth = 0) => {
  if (depth > maxDepth) {
    return obj;
  }

  if (Traec.Im.isList(obj)) {
    return listToMap(obj, key);
  }

  if (Traec.Im.isMap(obj)) {
    return obj.map(value => listsToDicts(value, maxDepth, key, depth + 1));
  }

  return obj;
};

export const dataToState = (props, state, data) => {
  let _data = Traec.Im.fromJS(data.payload.payload) || Traec.Im.List();
  console.log("GOT DATA", data, _data?.toJS());

  // Index the data as a Map so that we can merge in new time-periods
  let _dataMap = _data.reduce((acc, cur) => acc.set(cur.get("cacheKey") || cur.get("uid"), cur), Traec.Im.Map());

  // Get the base path and the part of data that we are getting
  let basePath = reduxDataPath(props);
  let dataPart = props.fetchBody.payload.part;

  let newState = state;
  _dataMap.mapEntries(([key, value]) => {
    // Add the data part that we wanted to the list of reporting periods
    let _path = `${basePath}.${key}`;

    if (newState.getInPath(_path)) {
      let _value = listsToDicts(value.get(dataPart), 2);
      let __path = `${_path}.${dataPart}`;
      if (newState.getInPath(__path)) {
        newState = newState.mergeDeepInPath(__path, _value);
      } else {
        newState = newState.setInPath(__path, _value);
      }
    } else {
      newState = newState.setInPath(_path, listsToDicts(value, 3));
    }
  });

  return newState;
};

export const getDispatchFetches = (props, preDispatchHook) => {
  let fetch = props.companyId
    ? new Traec.Fetch("company_dispatch", "post", {}, { preDispatchHook })
    : new Traec.Fetch("tracker_dispatch", "post", {}, { preDispatchHook });
  return [fetch];
};

const getFilterKey = (key, value) => {
  let operator = "contains"; // (value.size > 1) ? 'in' : 'icontains'
  return `${key}__${operator}`;
};

export const transformFilters = filters => {
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
  return date
    .clone()
    .add(add, "days")
    .format("YYYY-MM-DD");
};

export const getFetchBody = (props, part) => {
  let { fromDate, toDate, filters, refId, selected, category_id, indicator_id, indicatorId, cumulation } = props;
  let _filters = transformFilters(filters);

  let _categoryId = category_id || Traec.Im.fromJS(selected || {}).get("id");

  let fetchBody = {
    type: "SUSTOOL_DASHBOARD_DATA",
    payload: {
      ref_id: refId,
      part: part,
      from_date: formatDate(fromDate),
      to_date: formatDate(toDate, 1),
      category_id: _categoryId,
      indicator_id: indicatorId || indicator_id,
      cumulation: cumulation || "total",
      filters: _filters,
      ignore_cache: !!filters.size
    }
  };

  // Get a unique hash of the filters
  let filterHash = Traec.Im.fromJS(_filters).hashCode();
  let payloadHash = Traec.Im.fromJS(fetchBody).hashCode();
  let queryParams = { payload_id: `${part}_${payloadHash}` };

  return { fetchBody, filterHash, payloadHash, queryParams };
};

export const getReverseIconNames = iconNames => {
  // Flip the icon names
  let reverseIconNames = {};
  for (let key of Object.keys(iconNames)) {
    reverseIconNames[iconNames[key]] = key;
  }
  return reverseIconNames;
};
