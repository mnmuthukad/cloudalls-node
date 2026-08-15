const baseUrl = (process.env.BASE_URL || `http://127.0.0.1:${process.env.PORT || "3000"}`).replace(/\/$/, "");
const checks = [
  ["/healthz", 200, '"ok":true'],
  ["/", 200, "CloudAlls"],
  ["/about", 200, "CloudAlls"],
  ["/expertise", 200, "Capabilities"],
  ["/contact", 200, "name=\"csrf_token\""],
  ["/partnership", 200, "name=\"csrf_token\""],
  ["/careers", 200, "Careers"],
  ["/insights", 200, "Insights"],
  ["/portfolio", 200, "Case studies"],
  ["/sitemap.xml", 200, "<urlset"],
  ["/sw.js", 200, "cloudalls-static-v1"],
];

let failed = 0;
for (const [path, expectedStatus, expectedText] of checks) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.text();
  const ok = response.status === expectedStatus && body.includes(expectedText);
  console.log(`${ok ? "PASS" : "FAIL"} ${path} ${response.status}`);
  if (!ok) failed += 1;
}

const csrfResponse = await fetch(`${baseUrl}/contact`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "name=Smoke&email=smoke%40example.com&whatsapp=123456789&service=Custom&message=Smoke" });
const csrfBody = await csrfResponse.text();
const csrfOk = csrfResponse.status === 403 && csrfBody.includes("Request rejected");
console.log(`${csrfOk ? "PASS" : "FAIL"} POST /contact without CSRF ${csrfResponse.status}`);
if (!csrfOk) failed += 1;

if (failed) process.exitCode = 1;
