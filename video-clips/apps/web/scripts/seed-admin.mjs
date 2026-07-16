const base = process.env.APP_URL || "http://localhost:3010";
const name = process.env.ADMIN_NAME || "Admin";
const email = process.env.ADMIN_EMAIL || "admin@vibecodeflow.com";
const password = process.env.ADMIN_PASSWORD || "changeme123";

const res = await fetch(`${base}/api/admin/setup`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name, email, password }),
});
const body = await res.json();
console.log(res.status, body);
