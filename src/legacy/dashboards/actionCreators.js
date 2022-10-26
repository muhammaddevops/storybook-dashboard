export const setProjectReportingItems = (itemDict, totalsOrIndicators) => {
  return {
    type: "ENTITY_SET_IN",
    payload: itemDict,
    stateParams: {
      itemPath: "ui.project.reporting." + totalsOrIndicators
    }
  };
};
