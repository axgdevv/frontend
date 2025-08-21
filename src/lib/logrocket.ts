"use client";

import LogRocket from "logrocket";

let initialized = false;

export function initLogRocket() {
  if (typeof window !== "undefined" && !initialized) {
    LogRocket.init(process.env.LOGROCKET_APP_ID ?? "");
    initialized = true;
  }
}
