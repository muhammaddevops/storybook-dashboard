/*
Set the document meta-json field with the defined headings/types for the columns of the form
that is expected
*/

import React, { useState, useEffect } from "react";
import Traec from "traec";

import { ErrorBoundary } from "traec-react/errors";

import { AddEditFormFields } from "./fields";
import { setAndShowModal } from "storybook-dashboard/utils/modal";
import { DropzoneButton } from "traec-react/utils/documentUpload/dropZone";
import { BSBtn } from "traec-react/utils/bootstrap";

function InputTypeSelector({ value, onChangeHandler }) {
  return (
    <div className="form-group">
      <label htmlFor="inputTypeSelect">File/Input Type</label>
      <select
        value={value}
        className="form-control"
        id="inputTypeSelect"
        onChange={onChangeHandler}
      >
        <option value="upload">Upload</option>
        <option value="form">User-defined Form</option>
      </select>
    </div>
  );
}

function FormDetails({ details = Traec.Im.Map(), setDetails }) {
  return (
    <React.Fragment>
      <div className="form-group">
        <label htmlFor="formName">Form Name</label>
        <input
          value={details.get("name") || ""}
          type="text"
          className="form-control"
          id="formName"
          onChange={(e) => {
            setDetails(details.set("name", e.target.value));
          }}
        />
      </div>
    </React.Fragment>
  );
}

function FormFields({ inputType, details, fields, setDetails, setFields }) {
  if (!(inputType === "form")) {
    return null;
  }

  return (
    <ErrorBoundary>
      <hr />
      <FormDetails details={details} setDetails={setDetails} />
      <div className="row">
        <div className="col">
          <label>Form Fields</label>
        </div>
      </div>
      <AddEditFormFields fields={fields} setFields={setFields} />
      <hr />
    </ErrorBoundary>
  );
}

const saveMeta = (e, props) => {
  e.preventDefault();
  let {
    trackerId,
    commitId,
    refId,
    path,
    modalId,
    setPending,
    inputType,
    details,
    fields,
    template,
  } = props;

  let fetch = new Traec.Fetch("tracker_node", "put", {
    trackerId,
    refId,
    commitId,
    pathId: path,
  });
  fetch.updateFetchParams({
    preFetchHook: (body) => {
      let meta_json = {
        input_type: inputType,
        input_details: {
          ...details.toJS(),
          fields: fields.toJS(),
          file_template: template.toJS(),
        },
      };
      console.log("Setting document meta_json", meta_json);
      return {
        type: "document",
        node: {
          document: {
            meta_json,
          },
        },
      };
    },
    postSuccessHook: (e) => {
      setPending(false);
      $(`#${modalId}`).modal("hide");
    },
    postFailureHook: (data) => {
      setPending(false);
    },
  });

  setPending(true);
  fetch.dispatch();
};

export function DocumentMetaMenu(props) {
  let { document } = props;

  if (!document) {
    return null;
  }

  const [docId, setDocId] = useState(document.get("uid") || "");
  const [details, setDetails] = useState(
    document.getInPath("meta_json.input_details") || Traec.Im.Map()
  );
  const [template, setTemplate] = useState(
    document.getInPath("meta_json.input_details.file_template") ||
      Traec.Im.Map()
  );
  const [fields, setFields] = useState(
    document.getInPath("meta_json.input_details.fields") || Traec.Im.List()
  );
  const [inputType, setInputType] = useState(
    document.getInPath("meta_json.input_type") || ""
  );
  const [pending, setPending] = useState(false);

  useEffect(() => {
    // Reset all of the fields if we have a different document.uid
    if (document.get("uid") !== docId) {
      console.log(
        "Got a different document.uid: resetting modal state parameters",
        docId,
        document.get("uid")
      );
      setDocId(document.get("uid"));
      setDetails(document.getInPath("meta_json.input_details"));
      setTemplate(document.getInPath("meta_json.input_details.file_template"));
      setFields(document.getInPath("meta_json.input_details.fields"));
      setInputType(document.getInPath("meta_json.input_type"));
      setPending(false);
    }
  }, [document, docId]);

  return (
    <ErrorBoundary>
      <InputTypeSelector
        value={inputType}
        onChangeHandler={(e) => {
          setInputType(e.target.value);
        }}
      />
      <FormFields
        inputType={inputType}
        details={details}
        fields={fields}
        setDetails={setDetails}
        setFields={setFields}
      />
      <UploadTemplate template={template} setTemplate={setTemplate} />

      <div className="row">
        <div className="col">
          <button
            className="btn btn-sm btn-primary"
            onClick={(e) =>
              saveMeta(e, {
                ...props,
                setPending,
                inputType,
                details,
                fields,
                template,
              })
            }
          >
            {pending ? (
              <div
                className="spinner-border spinner-border-sm text-light"
                role="status"
              />
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </ErrorBoundary>
  );
}

const getFile = (file) => {
  let tooLarge = false;
  if (!file) {
    return { tooLarge, selectedFile: [] };
  }

  let selectedFile = [
    <a key={file.name}>
      Upload {file.name}? ({(file.size / 1e6).toFixed(1)}Mb)
    </a>,
  ];

  if (file.size / 1e6 > 500) {
    tooLarge = true;
    selectedFile = [
      <span key={0} className="alert-danger">
        Maximum allowed upload size is 500Mb
      </span>,
    ];
  }

  return {
    tooLarge,
    selectedFile,
  };
};

const UploadTemplate = (props) => {
  const [files, setFiles] = useState([]);

  let { template, setTemplate } = props;

  let { selectedFile, tooLarge } = getFile(files[0]);

  return (
    <ErrorBoundary>
      <div className="mb-3 mt-3">
        <div className="mb-2">Upload a template</div>
        <DropzoneButton
          onDrop={(files) => setFiles(files)}
          extra_className="pl-1 pr-1 m-0 p-0"
          selectAreaText="Select file"
          confirmButton={
            <ConfirmUploadButton
              file={files[0]}
              setTemplate={setTemplate}
              setFiles={setFiles}
              tooLarge={tooLarge}
            />
          }
          selectedFiles={selectedFile}
          onCancelUpload={() => setFiles([])}
        />
        {template?.size ? (
          <div className="mt-2 mb-2">
            <div>Uploaded template:</div>
            <a href={template.get("url")}>{template.get("name")}</a>
          </div>
        ) : null}
      </div>
    </ErrorBoundary>
  );
};

const postFile = (file, setTemplate, setFiles, setPending) => {
  setPending(true);
  let fetch = new Traec.Fetch("store_object", "post");
  let formData = new FormData();
  formData.append("file", file);
  fetch.updateFetchParams({
    body: formData,
    postSuccessHook: (data) => {
      setTemplate(Traec.Im.fromJS({ name: file.name, url: data.url }));
      setFiles([]);
      setPending(false);
    },
  });

  fetch.dispatch();
};

const ConfirmUploadButton = (props) => {
  const [pending, setPending] = useState(false);
  let { file, setTemplate, setFiles, tooLarge } = props;

  if (pending) {
    return (
      <BSBtn
        text={
          <div
            className="spinner-border spinner-border-sm text-light"
            role="status"
          />
        }
        extra_className="pl-1 pr-1 m-0 p-0"
        noFloatRight={true}
        disabled={true}
      />
    );
  }
  if (tooLarge) {
    return null;
  }
  return (
    <BSBtn
      text={"Upload"}
      onClick={() => postFile(file, setTemplate, setFiles, setPending)}
      extra_className="pl-1 pr-1 m-0 p-0"
      noFloatRight={true}
    />
  );
};

export const documentMetaModal = (props) => {
  let modalId = "CommonDocMetaModal001";
  setAndShowModal(modalId, {
    title: "Setup File Form Fields",
    immutableBodyProps: true,
    body: <DocumentMetaMenu {...props} modalId={modalId} />,
  });
};
