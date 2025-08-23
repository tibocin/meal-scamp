const POST = async ({ request }) => {
  const { title, message, token, user } = await request.json();
  const appToken = token || process.env.PUSHOVER_APP_TOKEN;
  const userKey = user || process.env.PUSHOVER_USER_KEY;
  if (!appToken || !userKey) {
    return new Response("Missing token/user", { status: 400 });
  }
  const form = new URLSearchParams();
  form.set("token", appToken);
  form.set("user", userKey);
  form.set("title", title || "Meal Scamp");
  form.set("message", message || "Ping");
  const r = await fetch("https://api.pushover.net/1/messages.json", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form
  });
  return new Response(await r.text(), { status: r.status });
};

export { POST };
//# sourceMappingURL=_server-BqMPLTrE.js.map
