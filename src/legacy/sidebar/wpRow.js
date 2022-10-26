import React from "react";
import Traec from "traec";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { BSBtnDropdown } from "traec-react/utils/bootstrap/";
import BaseFormConnected from "traec-react/utils/form";
import { confirmDelete } from "traec-react/utils/sweetalert";
import { ErrorBoundary } from "traec-react/errors";
import { ProjectPermission } from "traec/utils/permissions/project";

import { MiniErrorBoundary } from "./error";
import { workPackageFields } from "./forms";

import { setAndShowModal } from "AppSrc/legacy/utils/modal";
import { setNewWorkPackageFields, nestDunderKeys, getTerm } from "./utils";
import { SetMetaDataFields } from "AppSrc/legacy/forms/meta";
import { sendInviteModal } from "./projectRow";

import { Indent } from "./indent";
const counter = { row: 0 };

const deleteWorkPackage = (e, props) => {
  e.preventDefault();
  let { commitId, rootRefId: refId, trackerId, rootRef } = props;
  let refName = rootRef ? rootRef.get("name") : null;
  if (!trackerId | !refId | !commitId) {
    return null;
  }
  confirmDelete({
    text: `This will delete the Reporting Package: ${refName}.\n\n Are you sure you would like to proceed?`,
    onConfirm: () => {
      new Traec.Fetch("tracker_ref", "delete", { trackerId, refId, commitId }).dispatch();
    }
  });
};

function SubRefs(props) {
  let { projectId, tracker, cref, subRefs, showMenu, menuOnSelectedOnly, initDepth, tenant_meta } = props;
  if (!subRefs) {
    return null;
  }

  return Traec.Im.fromJS(subRefs)
    .filter(i => i)
    .sortBy(i => i.get("name"))
    .map((item, i) => (
      <WorkPackageRowConnected
        key={i}
        rootRef={item}
        initDepth={initDepth}
        projectId={projectId}
        tracker={tracker}
        cref={cref}
        showMenu={showMenu}
        menuOnSelectedOnly={menuOnSelectedOnly}
        tenant_meta={tenant_meta}
      />
    ));
}

const addSubReportingPackage = props => {
  let { trackerId, rootRefId: refId, commitId, treeId, disciplines, projectReportingPeriods } = props;

  let modalId = `CommonReportingPackageModal001`;

  // Get the fetch for adding a new sub-work package
  let fetch = new Traec.Fetch("tracker_ref_tree_branch", "post", {
    trackerId,
    refId,
    commitId,
    treeId,
    skip_categories: true
  });
  fetch.updateFetchParams({
    preFetchHook: body => {
      let _body = {
        ...nestDunderKeys({ ...body, latest_commit__comment: "." }),
        ref_name: body.name || "master",
        from_commit: commitId
      };
      console.log("CREATING REF WITH PARAMETERS", _body);
      return _body;
    },
    postSuccessHook: () => {
      $(`#${modalId}`).modal("hide");
      location.reload();
    }
  });

  setAndShowModal(modalId, {
    title: getTerm("Add a Reporting Package", props),
    body: (
      <BaseFormConnected
        params={fetch.params}
        fields={setNewWorkPackageFields(workPackageFields, disciplines, projectReportingPeriods)}
        //prePostHook={this.setPostData}
        forceShowForm={true}
        hideUnderline={true}
      />
    )
  });
};

const editMetaData = props => {
  let { trackerId, commitId, rootRefId: refId, rootRef: cref } = props;
  let modalId = `ReportingPackageModal_${refId}`;

  console.log("Showing Reporting Package meta-data", cref?.toJS());

  setAndShowModal(
    modalId,
    {
      title: `${getTerm("Reporting Package", props)} meta-data`,
      body: (
        <SetMetaDataFields
          hideAdmin={true}
          saveMetaFetchProps={{
            handler: "tracker_ref_commit",
            method: "patch",
            params: {
              trackerId,
              refId,
              commitId
            }
          }}
          metaJson={cref.getInPath("latest_commit.meta_json")}
        />
      )
    },
    true
  );
};

function WPDropDownMenu(props) {
  let { showMenu, projectId, trackerId, rootRefId: refId, commitId, treeId, hideDelete } = props;
  if (!showMenu) {
    return null;
  }

  let rp_term = getTerm("Reporting Package", props);

  let links = [
    {
      name: `Add a sub-${rp_term}`,
      onClick: e => addSubReportingPackage(props)
    },
    {
      name: "Settings",
      linkTo: `/project/${projectId.substring(0, 8)}/wpack/${refId.substring(0, 8)}/details`
    },
    {
      name: `${rp_term} info`,
      onClick: e => editMetaData(props)
    },
    { name: "Invite reporters", onClick: e => sendInviteModal(props) }
  ];

  if (!hideDelete) {
    links.concat([{}, { name: "Delete", onClick: e => deleteWorkPackage(e, props) }]);
  }

  return (
    <MiniErrorBoundary>
      <BSBtnDropdown links={links} floatStyle={"sidebar-dropdown-text float-right"} header={" "} />
    </MiniErrorBoundary>
  );
}

class WorkPackageRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  isCurrent() {
    let { cref, rootRef } = this.props;
    if (cref.get("uid") == rootRef.get("uid")) {
      return true;
    }
    return false;
  }

  isRoot() {
    let { rootRef, tracker } = this.props;
    return rootRef.get("uid") === tracker.get("root_master");
  }

  render() {
    /* Render the reporting packages from the ref only if the project id's match. 
        This is to solve an issue where creating a new project from a template would cause the RP's 
        from the template to appear randomly in the newly created project
    */

    //console.log("RENDERING WORK PACKAGE ROW")
    let {
      showMenu,
      projectId,
      rootRef,
      includeRoot = true,
      alternateBgColor = true,
      menuOnSelectedOnly = false,
      initDepth = 0
    } = this.props;

    if (!rootRef) {
      return null;
    }

    let depth = rootRef.get("depth");
    let rootTreeName = rootRef.get("name");

    // Skip the special "conversion_factors" branch
    if (rootTreeName == "conversion_factors") {
      return "";
    }

    rootTreeName = this.isRoot() ? <b>Project Home</b> : rootTreeName;
    let bgColor = this.isCurrent() ? "bg-info" : "";
    let linkLoc = this.isRoot()
      ? `/project/${projectId.substring(0, 8)}`
      : `/project/${projectId.substring(0, 8)}/wpack/${rootRef.get("uid").substring(0, 8)}`;

    let rowNum = counter.row++;
    let styleObj = showMenu && alternateBgColor ? { backgroundColor: (rowNum + 1) % 2 && !bgColor ? "#ddd" : "" } : {};
    styleObj = { display: "inline-block", verticalAlign: "middle" };

    let shouldRender = rootRef.get("project") === projectId;

    let doRender = true;
    if (!includeRoot && this.isRoot()) {
      doRender = false;
    }

    // Whether we should show the dropdown menu
    let _showMenu = showMenu;
    if (menuOnSelectedOnly) {
      _showMenu = this.isCurrent();
    }

    //console.log(rootRef.get("name"), initDepth, depth);

    return (
      <ErrorBoundary>
        {shouldRender && doRender ? (
          <div className={`row m-0 p-0 ${bgColor}`}>
            <Indent depth={initDepth + depth - 1} expanded={false} />

            <div className={`m-0 p-0 col`} style={styleObj}>
              <Link to={linkLoc}>
                <i>{rootTreeName}</i>
              </Link>
              {_showMenu ? (
                <ProjectPermission projectId={projectId} requiresAdmin={true}>
                  <WPDropDownMenu {...this.props} />
                </ProjectPermission>
              ) : null}
            </div>
          </div>
        ) : null}

        <SubRefs {...this.props} />
      </ErrorBoundary>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  // Get the children on this row from the store
  let { projectId, tracker, rootRef } = ownProps;

  let rootRefId = rootRef.get("uid");
  let commitId = rootRef.get("latest_commit").get("uid");
  let trackerId = tracker.get("uid");
  let treeId = rootRef.getInPath("latest_commit.tree_root.uid");

  // There should not be multiple revisions of branches
  let subBranches = state.getInPath(`entities.commitBranches.commit.${commitId}.branch`) || Traec.Im.Map();
  let subRefs = [];
  for (let branch of subBranches.valueSeq()) {
    let branchRefs = branch.get("byId") || Traec.Im.Map();
    for (let commitBranch of branchRefs.valueSeq()) {
      let subRefId = commitBranch.getInPath("target.ref");
      if (subRefId != rootRefId) {
        subRefs.push(state.getInPath(`entities.refs.byId.${subRefId}`));
      }
    }
  }

  // Get the disciplines for this work package
  let disciplines = state.getInPath(`entities.projectObjects.byId.${projectId}.disciplines`);
  // Get the reporting periods for this project
  let projectReportingPeriods = state.getInPath(`entities.projectReportingPeriods.byId.${projectId}`);

  return { commitId, rootRefId, trackerId, treeId, subRefs, projectId, disciplines, projectReportingPeriods };
};

const WorkPackageRowConnected = connect(mapStateToProps)(WorkPackageRow);
export default WorkPackageRowConnected;
