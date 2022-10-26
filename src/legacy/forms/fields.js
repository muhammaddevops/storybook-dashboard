import React, { useState } from "react";
import Traec from "traec";

import { BSBtnDropdown, BSBtn } from "traec-react/utils/bootstrap";
import { ErrorBoundary } from "traec-react/errors";


const toJsonOrStrArray = str => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str.split(",");
  }
};

const ObjToString = obj => {
  try {
    return typeof obj[0] == "string" ? obj.join(",") : JSON.stringify(obj);
  } catch (e) {
    return obj.join(",");
  }
};

function OptionsInput({ show, options = [], state, setState, rowMargin = "mt-2" }) {
  if (!show) {
    return null;
  }
  return (
    <div className={`row ${rowMargin}`}>
      <div className="col">
        <input
          type="text"
          className="form-control form-control-sm"
          id="options"
          placeholder="Options (comma-separated or JSON)"
          value={ObjToString(options)}
          onChange={e => {
            setState({ ...state, options: toJsonOrStrArray(e.target.value) });
          }}
        />
      </div>
    </div>
  );
}

function TypeSelect({ value, onChangeHandler }) {
  return (
    <select className="form-control form-control-sm" id="columnType" onChange={onChangeHandler} defaultValue={value}>
      <option value="number">Number</option>
      <option value="string">String</option>
      {/*<option value="freetext">Free-text</option>*/}
      <option value="selection">Dropdown</option>
      <option value="multiselection">Multi-select</option>
      <option value="postcode">Postcode</option>
      <option value="date">Date</option>
    </select>
  );
}

const hasOptionsInput = _type => {
  return {
    selection: true,
    multiselection: true
  }[_type];
};

export function AddFormField({ hide, fields, setFields }) {
  if (hide) {
    return null;
  }
  const [state, setState] = useState({ header: null, type: null, options: [], description: null });

  return (
    <ErrorBoundary>
      <div className="row">
        <div className="col">
          <input
            type="text"
            className="form-control form-control-sm"
            id="columnHeader"
            placeholder="Header"
            onChange={e => {
              setState({ ...state, header: e.target.value });
            }}
          />
        </div>
        <div className="col">
          <TypeSelect onChangeHandler={e => setState({ ...state, type: e.target.value })} />
        </div>
        <div className="col">
          <input
            type="text"
            className="form-control form-control-sm"
            id="columnDescription"
            placeholder="Description"
            onChange={e => {
              setState({ ...state, description: e.target.value });
            }}
          />
        </div>
        <div className="col">
          <button
            className="btn btn-primary btn-sm float-right"
            onClick={e => {
              setFields(fields.push(Traec.Im.fromJS(state)));
            }}
          >
            Add Input Field
          </button>
        </div>
      </div>
      <OptionsInput
        show={hasOptionsInput(state.type)}
        options={state.options || []}
        state={state}
        setState={setState}
      />
    </ErrorBoundary>
  );
}

function EditFormFieldRow(props) {
  let { field, fields, setFields, index, isEdit, setEdit } = props;

  return (
    <ErrorBoundary>
      <tr>
        <td>
          <EditCell fieldKey="header" edit={isEdit} setEdit={setEdit} {...props} />
        </td>
        <td>
          <TypeSelect
            value={field.get("type")}
            onChangeHandler={e => {
              setFields(fields.setIn([index, "type"], e.target.value));
            }}
          />
        </td>
        <td>
          <EditCell fieldKey="description" edit={isEdit} setEdit={setEdit} {...props} />
        </td>
        <td className="text-right">
          <BSBtn text={"Set"} onClick={e => setEdit(false)} />
        </td>
      </tr>
      {hasOptionsInput(field.get("type")) ? (
        <ErrorBoundary>
          <tr className="m-0 p-0"></tr>
          <tr>
            <td colSpan={100} className="mt-1 mb-1 pt-1 pb-1">
              <OptionsInput
                show={true}
                rowMargin=" "
                options={field.get("options")?.toJS()}
                state={field?.toJS()}
                setState={data => {
                  let _options = Array.isArray(data.options)
                    ? Traec.Im.fromJS(data.options)
                    : Traec.Im.fromJS([data.options]);
                  setFields(fields.setIn([index, "options"], _options));
                }}
              />
            </td>
          </tr>
        </ErrorBoundary>
      ) : null}
    </ErrorBoundary>
  );
}

const FormFieldRow = props => {
  const [isEdit, setEdit] = useState(false);
  let { field, fields, setFields, index } = props;

  const links = [
    { name: "Edit", onClick: () => setEdit(true) },
    { name: "Delete", onClick: () => setFields(fields.delete(index)) },
    { name: "Move Up", onClick: () => setFields(fields.delete(index).insert(index - 1, field)) },
    { name: "Move Down", onClick: () => setFields(fields.delete(index).insert(index + 1, field)) }
  ];

  if (isEdit) {
    return <EditFormFieldRow {...props} isEdit={isEdit} setEdit={setEdit} />;
  }

  return (
    <tr>
      <td>{field.get("header")}</td>
      <td>{field.get("type")}</td>
      <td>{field.get("description")}</td>
      <td className="text-right">
        <BSBtnDropdown header={" "} links={links} />
      </td>
    </tr>
  );
};

const EditCell = props => {
  let { fieldKey, edit, setFields, field, fields, index, setEdit } = props;

  let header = field.get(fieldKey) || "";

  if (edit) {
    return (
      <input
        defaultValue={header}
        className={"form-control form-control-sm"}
        onBlur={e => {
          setFields(fields.setIn([index, fieldKey], e.target.value));
        }}
      />
    );
  }
  return header;
};

const FormFieldList = props => {
  let { fields } = props;
  if (!fields) {
    return null;
  }

  let fieldRows = fields.map((field, i) => <FormFieldRow key={i} index={i} field={field} {...props} />);

  return (
    <table width="100%" className="table table-striped table-sm">
      <tbody>
        <tr>
          <th>Header</th>
          <th>Type</th>
          <th>Description</th>
          <th className="text-right">Edit</th>
        </tr>
        {fieldRows}
      </tbody>
    </table>
  );
};

export function AddEditFormFields({ fields, setFields }) {
  return (
    <ErrorBoundary>
      <AddFormField fields={fields} setFields={setFields} />
      <hr />
      <FormFieldList fields={fields} setFields={setFields} />
    </ErrorBoundary>
  );
}
