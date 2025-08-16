import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Debug: Log React availability
console.log('React available:', !!React);
console.log('React.createElement available:', !!React.createElement);

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(React.createElement(App));
} else {
  console.error('Root element not found');
}
