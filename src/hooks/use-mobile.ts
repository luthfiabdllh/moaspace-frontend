import * as React from "react"

const MOBILE_BREAKPOINT = 768

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT
}

function getServerSnapshot() {
  // No viewport info during SSR — default to desktop, same as the previous
  // `undefined` initial state coerced through `!!isMobile`.
  return false
}

export function useIsMobile() {
  // useSyncExternalStore is the React-recommended way to subscribe to an
  // external, mutable source (window size via matchMedia) — avoids the
  // setState-in-effect pattern entirely instead of working around it.
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
