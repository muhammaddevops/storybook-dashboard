import React, { useState, useEffect } from "react";
import Traec from "traec";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import { ProjectPermission } from "traec/utils/permissions/project";
import { BSBtnDropdown } from "traec-react/utils/bootstrap";
import BaseFormConnected from "traec-react/utils/form";

import { getProjectProps } from "storybook-dashboard/legacy/utils/getters";
import { MiniErrorBoundary } from "./error";
import { workPackageFields } from "./forms";
import ProjectWPTree from "./wpTree";
import { Indent } from "./indent";
import { confirmDelete } from "traec-react/utils/sweetalert";

import { setAndShowModal } from "storybook-dashboard/legacy/utils/modal";
import { setNewWorkPackageFields, nestDunderKeys, getTerm } from "./utils";
import { SetMetaDataFields } from "storybook-dashboard/legacy/forms/meta";

const deleteProject = (e, projectId, project) => {
  e.preventDefault();

  let redirectUrl = "/accounts/profile";
  if (project) {
    let companyId = (project.getInPath("company.uid") || "").substring(0, 8);
    redirectUrl = companyId ? `/company/${companyId}` : redirectUrl;
  }
  console.log("WILL REDIRECT TO", redirectUrl);

  confirmDelete({
    text: `This will delete Project (${projectId.substring(
      0,
      8
    )}).  ALL MEMBERSHIP DATA AND HISTORICAL REPORTED DATA WILL BE PERMANENTLY LOST. Are you sure you would like to proceed?`,
    onConfirm: () => {
      confirmDelete({
        text: `Are you really really sure?  There no recovering this data.`,
        onConfirm: () => {
          confirmDelete({
            text: `...Really?`,
            onConfirm: () => {
              let fetch = new Traec.Fetch("project", "delete", { projectId });
              fetch.updateFetchParams({
                postSuccessHook: () => {
                  location.href = redirectUrl;
                },
              });
              fetch.dispatch();
            },
          });
        },
      });
    },
  });
};

function InviteEmailRow({ index, email, emails, setEmails }) {
  return (
    <div className="row mb-1">
      <div className="col-sm-11">{email}</div>
      <div className="col-sm-1">
        <button
          className={"btn btn-sm btn-primary"}
          onClick={() => setEmails(emails.delete(index))}
        >
          del
        </button>
      </div>
    </div>
  );
}

const sendInvites = ({ emails, projectId, project_discipline_id }) => {
  console.log(
    "Inviting users for project",
    projectId,
    project_discipline_id,
    emails?.toJS()
  );

  let meta_json = {
    auto_accept_if_user_exists: true,
  };

  for (let email of emails) {
    let fetch = new Traec.Fetch("project_invite", "post", { projectId });
    fetch.updateFetchParams({
      throttleTimeCheck: -1,
      body: {
        email,
        project_discipline: project_discipline_id,
        meta_json,
      },
    });
    fetch.dispatch();
  }
};

function InviteRefUsers(props) {
  let { projectId, cref: _cref, disciplines: _disciplines, modalId } = props;
  let cref = Traec.Im.fromJS(_cref);
  let disciplines = Traec.Im.fromJS(_disciplines);

  let [email, setEmail] = useState("");
  let [emails, setEmails] = useState(Traec.Im.List());

  let base_discipline_id = cref?.getInPath("latest_commit.discipline");
  let project_discipline_id = disciplines
    .filter((i) => i.get("base_uid") == base_discipline_id)
    .first()
    ?.get("uid");

  if (!project_discipline_id) {
    return <p>No Supplier set for this Reporting Package</p>;
  }

  return (
    <React.Fragment>
      <div className="row">
        <div className="col-sm-11">
          <input
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="col-sm-1">
          <button
            className="btn btn-sm btn-primary float-right"
            onClick={() => setEmails(emails.concat(email))}
          >
            Add
          </button>
        </div>
      </div>
      <hr />
      {emails.map((email, index) => (
        <InviteEmailRow
          key={index}
          index={index}
          email={email}
          emails={emails}
          setEmails={setEmails}
        />
      ))}
      {emails.size ? (
        <React.Fragment>
          <hr />
          <button
            className="btn btn-sm btn-primary float-right"
            onClick={() => {
              sendInvites({ emails, projectId, project_discipline_id });
              $(`#${modalId}`).modal("hide");
            }}
          >
            Send Invites
          </button>
        </React.Fragment>
      ) : null}
    </React.Fragment>
  );
}

export const sendInviteModal = (props) => {
  let modalId = "CommonProjectModal001";
  setAndShowModal(modalId, {
    title: "Invite reporters",
    body: <InviteRefUsers {...props} modalId={modalId} />,
  });
};

const addReportingPackage = (props) => {
  let {
    trackerId,
    refId,
    commitId,
    rootCommitId,
    treeId,
    disciplines,
    projectReportingPeriods,
  } = props;
  let modalId = "CommonProjectModal001";

  // Get the fetch for adding a work package
  let fromCommitId = commitId || rootCommitId;

  let fetch = new Traec.Fetch("tracker_ref_tree_branch", "post", {
    trackerId,
    refId,
    commitId,
    treeId,
    skip_categories: true,
  });
  fetch.updateFetchParams({
    preFetchHook: (body) => {
      let _body = {
        ...nestDunderKeys({ ...body, latest_commit__comment: "." }),
        ref_name: body.name || "master",
        from_commit: fromCommitId,
      };
      console.log("CREATING REF WITH PARAMETERS", _body);
      return _body;
    },
    postSuccessHook: (data) => {
      console.log("Sucessfully created Ref", data);
      let cref = Traec.Im.fromJS(data).getInPath("target.ref");
      let base_discipline_id = cref?.getInPath("latest_commit.discipline");
      if (base_discipline_id) {
        sendInviteModal({ ...props, cref });
      } else {
        $(`#${modalId}`).modal("hide");
      }
    },
  });

  setAndShowModal(modalId, {
    title: getTerm("Add a Reporting Package", props),
    body: (
      <BaseFormConnected
        params={fetch.params}
        fields={setNewWorkPackageFields(
          workPackageFields,
          disciplines,
          projectReportingPeriods
        )}
        //prePostHook={this.setPostData}
        forceShowForm={true}
        hideUnderline={true}
      />
    ),
  });
};

const editMetaData = (props) => {
  let { project, projectId, trackerId } = props;
  let modalId = "CommonProjectModal001";

  console.log("Showing Project meta-data", project?.toJS());

  setAndShowModal(modalId, {
    title: "Project meta-data",
    body: (
      <SetMetaDataFields
        hideAdmin={true}
        saveMetaFetchProps={{
          handler: "project",
          method: "patch",
          params: { projectId },
        }}
        pushMetaFetchProps={{
          handler: "tracker_dispatch",
          method: "post",
          params: { trackerId },
        }}
        metaJson={project.get("meta_json")}
      />
    ),
  });
};

function ProjectAdminDropdown(props) {
  let { projectId, project } = props;
  if (!project || !projectId) {
    return null;
  }
  let _projectId = projectId.substring(0, 8);

  // Called on mount and update
  let [state, setState] = useState({});
  useEffect(() => {
    Traec.fetchRequiredFor({
      props: { projectId },
      state,
      setState,
      requiredFetches: [
        new Traec.Fetch("project_discipline", "list"),
        new Traec.Fetch("project_reporting_periods", "list"),
      ],
    });
  });

  return (
    <MiniErrorBoundary>
      <BSBtnDropdown
        header={" "}
        floatStyle={"sidebar-dropdown-text float-right"}
        links={[
          {
            name: getTerm("Add a Reporting Package", props),
            onClick: (e) => addReportingPackage(props),
          },
          { name: "Go to Settings", linkTo: `/project/${_projectId}/details` },
          { name: "Project info", onClick: (e) => editMetaData(props) },
          {},
          {
            name: "Delete",
            onClick: (e) => deleteProject(e, projectId, project),
          },
        ]}
      />
    </MiniErrorBoundary>
  );
}

const mapStateToProps = (state, ownProps) => {
  const { projectId, project: _project } = ownProps;

  // Get the Traker and root ref/commit details
  let { trackerId, tracker } = getProjectProps(state, projectId);
  let rootRefId = tracker ? tracker.get("root_master") : null;
  let rootRef = rootRefId
    ? state.getInPath(`entities.refs.byId.${rootRefId}`)
    : null;
  let commitId = rootRef ? rootRef.getInPath("latest_commit.uid") : null;
  let treeId = rootRef
    ? rootRef.getInPath("latest_commit.tree_root.uid")
    : null;

  // Get the disciplines for this work package
  let disciplines = state.getInPath(
    `entities.projectObjects.byId.${projectId}.disciplines`
  );
  // Get the reporting periods for this project
  let projectReportingPeriods = state.getInPath(
    `entities.projectReportingPeriods.byId.${projectId}`
  );

  // Get the more detailed project information (including meta-data) if possible
  let project =
    state.getInPath(`entities.projects.byId.${projectId}`) || _project;

  return {
    project,
    trackerId,
    commitId,
    refId: rootRefId,
    rootCommitId: commitId,
    treeId,
    disciplines,
    projectReportingPeriods,
  };
};

const ProjectAdminDropdownConnected =
  connect(mapStateToProps)(ProjectAdminDropdown);

export default function ProjectRow(props) {
  let { project, depth, currentIds = {} } = props;
  let projectId = project?.get("uid");

  let [collapsed, setCollapsed] = useState(
    projectId
      ? localStorage.getItem(`sidebar-${projectId}`, "false") == "true"
      : false
  );

  if (!project) {
    return null;
  }

  let currentId = currentIds.projectId;
  let isCurrentProject = currentId ? currentId == projectId : false;

  let currentRefOrProjectId = currentIds.refId || currentIds.projectId;
  let isCurrentRefOrProject =
    currentRefOrProjectId && currentRefOrProjectId == projectId;

  let bgColor = isCurrentProject && !currentIds.refId ? "bg-info" : "";

  //console.log(project.get("name"), depth, isCurrentProject);
  return (
    <React.Fragment>
      <div className={`row m-0 p-0 ${bgColor}`}>
        <Indent
          depth={depth}
          expanded={isCurrentProject}
          onClickHandler={(e) => {
            let _value = !collapsed;
            localStorage.setItem(`sidebar-${projectId}`, _value);
            setCollapsed(_value);
          }}
        />

        <p
          className={`m-0 p-0 mr-2 col`}
          style={{ display: "inline-block", verticalAlign: "middle" }}
        >
          <Link to={`/project/${projectId.substring(0, 8)}`}>
            {project.get("name")}
          </Link>
        </p>

        <MiniErrorBoundary>
          {isCurrentRefOrProject ? (
            <ProjectPermission projectId={projectId} requiresAdmin={true}>
              <ProjectAdminDropdownConnected projectId={projectId} {...props} />
            </ProjectPermission>
          ) : null}
        </MiniErrorBoundary>
      </div>

      {isCurrentProject ? (
        <ProjectWPTree projectId={projectId} hideDelete={true} {...props} />
      ) : null}
    </React.Fragment>
  );
}
