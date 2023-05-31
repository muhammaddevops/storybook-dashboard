import React, { useState } from "react";
import Traec from "traec";
import { BSCard, BSBtn, BSBtnDropdown } from "traec-react/utils/bootstrap";

import CreatableSelect from "react-select/creatable";
import { AddFormField } from "storybook-dashboard/legacy/forms/fields";
import { ErrorBoundary } from "traec-react/errors";
import { v4 as uuidv4 } from "uuid";
import { HTMLText } from "traec/utils/html";

const saveMeta = (saveMetaFetchProps, meta, setPending) => {
  let { handler, method, params, successHook, failureHook } =
    saveMetaFetchProps;
  console.log(
    "Saving meta_json",
    saveMetaFetchProps,
    Traec.Im.isImmutable(meta) ? meta.toJS() : meta
  );
  let fetch = new Traec.Fetch(handler, method, params);
  fetch.updateFetchParams({
    preFetchHook: (body) => ({
      meta_json: meta,
    }),
    postSuccessHook: (data) => {
      setPending(false);
      if (successHook) {
        successHook(data);
      }
    },
    postFailureHook: (data) => {
      setPending(false);
      if (failureHook) {
        failureHook(data);
      }
    },
  });
  fetch.dispatch();
};

const pushMeta = (pushMetaFetchProps, fieldName, includeValue) => {
  let { handler, method, params } = pushMetaFetchProps;
  console.log("Pushing meta_json", pushMetaFetchProps, fieldName, includeValue);
  let fetch = new Traec.Fetch(handler, method, params);
  fetch.updateFetchParams({
    preFetchHook: (body) => ({
      type: "PUSH_META_FORM_FIELD_TO_CHILDREN",
      payload: { ...params, fieldName, includeValue },
    }),
  });
  fetch.dispatch();
};

function FieldSelect({ uid, field, value, errors, onChangeHandler }) {
  let header = field.get("header");
  let options = field.get("options") || Traec.Im.List();
  let error = false; //errors.get(header);

  let _options = options.unshift(null).map((option, i) => (
    <option key={i} value={option}>
      {option}
    </option>
  ));

  return (
    <select
      type="text"
      className={`form-control ${error ? "is-invalid" : ""}`}
      id={uid}
      name={header}
      value={value}
      onChange={onChangeHandler}
    >
      {_options}
    </select>
  );
}

function FieldMultiSelect({ field, value, onChangeHandler }) {
  let options = (field.get("options") || Traec.Im.List())
    .toJS()
    .map((i) => (typeof i === "string" ? { value: i, label: i } : i));

  let valueSet = new Traec.Im.Set(value || []);
  console.log("RENDERING FieldMultiSelect", valueSet.toJS(), options);

  return (
    <CreatableSelect
      isClearable={true}
      isMulti={true}
      placeholder="Start typing to search..."
      onChange={(data) => {
        let value = data ? data.map((i) => i.value) : null;
        console.log("Handling change to value", value, data);
        onChangeHandler({ target: { value } });
      }}
      options={options}
      defaultValue={(options || []).filter((i) => valueSet.has(i.value))}
    />
  );
}

function FieldInput({ uid, value, onChangeHandler }) {
  return (
    <input
      id={uid}
      className="form-control"
      value={value || ""}
      onChange={onChangeHandler}
    />
  );
}

const moveListItem = (list, index, incr) => {
  return list.delete(index).insert(index + incr, list.get(index));
};

const TYPE_MAP = {
  selection: FieldSelect,
  multiselection: FieldMultiSelect,
};

const getFieldComponent = (type) => {
  return TYPE_MAP[type] || FieldInput;
};

function MetaFormFieldDropdown({
  pushHandler,
  header,
  fields,
  setFields,
  index,
  hide,
  trackerId,
  refId,
}) {
  if (hide) {
    return null;
  }
  let links = [];
  if (pushHandler) {
    links = links.concat([
      {
        name: "Push field and value to children",
        onClick: (e) => pushHandler(e, header, true),
      },
      {
        name: "Push field-only to children",
        onClick: (e) => pushHandler(e, header, false),
      },
      {},
    ]);
  }
  // These dropdowns are for everyone
  links = links.concat([
    {
      name: "Move up",
      onClick: (e) => setFields(moveListItem(fields, index, -1)),
    },
    {
      name: "Move down",
      onClick: (e) => setFields(moveListItem(fields, index, 1)),
    },
  ]);

  if (trackerId && refId) {
    links = links.concat([
      {},
      {
        name: "Push value to past reports",
        onClick: (e) => pushMetaBack(trackerId, refId, [header]),
      },
    ]);
  }

  links = links.concat([
    {},
    {
      name: "Delete",
      onClick: (e) => {
        setFields(fields.delete(index));
      },
    },
  ]);
  return <BSBtnDropdown header={" "} links={links} />;
}

/* Render a single row of the form */
function MetaFormField(props) {
  let { field, meta, setMeta, hideAdmin, saveOnBlur, onSaveHandler } = props;
  let header = field.get("header");
  let value = meta.get(header);
  let type = field.get("type");
  let description = field.get("description");

  const onChangeHandler = (e) => {
    setMeta(meta.set(header, e.target.value));
  };

  let uid = `${uuidv4()}`;
  let FieldInputComponent = getFieldComponent(type);

  console.log("Rendering meta form field:", header, type);
  return (
    <div className="form-group">
      <label htmlFor={uid}>
        {header}
        <ErrorBoundary>
          <MetaFormFieldDropdown {...props} header={header} hide={hideAdmin} />
        </ErrorBoundary>
      </label>
      <div onBlur={saveOnBlur ? onSaveHandler : null}>
        <FieldInputComponent
          uid={uid}
          field={field}
          value={value}
          onChangeHandler={onChangeHandler}
        />
      </div>
      {description ? (
        <small>
          <HTMLText text={description} />
        </small>
      ) : null}
    </div>
  );
}

/* Set the form values and also allow modification of "push" of fields to lower projects/reporting packages/etc.
 */
export function MetaForm(props) {
  let { fields, hideAdmin } = props;
  if (!fields || !fields.size) {
    return null;
  }

  let formFields = fields.map((field, i) => (
    <ErrorBoundary key={i}>
      <MetaFormField index={i} field={field} {...props} />
    </ErrorBoundary>
  ));

  return (
    <ErrorBoundary>
      {hideAdmin ? null : <hr />}
      {formFields}
    </ErrorBoundary>
  );
}

const pushMetaBack = (trackerId, refId, fields) => {
  let fetch = new Traec.Fetch("tracker_dispatch", "post", { trackerId });

  let formData = new FormData();
  formData.append("type", "PUSH_META_BACK");
  formData.append(
    "payload",
    JSON.stringify({
      refId,
      fields,
    })
  );
  fetch.updateFetchParams({
    body: formData,
    postSuccessHook: (data) => {
      console.log("Got response from PUSH_META_BACK", data);
    },
  });

  fetch.dispatch();
};

export function MetaSaveButton({
  hide,
  pending,
  onSaveHandler,
  trackerId,
  refId,
}) {
  let [saved, setSaved] = useState(false);

  if (hide) {
    return null;
  }
  let text = pending ? (
    <div
      className="spinner-border spinner-border-sm text-light"
      role="status"
    />
  ) : (
    "Save"
  );

  let pushBackButton =
    trackerId && refId && saved ? (
      <button
        className="btn btn-sm btn-outline-warning float-right ml-2"
        onClick={(e) => pushMetaBack(trackerId, refId)}
      >
        Push all values to past reports
      </button>
    ) : null;

  return (
    <React.Fragment>
      <hr />
      {pushBackButton}
      <BSBtn
        text={text}
        onClick={(e) => {
          setSaved(true);
          onSaveHandler(e);
        }}
      />
    </React.Fragment>
  );
}

/* Set values, modify and push fields for meta-data */
export function SetMetaDataFields({
  hide,
  hideAdmin,
  hideSave,
  saveOnBlur,
  saveMetaFetchProps,
  pushMetaFetchProps,
  metaJson,
  setMeta,
}) {
  if (hide) {
    return null;
  }
  let refId = saveMetaFetchProps?.params?.refId;
  let trackerId = saveMetaFetchProps?.params?.trackerId;

  // Ensure that we have something to start with for the meta-data
  metaJson = Traec.Im.fromJS(metaJson || Traec.Im.Map());
  console.log(
    "SetMetaDataFields",
    Traec.Im.isImmutable(metaJson) ? metaJson.toJS() : metaJson
  );

  const [_meta, _setMeta] = useState(metaJson);
  const [fields, setFields] = useState(
    metaJson.getInPath("input_details.fields") || Traec.Im.List()
  );
  const [pending, setPending] = useState(false);

  const onSaveHandler = (e) => {
    e.preventDefault();
    setPending(true);
    let meta = setMeta ? metaJson : _meta;
    let __meta = fields
      .reduce((acc, cur) => {
        let key = cur.get("header");
        return acc.set(key, meta.get(key));
      }, Traec.Im.Map())
      .set("input_details", {
        fields: fields.toJS(),
      });
    saveMeta(saveMetaFetchProps, __meta.toJS(), setPending);
  };

  const pushHandler = (e, fieldName, includeValue) => {
    e.preventDefault();
    pushMeta(pushMetaFetchProps, fieldName, includeValue);
  };

  return (
    <ErrorBoundary>
      <AddFormField hide={hideAdmin} fields={fields} setFields={setFields} />
      <MetaForm
        hideAdmin={hideAdmin}
        saveOnBlur={saveOnBlur}
        fields={fields}
        setFields={setFields}
        meta={setMeta ? metaJson : _meta} // Use local state if a setMeta function is not provided
        setMeta={setMeta ? setMeta : _setMeta}
        pushHandler={pushMetaFetchProps ? pushHandler : null}
        onSaveHandler={onSaveHandler}
        refId={refId}
        trackerId={trackerId}
      />
      <MetaSaveButton
        hide={hideSave}
        pending={pending}
        onSaveHandler={onSaveHandler}
        refId={refId}
        trackerId={trackerId}
      />
    </ErrorBoundary>
  );
}
