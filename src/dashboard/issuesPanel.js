import React from "react";
import useApi from "storybook-dashboard/utils/fetching";
import TipsSpinner from "storybook-dashboard/spinners/tipsSpinner";
import { BSCard, BSCardGrid } from "traec-react/utils/bootstrap";

export default function IssuesPanel({ projectId, refId, isRootRef }) {
  let REF_ID = isRootRef ? "root" : refId;
  let url = `/api/dashboard/project/${projectId}/wpack/${REF_ID}/issue_rag_data`;
  let { data, isLoading, trigger, isFetching } = useApi(url);
  console.log("data issues panel here >", data?.toJS());

  let issues = data?.keySeq().toArray();
  console.log(issues, "issuesGrabbed");
  if (isLoading || isFetching)
    return (
      <div>
        <TipsSpinner />
      </div>
    );
  return (
    <div className="row">
      <div className="card shadow">
        <div className="col-sm">
          {issues?.map((issue) => {
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{issue || "hi"}</h5>
                <a href="#" className="btn btn-primary">
                  Explore
                </a>
              </div>
            </div>;
          })}
        </div>
      </div>
    </div>
  );
}
