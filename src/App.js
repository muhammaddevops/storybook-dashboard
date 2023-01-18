import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "traec-react/errors/handleError";
import NavBar from "traec-react/navBar";



function Home() {
  return (<p>Home page</p>)
}


function MainSwitch(props) {
  //console.log("REDIRECT AT MAINSWITCH", props);
  return (
    <Routes>
      {/* Route to a Company Dashboard */}
      <Route path="/:_type/:_id" element={<MockDashboardWrapper />} />

      {/* Route to a Project or WorkPackage Dashboard */}
      <Route path="/:_type/:_id/wpack/:_refId" element={<MockDashboardWrapper />} />

      {/* Default render homepage if no path matched */}
      <Route path="/" element={<Home />} />

    </Routes>
  );
}


function App() {
  return (
    <ErrorBoundary>
      <NavBar
        brand={<span style={{ color: "white" }}>Dashboard beta</span>}
        //preUserItems={<CompanyIDInput id={id} setId={setId} />}
        include_myprofile={false}
        //location={useLocation()}
        //createText={""}
        //azureConfig={getAzureConfig()}
      />
      <MainSwitch />
      {/*<MockDashboard companyId={id} />*/}
    </ErrorBoundary>
  );
}

export default App;
