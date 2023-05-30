import React, { useState } from "react";
import Traec from "traec";
import { connect } from "react-redux";

import WorkPackageRow from "./wpRow";
import { getProjectProps } from "storybook-dashboard/legacy/utils/getters";

class ProjectWPTree extends React.Component {
  constructor(props) {
    super(props);

    this.requiredFetches = [new Traec.Fetch("tracker_commit_branch", "list")];
  }

  componentDidMount() {
    Traec.fetchRequiredFor(this);
  }

  componentDidUpdate() {
    Traec.fetchRequiredFor(this);
  }

  render() {
    let { projectId, cref, tracker, rootRef, depth, tenant_meta } = this.props;
    if (!tracker || !rootRef) {
      return null;
    }

    return (
      <WorkPackageRow
        initDepth={depth}
        projectId={projectId}
        tracker={tracker}
        rootRef={rootRef}
        cref={cref}
        showMenu={true}
        includeRoot={false}
        alternateBgColor={false}
        menuOnSelectedOnly={true}
        tenant_meta={tenant_meta}
      />
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { projectId, currentIds } = ownProps;

  let { refId } = currentIds;
  let { company, trackerId, cref } = getProjectProps(state, projectId, refId);

  // Get the root tree from the cref
  let commit = cref ? cref.get("latest_commit") : null;
  let rootTreeId = commit ? commit.get("root_tree") : null;
  let rootTree = rootTreeId ? state.getInPath(`entities.trees.byId.${rootTreeId}`) : null;

  // Get the Traker and ref details
  let tracker = state.getInPath(`entities.trackers.byId.${trackerId}`);
  let rootRefId = tracker ? tracker.get("root_master") : null;
  let rootRef = rootRefId ? state.getInPath(`entities.refs.byId.${rootRefId}`) : null;

  return { trackerId, commit, rootTree, company, tracker, rootRef, cref };
};

export default connect(mapStateToProps)(ProjectWPTree);
