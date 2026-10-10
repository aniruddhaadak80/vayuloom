import type { Metadata } from "next";
import SchoolClient from "./school-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "School Autopilot — VayuLoom",
  description: "Deterministic GRAP autopilot: principal card, parent SMS and dispersal plan per zone.",
};

export default function SchoolPage() {
  return <SchoolClient />;
}
