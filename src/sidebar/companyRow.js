import React, { useState } from "react";
import Traec from "traec";
import { Link } from "react-router-dom";

import { CompanyPermission } from "traec/utils/permissions/company";
import { BSBtnDropdown } from "traec-react/utils/bootstrap";
import BaseFormConnected from "traec-react/utils/form";
import { ErrorBoundary } from "traec-react/errors";

import { MiniErrorBoundary } from "./error";
import { companyFields } from "./forms";
import NewProjectForm from "./forms";
import ProjectRow from "./projectRow";
import { Indent } from "./indent";
import { confirmDelete } from "traec-react/utils/sweetalert";

import { getTerm } from "./utils";

import { setAndShowModal } from "storybook-dashboard/legacy/utils/modal";
import { SetMetaDataFields } from "storybook-dashboard/legacy/forms/meta";


const deleteCompany = (e, companyId, company) => {
  e.preventDefault();

  let redirectUrl = "/accounts/profile";
  if (company) {
    let parentId = (company.get("parentid") || "").substring(0, 8);
    redirectUrl = parentId ? `/company/${parentId}` : redirectUrl;
  }
  console.log("WILL REDIRECT TO", redirectUrl);

  confirmDelete({
    text: `This will delete Company (${companyId.substring(
      0,
      8
    )}).  ALL MEMBERSHIP DATA, NESTED DATA, NESTED PROJECT DATA AND HISTORICAL REPORTED DATA WILL BE PERMANENTLY LOST. Are you sure you would like to proceed?`,
    onConfirm: () => {
      confirmDelete({
        text: `Are you really really sure?  There no recovering this data.`,
        onConfirm: () => {
          confirmDelete({
            text: `...Really?`,
            onConfirm: () => {
              let fetch = new Traec.Fetch("company", "delete", { companyId });
              fetch.updateFetchParams({
                postSuccessHook: () => {
                  location.href = redirectUrl;
                }
              });
              fetch.dispatch();
            }
          });
        }
      });
    }
  });
};

function CompanyProjectList(props) {
  let { company, depth, hide, currentIds } = props;
  if (!company || hide) {
    return null;
  }

  let projectList = Traec.Im.Set(company.get("projects") || Traec.Im.List());
  let projectIds = Traec.Im.Set(projectList.map(i => i?.get("uid")).filter(i => i))
  return projectList
    .filter(project => project)
    .filter(project => projectIds.has(currentIds.projectId) ? (currentIds.projectId == project.get("uid")) : true)
    .sortBy(project => project.get("name"))
    .map((project, i) => <ProjectRow key={i} {...props} project={project} depth={depth + 1} />);
}

function SubCompanyList(props) {
  let { company, companyList, companyPathIds, currentIds, depth, tenant_meta } = props;
  let childIds = company.get("childids");
  if (!childIds) {
    return null;
  }

  let isAncestor = companyPathIds?.has(company.get("uid"))

  return childIds
    .filter(id => isAncestor ? (companyPathIds?.has(id) || (currentIds.companyId == id)) : true)
    .map(id => companyList.get(id))
    .filter(child => child)
    .sortBy(child => child.get("name"))
    .map((child, i) => (
      <CompanyTreeRow
        key={i}
        depth={depth + 1}
        isRoot={false}
        company={child}
        companyList={companyList}
        currentIds={currentIds}
        tenant_meta={tenant_meta}
        companyPathIds={companyPathIds}
        recurse={!(companyPathIds?.has(child.get("uid")) || (currentIds.companyId == child.get("uid")))}
      />
    ));
}

const getNewCompanyMeta = (company, tenant_meta) => {
  let inputs =
    Traec.Im.fromJS(tenant_meta || Traec.Im.Map()).get("new_company_input_details") ||
    company.getInPath("meta_json.input_details");

  let meta = company.get("meta_json") || Traec.Im.Map();

  return inputs ? meta.set("input_details", inputs) : meta;
};

function AddCompanyWithMetaForm({ company, tenant_meta, modalId }) {
  company = Traec.Im.fromJS(company);

  let [meta, setMeta] = useState(getNewCompanyMeta(company, tenant_meta));
  let styles = (meta.get("styles") || Traec.Im.Map()).toJS();

  const _setMeta = meta => {
    // Special function for SSEN
    if (meta.get("Scheme Reference") && meta.get("Project Name")) {
      companyFields.name.value = `${meta.get("Scheme Reference")} - ${meta.get("Project Name")}`;
    }
    setMeta(meta);
  };

  // Get the fetch for adding a business unit
  let fetch = new Traec.Fetch("company", "post");
  fetch.updateFetchParams({
    preFetchHook: body => {
      let _body = {
        ...body,
        parentid: company.get("uid"),
        meta_json: meta?.toJS() || {}
      };
      console.log("Creating new company with data", _body);
      return _body;
    },
    postSuccessHook: data => {
      $(`#${modalId}`).modal("hide");
      console.log("Redirecting to new company", data);
      location.href = `/company/${data.uid.substring(0, 8)}`;
    }
  });

  return (
    <React.Fragment>
      <BaseFormConnected params={fetch.params} fields={companyFields} forceShowForm={true} hideUnderline={true} />
      {!meta.get("input_details") ? null : (
        <ErrorBoundary>
          <hr />
          <div className="col-sm-12">
            <SetMetaDataFields hideAdmin={true} hideSave={true} metaJson={meta} setMeta={_setMeta} />
          </div>
        </ErrorBoundary>
      )}
    </React.Fragment>
  );
}

const addSubCompany = props => {
  let { company, tenant_meta } = props;
  let modalId = "CommonCompanyModal001";

  setAndShowModal(modalId, {
    title: getTerm("Add a Business Unit", props),
    body: <AddCompanyWithMetaForm company={company} tenant_meta={tenant_meta} modalId={modalId} />
  });
};

const addCompanyProject = props => {
  let { company, companyId, tenant_meta } = props;
  let modalId = "CommonCompanyModal001";

  setAndShowModal(modalId, {
    title: getTerm("Add a Project", props),
    body: <NewProjectForm companyId={companyId} company={company} tenant_meta={tenant_meta} modalId={modalId} />
  });
};

const editMetaData = props => {
  let { company, companyId } = props;
  let modalId = "CommonCompanyModal001";

  console.log("Showing Company meta-data", company?.toJS());

  setAndShowModal(modalId, {
    title: `${getTerm("Company", props)} meta-data`,
    body: (
      <SetMetaDataFields
        hideAdmin={true}
        saveMetaFetchProps={{
          handler: "company",
          method: "patch",
          params: { companyId }
        }}
        pushMetaFetchProps={{
          handler: "company_dispatch",
          method: "post",
          params: { companyId }
        }}
        metaJson={company.get("meta_json")}
      />
    )
  });
};

function CompanyAdminDropdown(props) {
  let { companyId, company } = props;
  if (!company || !companyId) {
    return null;
  }

  let _companyId = companyId.substring(0, 8);

  return (
    <MiniErrorBoundary>
      <BSBtnDropdown
        header={" "}
        floatStyle={"sidebar-dropdown-text float-right"}
        links={[
          {
            name: getTerm("Add a Business Unit", props),
            onClick: e => addSubCompany(props)
          },
          {
            name: getTerm("Add a Project", props),
            onClick: e => addCompanyProject(props)
          },
          { name: "Go to Settings", linkTo: `/company/${_companyId}/details` },
          { name: `${getTerm("Company", props)} info`, onClick: e => editMetaData(props) },
          {},
          { name: "Delete", onClick: e => deleteCompany(e, companyId, company) }
        ]}
      />
    </MiniErrorBoundary>
  );
}

export default function CompanyTreeRow(props) {
  let { company, extraContent, collapsed, onClickHandler, currentIds={}, tenant_meta={} } = props;
  let companyId = company?.get("uid");
  let depth = company?.get("depth") - 1

  if (!company) {
    return null;
  }
  
  let currentId = currentIds.refId || currentIds.projectId || currentIds.companyId;
  let isCurrent = companyId === currentId;
  let bgColor = isCurrent ? "bg-info" : ""; //(inFocus ? "bg-secondary" : "");

  let _companyId = companyId ? companyId.substring(0, 8) : null;

  let isRoot = company?.get("depth") == 1
  let TitleTag = isRoot ? "b" : "span";

  //console.log(company.get("name"), depth)
  return (
    <ErrorBoundary>
      <div
        className={`row m-0 p-0 ${bgColor}`}
      >
        <Indent
          depth={depth}
          expanded={!collapsed}
          onClickHandler={onClickHandler}
        />

        <p className={`m-0 p-0 mr-2 col`} style={{ display: "inline-block", verticalAlign: "middle" }}>
          <Link to={`/company/${_companyId}`}>
            <TitleTag>{company.get("name")}</TitleTag>
          </Link>
        </p>
        {extraContent}

        <MiniErrorBoundary>
          {isCurrent ? (
            <CompanyPermission companyId={currentId} requiresAdmin={true}>
              <CompanyAdminDropdown companyId={companyId} company={company} tenant_meta={tenant_meta} />
            </CompanyPermission>
          ) : null}
        </MiniErrorBoundary>
      </div>

    </ErrorBoundary>
  );
}
