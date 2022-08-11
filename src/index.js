import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { ErrorBoundary } from "traec-react/errors";
import store from "traec/redux/store";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import NavBar from "traec-react/navBar";


// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

import { StrictMode } from "react";

//const rootElement = document.getElementById("root");
//const root = createRoot(rootElement);

ReactDOM.render(
  <ErrorBoundary title="Error loading the application">
    <StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </BrowserRouter>
      </Provider>
    </StrictMode>
  </ErrorBoundary>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
