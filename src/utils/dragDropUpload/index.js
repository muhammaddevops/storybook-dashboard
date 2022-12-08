import React from "react";
import { useState, useRef } from "react";
import Octicon from "react-octicon";
import "./uploadFileDragDrop.css";

export default function UploadFileDragDrop() {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      console.log("file dropped");
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      console.log("file dropped");
    }
  };

  //for keyboard-only users
  const inputRef = useRef(null);
  const onButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <form
      id="formDragUpload"
      onDragEnter={handleDrag}
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="file"
        id="inputDragUpload"
        multiple={true}
        onChange={handleChange}
        ref={inputRef}
      />
      <label
        id="labelDragUpload"
        htmlFor="inputDragUpload"
        className={dragActive ? "dragActive" : ""}
      >
        <div>
          <Octicon mega name="cloud-upload" />
          <p>
            <b>Drag and drop your files to upload</b>
          </p>
          <button className="btn btn-secondary" onClick={onButtonClick}>
            Select files
          </button>
        </div>
      </label>
      {dragActive && (
        <div
          id="invisibleDragListener"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        ></div>
      )}
    </form>
  );
}
