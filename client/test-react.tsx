import React from "react";
import { createRoot } from "react-dom/client";

function TestApp() {
  return React.createElement("div", {}, "React is working!");
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(React.createElement(TestApp));
}
