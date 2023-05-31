import React from "react";
import { Route, Switch } from "react-router-dom";

import Traec from "traec";

import { Footer } from "storybook-dashboard/footer";
import { connect } from "react-redux";

import { setNavBarItems } from "traec-react/navBar";
import { setSideBarItems } from "traec-react/sideBar";
import { ErrorBoundary } from "traec-react/errors";

import AccountTree from "storybook-dashboard/tree";
import { CompanyRouter } from "storybook-dashboard/company/router";
import { ProjectRouter } from "storybook-dashboard/project/router";

import BootstrapSplitPane from "traec-react/utils/bootstrap/splitbs";

class CompanyProjectPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      setNavBar: false,
      setSideBar: false,
      showSideBar: true,
    };

    // Data required from the API for this Component
    this.requiredFetches = [];

    // Action bindings
    //this.navbarLinks = this.navbarLinks.bind(this);
    //this.sideBarLinks = this.sideBarLinks.bind(this);
  }

  componentDidMount() {
    let { companyId } = this.props.match.params;
    //companyPermissionCheck(companyId, false, []);
    Traec.fetchRequiredFor(this);
    //this.setNavBar();
  }

  componentDidUpdate(prevProps) {
    let { companyId, setStyles } = this.props;

    this.setStyles();

    //companyPermissionCheck(companyId, false, []);
    Traec.fetchRequiredFor(this);

    //this.setSideBar();
    //this.setNavBar();
  }

  setStyles() {
    let { setStyles, dispatch } = this.props;
    if (!setStyles) {
      return null;
    }
    console.log("UPDATING GLOBAL STYLES", setStyles.toJS());
    dispatch({
      type: "UI_SET_IN",
      payload: setStyles,
      stateParams: { itemPath: `styles` },
    });
  }

  setNavBar(forceUpdate = false) {
    let navBarLinks = this.navbarLinks();
    if ((!this.state.setNavBar && navBarLinks) || forceUpdate) {
      this.setState({ setNavBar: true });
      this.props.dispatch(setNavBarItems(navBarLinks));
    }
  }

  setSideBar(forceUpdate = false) {
    let sideBarLinks = this.sideBarLinks();
    if ((!this.state.setSideBar && sideBarLinks) || forceUpdate) {
      this.setState({ setSideBar: true });
      this.props.dispatch(setSideBarItems(sideBarLinks));
    }
  }

  render() {
    let { _id } = this.props.match.params;
    return (
      <React.Fragment>
        <div className="container-fluid">
          <div className="row">
            <BootstrapSplitPane
              localStorageKey={`explorer-grid-split-${_id}`}
              allowZero={true}
              pane1ClassName={"page-sidebar vh100-navbar"}
              onCollapseHook={() => {
                this.setState({ showSideBar: false });
              }}
              onExpandHook={() => {
                this.setState({ showSideBar: true });
              }}
              onDragFinished={(draggedSize) => {
                this.setState({ draggedSize });
              }}
              pane1Style={{
                borderRight: "1px solid grey",
              }}
            >
              <div>
                <ErrorBoundary>
                  <Switch>
                    <Route
                      path={["/:_type/:_id/wpack/:_refId", "/:_type/:_id"]}
                      component={AccountTree}
                    />
                  </Switch>
                </ErrorBoundary>
              </div>
              <div>
                <ErrorBoundary>
                  <Switch>
                    {/* Route to a Company Dashboard */}
                    <Route
                      path="/company/:_companyId"
                      component={CompanyRouter}
                    />

                    {/* Route to a Project or WorkPackage Dashboard */}
                    <Route
                      path="/project/:_projectId/wpack/:_refId"
                      component={ProjectRouter}
                    />
                    <Route
                      path="/project/:_projectId"
                      component={ProjectRouter}
                    />
                  </Switch>
                </ErrorBoundary>
              </div>
            </BootstrapSplitPane>
          </div>
        </div>
        <Footer />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { companyId, projectId } = Traec.utils.getFullIds(
    state,
    ownProps.match.params
  );
  let company = state.getInPath(`entities.companies.byId.${companyId}`);
  let project = state.getInPath(`entities.projects.byId.${projectId}`);

  // Get the company styles (if provided)
  let host = company || project;
  let styles = host
    ? host.getInPath("meta_json.styles") || Traec.Im.Map()
    : Traec.Im.Map();
  let currentStyles = state.getInPath("ui.styles") || Traec.Im.Map();
  let setStyles = styles.equals(currentStyles) ? null : styles;
  //console.log("Got styles from", host, setStyles);

  return { setStyles };
};

export default connect(mapStateToProps)(CompanyProjectPage);
