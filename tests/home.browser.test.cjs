const { spawn } = require("node:child_process");
const { once } = require("node:events");
const net = require("node:net");
const path = require("node:path");
const { mkdir } = require("node:fs/promises");
const { chromium } = require("playwright");

let server;
let browser;
let baseURL;
let serverOutput = "";

beforeAll(async () => {
  const reservation = net.createServer();
  reservation.listen(0, "127.0.0.1");
  await once(reservation, "listening");
  const port = reservation.address().port;
  await new Promise((resolve) => reservation.close(resolve));
  baseURL = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, [require.resolve("next/dist/bin/next"),
    "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: path.resolve(__dirname, ".."),
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (data) => { serverOutput += data.toString(); });
  server.stderr.on("data", (data) => { serverOutput += data.toString(); });
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(serverOutput);
    try {
      await fetch(baseURL);
      ready = true;
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  if (!ready) throw new Error(`App did not start:\n${serverOutput}`);
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  });
});

afterAll(async () => {
  await browser?.close();
  if (server && server.exitCode === null) {
    const exited = once(server, "exit");
    server.kill("SIGTERM");
    await exited;
  }
});

test("matches the minimal Home frame at its 750px design width", async () => {
  const page = await browser.newPage({ viewport: { width: 750, height: 1334 } });
  try {
    const response = await page.goto(baseURL);
    expect(response.status()).toBe(200);
    await page.evaluate(() => document.fonts.ready);
    const design = await page.evaluate(() => {
      const main = document.querySelector("main");
      const heading = document.querySelector("h1");
      const link = document.querySelector("main a");
      const m = getComputedStyle(main);
      const h = getComputedStyle(heading);
      const a = getComputedStyle(link);
      return {
        text: heading.textContent,
        padding: m.padding,
        gap: m.gap,
        background: getComputedStyle(document.body).backgroundColor,
        headingSize: h.fontSize,
        headingWeight: h.fontWeight,
        fontFamily: h.fontFamily,
        linkSize: a.fontSize,
        linkWeight: a.fontWeight,
        border: a.borderTopWidth,
        borderColor: a.borderTopColor,
        radius: a.borderTopLeftRadius,
        shadow: a.boxShadow,
        linkHeight: link.getBoundingClientRect().height,
        linkWidth: link.getBoundingClientRect().width,
        headingX: heading.getBoundingClientRect().x,
        linkX: link.getBoundingClientRect().x,
      };
    });
    expect(design).toMatchObject({
      text: "JobScaffold", padding: "32px", gap: "16px",
      background: "rgb(255, 255, 255)", headingSize: "42px", headingWeight: "700",
      linkSize: "20px", linkWeight: "600", border: "1px",
      borderColor: "rgb(0, 0, 0)", radius: "0px", shadow: "none",
      linkHeight: 58, linkWidth: 686, headingX: 32, linkX: 32,
    });
    expect(design.fontFamily).toContain("Inter");
    await mkdir(path.resolve(__dirname, "../test-results"), { recursive: true });
    await page.screenshot({ path: path.resolve(__dirname, "../test-results/home-750.png") });
  } finally {
    await page.close();
  }
});

test.each([375, 1440])("keeps the Home content usable at %ipx", async (width) => {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  try {
    await page.goto(baseURL);
    expect(await page.getByRole("heading", { name: "JobScaffold" }).isVisible()).toBe(true);
    expect(await page.getByRole("link", { name: "Register as a Contractor" }).isVisible()).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally {
    await page.close();
  }
});

test("home navigation opens contractor registration", async () => {
  const page = await browser.newPage();
  try {
    await page.goto(baseURL);
    await page.getByRole("link", { name: "Register as a Contractor" }).click();
    await page.waitForURL(`${baseURL}/register/contractor`);
    await page.getByRole("heading", { name: "Register as a Contractor", exact: true }).waitFor();
    const response = await page.goto(`${baseURL}/register/contractor`);
    expect(response.status()).toBe(200);
    expect(await page.getByRole("button", { name: "Create", exact: true }).isVisible()).toBe(true);
  } finally {
    await page.close();
  }
});

test("matches registration frame 230:13 at its 750px design width", async () => {
  const page = await browser.newPage({ viewport: { width: 750, height: 1334 } });
  try {
    await page.goto(`${baseURL}/register/contractor`);
    await page.evaluate(() => document.fonts.ready);
    const design = await page.evaluate(() => {
      const box = (element) => {
        const { x, y, width, height } = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return { x, y, width, height, fontSize: style.fontSize, fontWeight: style.fontWeight,
          border: style.borderTopWidth, radius: style.borderTopLeftRadius, shadow: style.boxShadow };
      };
      return {
        heading: box(document.querySelector("h1")),
        inputs: [...document.querySelectorAll("input")].map(box),
        labels: [...document.querySelectorAll("label")].map(box),
        button: box(document.querySelector("button[type=submit]")),
      };
    });
    expect(design.heading).toMatchObject({ x: 32, y: 32, width: 686, height: 51, fontSize: "42px", fontWeight: "700" });
    design.inputs.forEach((input, index) => expect(input).toMatchObject({
      x: 32, y: 129 + index * 94, width: 686, height: 48, border: "1px", radius: "0px", shadow: "none",
    }));
    design.labels.forEach((label, index) => expect(label).toMatchObject({
      x: 32, y: 99 + index * 94, height: 22, fontSize: "18px", fontWeight: "600",
    }));
    expect(design.button).toMatchObject({ x: 32, y: 663, width: 686, height: 58, fontSize: "20px", fontWeight: "600" });
    await mkdir(path.resolve(__dirname, "../test-results"), { recursive: true });
    await page.screenshot({ path: path.resolve(__dirname, "../test-results/contractor-registration-750.png") });
  } finally {
    await page.close();
  }
});

test.each([375, 1440])("keeps registration usable at %ipx", async (width) => {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  try {
    await page.goto(`${baseURL}/register/contractor`);
    expect(await page.getByRole("heading", { name: "Register as a Contractor" }).isVisible()).toBe(true);
    expect(await page.locator("input").count()).toBe(6);
    expect(await page.getByRole("button", { name: "Create" }).isVisible()).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally {
    await page.close();
  }
});

test("registers in Firebase, logs in, and follows Create to the default profile 404", async () => {
  const page = await browser.newPage();
  const email = `contractor-${Date.now()}@example.com`;
  try {
    await page.goto(baseURL);
    await page.getByRole("link", { name: "Register as a Contractor" }).click();
    for (const [label, value] of [
      ["First name *", "Jane"], ["Last name *", "Builder"], ["Company name *", "Builder Co"],
      ["Email *", email], ["Password *", "password123"], ["Confirm password *", "password123"],
    ]) await page.getByLabel(label, { exact: true }).fill(value);

    await page.getByRole("button", { name: "Create" }).click();
    await page.waitForURL(`${baseURL}/settings/profile`);
    await page.getByRole("heading", { name: "404", exact: true }).waitFor();
    expect(await page.getByText("This page could not be found.", { exact: true }).isVisible()).toBe(true);

    const { initializeApp, deleteApp } = require("firebase-admin/app");
    const { getAuth } = require("firebase-admin/auth");
    const { getFirestore, Timestamp } = require("firebase-admin/firestore");
    const admin = initializeApp({ projectId: "demo-jobscaffold" }, `browser-${Date.now()}`);
    try {
      const user = await getAuth(admin).getUserByEmail(email);
      expect(user.emailVerified).toBe(false);
      const profile = await getFirestore(admin).collection("users").doc(user.uid).get();
      expect(profile.data()).toEqual({
        firstName: "Jane", lastName: "Builder", companyName: "Builder Co", email,
        contractor: true, createdAt: expect.any(Timestamp),
      });
      const session = await page.evaluate(async () => {
        const databases = await indexedDB.databases();
        const firebaseDB = databases.find((db) => db.name === "firebaseLocalStorageDb");
        if (!firebaseDB) return null;
        return new Promise((resolve, reject) => {
          const open = indexedDB.open(firebaseDB.name);
          open.onerror = () => reject(open.error);
          open.onsuccess = () => {
            const db = open.result;
            const request = db.transaction("firebaseLocalStorage", "readonly").objectStore("firebaseLocalStorage").getAll();
            request.onsuccess = () => { resolve(request.result.find((entry) => entry.fbase_key.startsWith("firebase:authUser:"))?.value); db.close(); };
            request.onerror = () => { reject(request.error); db.close(); };
          };
        });
      });
      expect(session).toMatchObject({ uid: user.uid, email });
      const oob = await fetch("http://127.0.0.1:9099/emulator/v1/projects/demo-jobscaffold/oobCodes").then((r) => r.json());
      expect((oob.oobCodes || []).filter((code) => code.email === email)).toEqual([]);
      await getFirestore(admin).collection("users").doc(user.uid).delete();
      await getAuth(admin).deleteUser(user.uid);
    } finally {
      await deleteApp(admin);
    }
    const response = await page.goto(`${baseURL}/settings/profile`);
    expect(response.status()).toBe(404);
  } finally {
    await page.close();
  }
});

test("browser required-field and password confirmation checks prevent registration", async () => {
  const page = await browser.newPage();
  const calls = [];
  page.on("request", (request) => {
    if (request.url().includes("/registerContractor")) calls.push(request.url());
  });
  try {
    await page.goto(`${baseURL}/register/contractor`);
    await page.getByRole("button", { name: "Create" }).click();
    expect(await page.getByLabel("First name *", { exact: true }).evaluate((el) => el.validity.valueMissing)).toBe(true);
    for (const [label, value] of [
      ["First name *", "Jane"], ["Last name *", "Builder"], ["Company name *", "Builder Co"],
      ["Email *", "validation@example.com"], ["Password *", "password123"], ["Confirm password *", "different"],
    ]) await page.getByLabel(label, { exact: true }).fill(value);
    await page.getByRole("button", { name: "Create" }).click();
    expect(await page.getByLabel("Confirm password *", { exact: true }).evaluate((el) => el.validity.customError)).toBe(true);
    expect(calls).toEqual([]);
    expect(new URL(page.url()).pathname).toBe("/register/contractor");
  } finally {
    await page.close();
  }
});
