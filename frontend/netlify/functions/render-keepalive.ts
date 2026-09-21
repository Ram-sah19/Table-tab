export default async () => {
  const base = process.env.BACKEND_URL;
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) {
    return new Response("BACKEND_URL or CRON_SECRET not configured", {
      status: 500,
    });
  }

  try {
    const res = await fetch(`${base}/api/cron/keep-alive`, {
      headers: { "x-cron-secret": secret },
      signal: AbortSignal.timeout(15_000),
    });
    return new Response(await res.text(), { status: res.status });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "ping failed";
    return new Response(msg, { status: 502 });
  }
};

export const config = {
  schedule: "*/12 * * * *",
};
