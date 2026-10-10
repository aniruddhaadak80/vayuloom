export const dynamic = "force-dynamic";

const SEED = 7331;

export async function GET(): Promise<Response> {
  const body = {
    status: "ok",
    service: "vayuloom",
    seed: SEED,
    time: new Date().toISOString(),
  };
  return Response.json(body);
}
