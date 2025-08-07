// src/setupTests.tsx
import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";

// React test environment flagging
declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// minimal ResizeObserver stub for Recharts
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// stub out react-quill so it doesn't call findDOMNode
vi.mock("react-quill", () => {
  const QuillStub = (props: any) =>
    React.createElement("textarea", { ...props, "data-testid": "quill" });
  return {
    __esModule: true,
    default: QuillStub};
  });

// WOrkaround for the console errors from React Test environment
const realConsoleError = console.error;
console.error = (msg?: any, ...args: any[]) => {
  if (typeof msg === "string" && msg.includes("not wrapped in act")
  ) {
    return;
  }
};