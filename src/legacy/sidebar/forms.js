import React from "react";
import { connect } from "react-redux";
import Traec from "traec";

import BaseFormConnected from "traec-react/utils/form";

import { ErrorBoundary } from "traec-react/errors";
import { SetMetaDataFields } from "storybook-dashboard/legacy/forms/meta";

import { setAndShowModal } from "storybook-dashboard/legacy/utils/modal";
import { Spinner } from "traec-react/utils/entities";

export const reportingPeriodChoices = [
  "MONTHS",
  "DAYS",
  "WEEKS",
  "QUARTERS",
  "YEARS",
];

export const companyFields = {
  name: { value: "", class: "col", endRow: true },
};

export const projectFields = {
  name: { value: "", class: "col", endRow: true },
  //address: { value: "", class: "col", endRow: true },
  //suburb: { value: "", class: "col" },
  //postcode: { value: "", class: "col" },
  //country: { value: "", class: "col", endRow: true },

  //client: {value:'', class: 'col-sm-8'},
  //NLA: {label: 'Project NLA', value:'', class: 'col', endRow: true},

  // Setting up from a template
  from_template: {
    label: "From Template",
    defaultValue: null,
    value: null,
    class: "col",
    inputType: "select",
    endRow: true,
    options: [
      <option key={1} value={""}>
        None
      </option>,
    ],
  },
  reporting_from_template: {
    label: "Inherit Reporting, AuthGroups and Supplier Setup from Template",
    value: false,
    onChange: (e) => {
      e.preventDefault();
      console.log("PRESSED");
    },
    inputType: "checkbox",
    endRow: true,
  },
  include_subcategories: {
    label: "Include Reporting Packages from Template",
    value: false,
    onChange: (e) => {
      e.preventDefault();
      console.log("PRESSED");
    },
    inputType: "checkbox",
    endRow: true,
  },

  // Project reporting periods
  reporting_start: {
    label: "Reporting from: ",
    value: "",
    inputType: "date",
    class: "col",
  },
  reporting_end: {
    label: "Reporting to: ",
    value: "",
    inputType: "date",
    class: "col",
    endRow: true,
  },
  reporting_freq: {
    label: "Every",
    value: 1,
    class: "col",
    inputType: "number",
  },
  reporting_units: {
    label: "Reporting Increments",
    value: "MONTHS",
    class: "col",
    inputType: "select",
    endRow: true,
    options: reportingPeriodChoices.map((name, i) => (
      <option key={i} value={name}>
        {name}
      </option>
    )),
  },
};

export const workPackageDetailsFields = {
  name: { value: "", class: "col", endRow: true },
  commit__reporting_period: {
    label: "Set the current Reporting Period",
    value: "",
    inputType: "select",
    class: "col",
  },
  commit__due_date: {
    label: "Due date: ",
    value: "",
    inputType: "date",
    class: "col",
    helpText:
      "Due dates for the following reporting periods will be set accordingly",
  },
  commit__discipline: {
    label: "Appoint reporter for this package",
    value: "",
    inputType: "select",
    class: "col",
    endRow: true,
  },
};

export const workPackageFields = {
  name: { value: "", class: "col", endRow: true },
  latest_commit__reporting_period: {
    label: "Set the current Reporting Period",
    value: "",
    inputType: "select",
    class: "col",
  },
  latest_commit__due_date: {
    label: "Due date: ",
    value: "",
    inputType: "date",
    class: "col",
    helpText:
      "Due dates for the following reporting periods will be set accordingly",
  },
  latest_commit__discipline: {
    label: "Appoint reporter for this package",
    value: "",
    inputType: "select",
    class: "col",
    endRow: true,
  },
};

export const setFetchBody = (post, company, meta) => {
  let styles = (company.getInPath("meta_json.styles") || Traec.Im.Map()).toJS();

  post.company = { uid: company.get("uid") };
  post.meta_json = Traec.Im.isImmutable(meta) ? meta?.toJS() : {} || {};
  post.meta_json.syles = styles;

  let [templateTrackerId, templateProjectId] = (post.from_template || "").split(
    "."
  );
  post.from_template = templateTrackerId || null;
  post.meta_json.from_template = templateTrackerId || null;

  if (!post.reporting_from_template) {
    post.reporting = {
      startDate: post.reporting_start,
      endDate: post.reporting_end,
      freq_unit: post.reporting_units,
      freq_num: post.reporting_freq,
    };
  } else {
    post.meta_json.setup_from_project = templateProjectId;
  }

  console.log("SENDING POST DATA", post);
  return post;
};

const getNewProjectMeta = (company, tenant_meta) => {
  let inputs =
    Traec.Im.fromJS(tenant_meta || Traec.Im.Map()).get(
      "new_project_input_details"
    ) || company.getInPath("meta_json.input_details");

  let meta = company.get("meta_json") || Traec.Im.Map();

  return inputs ? meta.set("input_details", inputs) : meta;
};

function ProjectSetupPending() {
  return (
    <div>
      <h3>Please be patient...</h3>
      <Spinner />
    </div>
  );
}

class CompanyProjectForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formFields: projectFields,
      setTemplateFields: false,
      templateCounter: 0,
      meta: getNewProjectMeta(props.company, props.tenant_meta),
    };

    // Data required from the API for this Component
    this.requiredFetches = [
      new Traec.Fetch(
        "tracker",
        "list",
        {},
        {
          preUpdateHook: (args) => ({ ...args, onlyTemplates: true }),
        }
      ),
    ];
  }

  componentDidMount() {
    Traec.fetchRequiredFor(this);
  }

  componentDidUpdate() {
    let { templates } = this.props;
    let { setTemplateFields, templateCounter } = this.state;
    if (templates?.size && templates?.size != templateCounter) {
      console.log("Got new templates.size - updating list of templates");
      this.setFormTemplates();
    }
  }

  setFormTemplates() {
    let { templates } = this.props;
    let templateOptions = templates
      .toList()
      .map((tracker, i) => (
        <option
          key={i}
          value={`${tracker.get("uid")}.${tracker.getInPath("project.uid")}`}
        >
          {tracker.getInPath("project.name")}
        </option>
      ))
      .unshift(
        <option key={-1} value={""}>
          None
        </option>
      );

    projectFields.from_template.options = templateOptions;

    this.setState({
      setTemplateFields: true,
      templateCounter: templates?.size,
    });
  }

  setReportingDisabled(status) {
    projectFields.reporting_start.disabled = status;
    projectFields.reporting_end.disabled = status;
    projectFields.reporting_freq.disabled = status;
    projectFields.reporting_units.disabled = status;
  }

  render() {
    let { company, tenant_meta, modalId } = this.props;
    let { meta } = this.state;

    let fetch = new Traec.Fetch("project_and_setup", "post", {
      postTrackerSetupSuccessHook: (data) => {
        console.log("Got response from tracker setup. Waiting 7 seconds", data);
        setTimeout(function () {
          let projectId = data.project.uid;
          console.log("Redirecting to new created project", projectId);
          location.href = `/project/${projectId.substring(0, 8)}`;
        }, 2000);
      },
    });
    fetch.updateFetchParams({
      preFetchHook: (body) => setFetchBody(body, company, meta),
      postSuccessHook: (data) => {
        $(`#${modalId}`).modal("hide");
        setAndShowModal("projectSetupPending", {
          title: "Setting up your project",
          body: <ProjectSetupPending />,
        });
      },
    });

    let metaInputs =
      Traec.Im.fromJS(tenant_meta || Traec.Im.Map()).get(
        "new_project_input_details"
      ) || company.getInPath("meta_json.input_details");

    return (
      <React.Fragment>
        <BaseFormConnected
          list="autocompleteOff"
          params={fetch.params}
          fields={projectFields}
          forceShowForm={true}
          hideUnderline={true}
          postChangeHook={(e) => {
            if (e.target.name == "reporting_from_template") {
              this.setReportingDisabled(e.target.checked);
            }
            if (e.target.name == "from_template") {
              let is_set = !(e.target.value == null || e.target.value == "");
              projectFields.reporting_from_template.value = is_set;
              this.setReportingDisabled(is_set);
            }
          }}
        />
        {!metaInputs ? null : (
          <ErrorBoundary>
            <hr />
            <div className="col-sm-12">
              <SetMetaDataFields
                hideAdmin={true}
                hideSave={true}
                metaJson={meta}
                setMeta={(_meta) => {
                  this.setState({ meta: _meta });
                }}
              />
            </div>
          </ErrorBoundary>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  let { companyId } = ownProps;
  let company = state.getInPath(`entities.companies.byId.${companyId}`);
  let projects = company.get(`projects`);
  // Get tracker templates
  let trackers = state.getInPath(`entities.trackers.byId`);
  let templates = trackers
    ? trackers.filter((item) => item.get("is_template"))
    : null;
  let user = state.getInPath("auth.user");
  return { company, projects, templates, user };
};

export default connect(mapStateToProps)(CompanyProjectForm);
