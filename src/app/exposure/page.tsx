import type { Metadata } from "next";
import ExposureClient from "./exposure-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Exposure Calculator — VayuLoom",
  description: "Personal PM2.5 exposure score with WHO-guideline based advice.",
};

export default function ExposurePage() {
  return <ExposureClient />;
}
