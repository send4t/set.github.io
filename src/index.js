import "./bufferFallback";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Web3ReactProvider } from "@web3-react/core";
import Web3 from "web3";

window.Buffer = window.Buffer || Buffer;
const root = ReactDOM.createRoot(document.getElementById("root"));

function getLibrary(provider) {
  return new Web3(provider);
}

root.render(
  <Web3ReactProvider getLibrary={getLibrary}>
    <App/>
  </Web3ReactProvider>
);
