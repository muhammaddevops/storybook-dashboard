/*
UTILITIES FOR GETTING COMPANY, PROJECT, TRACKER, CREF DETAILS 
*/

export const getASOTracker = project => {
  let trackers = project ? project.get("trackers") : null;
  if (trackers) {
    if (trackers.size > 1) {
      trackers = trackers.filter(tracker => tracker.get("name") === "sustainability_tool");
    }
  }

  let tracker = trackers?.first();
  return tracker?.get("uid");
};

export const getProjectProps = (state, projectId, refId) => {
  let project = state.getInPath(`entities.projects.byId.${projectId}`);
  let company = project ? project.get("company") : null;

  // Try to get a Tracker for this Project (compatability with Track API)
  let trackerId = getASOTracker(project);

  let { tracker, cref, crefId, isRootRef, rootRef, rootRefId } = getTrackerProps(state, trackerId, refId);

  // Return the key parameters (where we sit in the world)
  return { company, project, tracker, trackerId, cref, crefId, isRootRef, rootRef, rootRefId };
};

export const getTrackerProps = (state, trackerId, refId) => {
  let tracker = state.getInPath(`entities.trackers.byId.${trackerId}`);

  // Get the work package (ref) that we should be on
  // Get the root branch
  let rootRefId = tracker?.get("root_master");
  let rootRef = rootRefId ? state.getInPath(`entities.refs.byId.${rootRefId}`) : null;

  // Get the current ref from url parameters
  let cref = refId ? state.getInPath(`entities.refs.byId.${refId}`) : rootRef;

  // Are we on the root
  let crefId = cref?.get("uid")
  let isRootRef = crefId? crefId === rootRefId: false

  // Return the key parameters (where we sit in the world)
  return { tracker, trackerId, cref, crefId, isRootRef, rootRef, rootRefId };
};

export const getFullIds = (state, params) => {
  // Convert Ids to full-length (for fetches etc.)
  if (!params) {
    return {};
  }
  let { _projectId, _refId, _commitId } = params;
  let projectId = state.getInPath(`entities.projects.byId.${_projectId}.uid`);
  let refId = state.getInPath(`entities.refs.byId.${_refId}.uid`);
  let commitId = state.getInPath(`entities.commits.byId.${_commitId}.uid`);
  return { projectId, refId, commitId };
};
