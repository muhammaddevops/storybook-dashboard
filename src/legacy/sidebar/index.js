import React from "react";
import { connect } from "react-redux";
import Traec from "traec";

import CompanyTreeRow from "./companyRow";
import { getProjectProps } from "AppSrc/legacy/utils/getters";

const get_root_company = (company, companyList) => {
  // Get the root company from a list of companies
  let parentId = company.get("parentid");
  if (!parentId) {
    return company;
  }
  let parent = companyList.get(parentId);
  if (!parent) {
    return company;
  } else {
    // RECURSE up the tree until we get to the top
    return get_root_company(parent, companyList);
  }
};

class CompanyTree extends React.Component {
  constructor(props) {
    super(props);

    this.requiredFetches = [
      new Traec.Fetch("project_tracker", "list"),
      new Traec.Fetch("tracker_branch", "list"),
      new Traec.Fetch("company", "read"),
      new Traec.Fetch("company", "list"),
      new Traec.Fetch("project", "read"),
      new Traec.Fetch("project", "list")
    ];
  }

  componentDidMount() {
    Traec.fetchRequiredFor(this);
  }

  componentDidUpdate() {
    Traec.fetchRequiredFor(this);
  }

  render() {
    let { company, companyList, fromHere } = this.props;

    if (!company || !companyList) {
      return <p>No company defined</p>;
    }

    let rootCompany = fromHere ? company : get_root_company(company, companyList);

    return (
      <div className="container-fluid mt-3 m-0 p-0">
        <CompanyTreeRow {...this.props} isRoot={true} depth={0} company={rootCompany} />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  let { _type, _id, _refId } = ownProps;

  let _params = {
    [`_${_type}Id`]: _id,
    _refId
  };
  let { companyId, projectId, refId } = Traec.utils.getFullIds(state, _params);

  let project = state.getInPath(`entities.projects.byId.${projectId}`);
  companyId = companyId || (project ? project.getInPath("company.uid") : null);

  let currentIds = { companyId, projectId, refId };
  //console.log("Current selection:", currentIds)

  let { trackerId } = projectId ? getProjectProps(state, projectId) : {};

  let company = state.getInPath(`entities.companies.byId.${companyId}`);
  let companyList = state.getInPath(`entities.companies.byId`);

  // Provide a default (in case the user doesn't have access to the parent company)
  if (project && !company) {
    company = project.get("company").set("projects", Traec.Im.fromJS([project]));
  }
  if (project && company && !companyList) {
    companyList = Traec.Im.fromJS({ [company.get("uid")]: company });
  }

  // Get tenant meta-data info that we will pass down to
  let tenant_meta = state.getInPath(`entities.tenant.meta_json`) || Traec.Im.Map();

  return { companyId, projectId, refId, trackerId, company, companyList, currentIds, tenant_meta };
};

export default connect(mapStateToProps)(CompanyTree);
