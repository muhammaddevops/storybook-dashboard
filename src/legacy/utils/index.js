import Traec from "traec";
export * from "./modal";

export const getFirstItem = itemList => {
  let hasItems = itemList && itemList.size;
  return hasItems ? itemList.first() : Traec.Im.Map();
};

export const imToJS = obj => (Traec.Im.isImmutable(obj) ? obj.toJS() : obj);

/* Get the diff between Javascript objects i and j - but the values may be immutable
 */

const getKeySet = o => {
  return Traec.Im.Set(Traec.Im.isImmutable(o) ? o.keys() : Object.keys(o));
};

const getValue = (o, key) => {
  return Traec.Im.isImmutable(o) ? o.get(key) : o[key];
};

export const hasDiff = (i, j, logPrefix = "") => {
  // Check if the props keys have changed
  let iKeys = getKeySet(i);
  let jKeys = getKeySet(j);

  if (!iKeys.equals(jKeys)) {
    console.log(`${logPrefix}:Keys have changed`, iKeys.toJS(), jKeys.toJS());
    return true;
  }

  // Check if immutable structures in the props have changed
  for (let key of iKeys) {
    let _i = getValue(i, key);
    let _j = getValue(j, key);
    if (Traec.Im.isImmutable(_i)) {
      if (_i && !_i.equals(_j)) {
        console.log(
          `${logPrefix}:Immutable value has changed`,
          key,
          _i.toJS(),
          Traec.Im.isImmutable(_j) ? _j.toJS() : _j
        );
        return true;
      }
    } else {
      if (_i !== _j) {
        console.log(`${logPrefix}:Plain JS value has changed`, key, _i, _j);
        return true;
      }
    }
  }

  return false;
};
