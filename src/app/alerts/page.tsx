import type { Metadata } from "next";
import AlertsClient from "./alerts-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Alerts Simulator — VayuLoom",
  description: "Rehearse parent/principal alerts locally; graduate to AWS SNS via LocalStack.",
};

export default function AlertsPage() {
  return <AlertsClient />;
}
