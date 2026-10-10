"use client";

import { useMemo, useState } from "react";
import { autopilotPlan } from "@/lib/agents";
import { getZones } from "@/lib/aqi";

// Production path (documented, not executed here):
//   1. `docker run -p 4566:4566 localstack/localstack`
//   2. `awslocal sns create-topic --name vayuloom-alerts`
//   3. `awslocal sns subscribe --topic-arn <arn> --protocol sms --notification-endpoint +91…`
//   4. Server Action / route handler calls:
//        new SNSClient({ endpoint: "http://localhost:4566", region: "ap-south-1" })
//          .send(new PublishCommand({ TopicArn, Message: plan.parentSMS_EN }))
//   This page simulates that fan-out locally so schools can rehearse copy,
//   timing and audience slices with zero cloud dependency.

type TemplateKey = "sms-en" | "sms-hi" | "principal";
type Audience = "All parents" | "Primary wing" | "Staff";

interface LogEntry {
  id: string;
  time: string;
  audience: Audience;
  template: TemplateKey;
  chars: number;
  parts: number;
}

const TEMPLATE_LABEL: Record<TemplateKey, string> = {
  "sms-en": "Parent SMS — English",
  "sms-hi": "Parent SMS — Hindi",
  principal: "Principal card",
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function AlertsClient() {
  const zones = useMemo(() => getZones(), []);
  const [zoneId, setZoneId] = useState("anand-vihar");
  const [students, setStudents] = useState(900);
  const [template, setTemplate] = useState<TemplateKey>("sms-en");
  const [audience, setAudience] = useState<Audience>("All parents");
  const [log, setLog] = useState<LogEntry[]>([]);
  const [copied, setCopied] = useState(false);

  const zone = zones.find((z) => z.id === zoneId) ?? zones[0]!;
  const plan = useMemo(
    () => autopilotPlan({ aqi: zone.aqi, zoneName: zone.name, students }),
    [zone, students],
  );

  const message =
    template === "sms-en"
      ? plan.parentSMS_EN
      : template === "sms-hi"
        ? plan.parentSMS_HI
        : plan.principalCard.join("\n");

  const parts = Math.max(1, Math.ceil(message.length / 160));

  function simulateSend(): void {
    const now = new Date();
    setLog((prev) =>
      [
        {
          id: `local-${now.getTime()}`,
          time: now.toLocaleTimeString("en-IN", { hour12: false }),
          audience,
          template,
          chars: message.length,
          parts,
        },
        ...prev,
      ].slice(0, 20),
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">VayuLoom · Alerts</p>
      <h1 className="mt-2 text-3xl font-bold">Parent &amp; principal alerts simulator</h1>
      <p className="mt-2 text-sm text-slate-300">
        Rehearse the 7 am fan-out locally. Same message bodies the SNS publisher sends — copy, timing and
        audience slices included.
      </p>

      <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Zone</span>
          <select
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2"
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name} — AQI {z.aqi}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Students</span>
          <input
            type="number"
            min={1}
            max={10000}
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2"
            value={students}
            onChange={(e) => setStudents(Math.max(1, Math.min(10000, Number(e.target.value) || 1)))}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Template</span>
          <select
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2"
            value={template}
            onChange={(e) => setTemplate(e.target.value as TemplateKey)}
          >
            {(Object.keys(TEMPLATE_LABEL) as TemplateKey[]).map((k) => (
              <option key={k} value={k}>
                {TEMPLATE_LABEL[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Audience</span>
          <select
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2"
            value={audience}
            onChange={(e) => setAudience(e.target.value as Audience)}
          >
            {(["All parents", "Primary wing", "Staff"] as Audience[]).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">Message preview</h2>
          <span className="text-xs text-slate-400">
            {message.length} chars · {parts} SMS part{parts > 1 ? "s" : ""}
          </span>
        </div>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-200">{message}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={simulateSend}
            className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300"
          >
            Simulate send
          </button>
          <button
            type="button"
            onClick={() => copyText(message).then(setCopied)}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            {copied ? "Copied ✓" : "Copy message"}
          </button>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="font-bold">Send log (local simulation)</h2>
        {log.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">No sends yet — hit “Simulate send”.</p>
        ) : (
          <ul className="mt-2 space-y-1.5 text-sm text-slate-200">
            {log.map((e) => (
              <li key={e.id} className="flex flex-wrap gap-x-2">
                <span className="font-mono2 text-xs text-cyan-300">{e.time}</span>
                <span>{TEMPLATE_LABEL[e.template]}</span>
                <span className="text-slate-400">→ {e.audience}</span>
                <span className="text-slate-400">
                  ({e.chars} chars, {e.parts} part{e.parts > 1 ? "s" : ""}, id {e.id})
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm">
        <h2 className="font-bold">Graduating to AWS SNS (via LocalStack)</h2>
        <pre className="mt-2 overflow-x-auto rounded-xl bg-black/40 p-3 font-mono2 text-xs leading-relaxed text-slate-200">
{`# 1. LocalStack + topic
docker run -d -p 4566:4566 localstack/localstack
awslocal sns create-topic --name vayuloom-alerts

# 2. Subscribe parents (SMS) / staff (email)
awslocal sns subscribe --topic-arn <arn> \\
  --protocol sms --notification-endpoint +91XXXXXXXXXX

# 3. Publish from a Next.js Route Handler (ap-south-1)
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
const sns = new SNSClient({ endpoint: "http://localhost:4566", region: "ap-south-1" });
await sns.send(new PublishCommand({ TopicArn: process.env.ALERTS_TOPIC_ARN, Message: plan.parentSMS_EN }));`}
        </pre>
      </section>
    </main>
  );
}
