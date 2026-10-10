import type { Metadata } from "next";
import StubbleClient from "./stubble-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stubble Tracer — VayuLoom",
  description: "Fire-to-smoke transport: Punjab/Haryana fire clusters and the 48-hour Delhi forecast.",
};

export default function StubblePage() {
  return <StubbleClient />;
}
