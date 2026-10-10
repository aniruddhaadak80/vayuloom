import type { Metadata } from "next";
import IndoorClient from "./indoor-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Classroom Guardian — VayuLoom",
  description: "Box-model classroom air: indoor PM2.5 and CO2 with purifier advice.",
};

export default function IndoorPage() {
  return <IndoorClient />;
}
