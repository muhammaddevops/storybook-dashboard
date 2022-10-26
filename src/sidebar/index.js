import React, {useState, useEffect} from "react"
import { connect } from "react-redux";
import Traec from "traec"
import { ErrorBoundary } from "traec-react/errors";

import CompanyRow from "./companyRow"
import ProjectRow from "./projectRow"


function ChildRow({child, depth}) {
    let ComponentMap = {
        project: ProjectRow,
        company: CompanyRow
    }
    let ChildComponent = ComponentMap[child?.get("_type")]
    if (!ChildComponent) { return null}

    let _props = {
        [child?.get("_type")]: child,
        depth: depth+1
    }

    return <ChildComponent {..._props}/>
}


function CompanyTree(props) {
    let {_type, company, project} = props

    let [state, setState] = useState({})

    useEffect(() => {
        Traec.fetchRequiredFor({
            props,
            requiredFetches: [
                new Traec.Fetch("project_tracker", "list"),
                new Traec.Fetch("tracker_branch", "list"),
                new Traec.Fetch("company", "read"),
                new Traec.Fetch("project", "read")
            ],
            state,
            setState
        });
    });

    let ancestors = company
        ?.get("ancestors")
        ?.map((company, i) => (
            <CompanyRow key={i} company={company}/>
        ))

    // 
    let _children = null
    if (_type == "company") {
        let childCompanies = (company?.get("children") || Traec.Im.List())
            .map(i => i.set("_type", "company"))
        let childProjects = (company?.get("projects") || Traec.Im.List())
            .map(i => i.set("_type", "project"))

        // Join company and project type children and order alphabetically
        let _childObjects = childCompanies.concat(childProjects)
            .sortBy(i => i.get("name"))
        
        // Render the children (companies and projects)
        _children = _childObjects.map(
            (child, i) => (
                <ChildRow 
                    child={child} 
                    depth={company?.get("depth")} 
                />
            )
        )
    }

    let childcompanies = _type == "company" ? company
        ?.get("children")
        ?.sortBy(i => i.get("name"))
        ?.map((company, i) => (
            <CompanyRow key={i} company={company}/>
        )) : null
    
    let childprojects = _type == "company" ? company
        ?.get("projects")
        ?.map((project, i) => (
            <ProjectRow key={i} project={project} depth={company?.get("depth") + 1} />
        )) : null

    return (
        <React.Fragment>
            {ancestors}
            <CompanyRow company={company}/>
            {childprojects}
            {childcompanies}
            <ProjectRow project={project} depth={company?.get("depth") + 1}/>
        </React.Fragment>
    )
}

const mapStateToProps = (state, ownProps) => {
    let { _type, _id, _refId } = ownProps;
  
    let companyId = _type == "company" ? _id : null
    let projectId = _type == "project" ? _id : null

    // Ensure that we have the full uid here (not short 8-char)
    projectId = state.getInPath(`entities.projects.byId.${projectId}.uid`) || projectId
    companyId = state.getInPath(`entities.companies.byId.${companyId}.uid`) || companyId

    let project = state.getInPath(`entities.projects.byId.${projectId}`);
    companyId = companyId || project?.getInPath("company.uid");
  
    let refId = _refId
    let currentIds = { companyId, projectId, refId };
  
    //let { trackerId } = projectId ? getProjectProps(state, projectId) : {};
    let trackerId = undefined;
  
    let company = state.getInPath(`entities.companies.byId.${companyId}`);
  
    // Provide a default (in case the user doesn't have access to the parent company)
    if (project && !company) {
      company = project.get("company").set("projects", Traec.Im.fromJS([project]));
    }
  
    // Get tenant meta-data info that we will pass down to
    let tenant_meta = state.getInPath(`entities.tenant.meta_json`) || Traec.Im.Map();
  
    return { companyId, projectId, refId, trackerId, company, project, currentIds, tenant_meta };
  };
  
  export default connect(mapStateToProps)(CompanyTree);