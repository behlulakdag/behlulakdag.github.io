import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const html = await read("index.html");

test("robots.txt allows crawling and points to the sitemap", async () => {
  const robots = await read("robots.txt");
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/behlulakdag\.github\.io\/sitemap\.xml/);
});

test("sitemap lists the portfolio and no demo site", async () => {
  const sitemap = await read("sitemap.xml");
  assert.match(sitemap, /<loc>https:\/\/behlulakdag\.github\.io\/<\/loc>/);
  assert.doesNotMatch(sitemap, /demos\//);
});

test("hreflang links cover Turkish, English and a default", () => {
  for (const lang of ["tr", "en", "x-default"]) {
    assert.match(html, new RegExp(`rel="alternate" hreflang="${lang}"`));
  }
});

test("JSON-LD is valid and its profile links match the contact links on the page", () => {
  const block = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(block, "no JSON-LD block");
  const data = JSON.parse(block[1]);
  assert.equal(data["@type"], "Person");
  assert.equal(data.name, "Behlül Akdağ");
  const contactSection = html.slice(html.indexOf('id="contact"'));
  for (const link of data.sameAs) {
    assert.ok(contactSection.includes(link), `${link} is not in the contact section`);
  }
});

test("manifest is valid and every icon it lists exists at the stated size", async () => {
  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest" \/>/);
  const manifest = JSON.parse(await read("manifest.webmanifest"));
  assert.equal(manifest.start_url, "/");
  for (const icon of manifest.icons) {
    const png = await readFile(new URL(`../${icon.src}`, import.meta.url));
    // PNG header: width and height are big-endian 32-bit ints at bytes 16 and 20
    const size = `${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`;
    assert.equal(size, icon.sizes, icon.src);
  }
});

test("every demo site stays out of search results", async () => {
  for (const demo of await readdir(new URL("../demos/", import.meta.url))) {
    const page = await read(`demos/${demo}/index.html`);
    assert.match(page, /<meta name="robots" content="noindex" \/>/, `${demo} is indexable`);
  }
});

test("every demo has a link-preview image that exists and is 1200x630", async () => {
  for (const demo of await readdir(new URL("../demos/", import.meta.url))) {
    const page = await read(`demos/${demo}/index.html`);
    const url = page.match(/property="og:image" content="([^"]+)"/)?.[1];
    assert.ok(url, `${demo} has no og:image`);
    const localPath = url.replace("https://behlulakdag.github.io/", "");
    const png = await readFile(new URL(`../${localPath}`, import.meta.url));
    assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, "1200x630", localPath);
  }
});
