import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";     // <-- note the .jsx extension
import "./main.css";             // or ./index.css, but be consistent

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);