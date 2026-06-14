const DEFAULT_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const DEFAULT_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const API_KEY =
  process.env.DEEPSEEK_API_KEY ||
  process.env["DEEPSEEK-API-KEY"] ||
  process.env.VITE_DEEPSEEK_API_KEY ||
  "";

function sendJson(
  res: { status: (code: number) => { setHeader: (name: string, value: string) => { send: (body: unknown) => unknown } } },
  status: number,
  payload: unknown,
) {
  res.status(status).setHeader("Content-Type", "application/json").send(payload);
}

export default async function handler(
  req: { method?: string; query: Record<string, string | string[] | undefined>; body?: unknown },
  res: {
    setHeader: (name: string, value: string) => unknown;
    status: (code: number) => {
      send: (body: unknown) => unknown;
      setHeader: (name: string, value: string) => { send: (body: unknown) => unknown };
    };
    send: (body: unknown) => unknown;
  },
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }

  if (!API_KEY) {
    return sendJson(res, 500, { error: "Missing DEEPSEEK_API_KEY." });
  }

  const action = Array.isArray(req.query.action) ? req.query.action[0] : req.query.action;
  const suffix = action === "repair" || action === "completion" ? action : "generate";
  const targetUrl = `${DEFAULT_BASE_URL}/chat/completions`;

  const response = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      ...(req.body ?? {}),
      model: (req.body as { model?: string } | undefined)?.model || DEFAULT_MODEL,
      metadata: {
        source: "daedalus-api-proxy",
        action: suffix,
      },
    }),
  });

  const text = await response.text();
  res.status(response.status);
  res.setHeader("Content-Type", response.headers.get("content-type") || "application/json");
  return res.send(text);
}
