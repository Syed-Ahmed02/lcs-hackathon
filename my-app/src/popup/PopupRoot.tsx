import { ConvexProvider, ConvexReactClient } from "convex/react";
import { PopupApp } from "./PopupApp.tsx";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const convexClient = convexUrl
  ? new ConvexReactClient(convexUrl)
  : null;

export function PopupRoot() {
  const inner = <PopupApp />;
  if (!convexClient) {
    return inner;
  }
  return <ConvexProvider client={convexClient}>{inner}</ConvexProvider>;
}
