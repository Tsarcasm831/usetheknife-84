"use strict";
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

function fetchFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      resolve();
      return;
    }
    const proto = url.startsWith("https") ? https : http;
    proto.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`Request failed ${res.statusCode} ${url}`));
        return;
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on("finish", () => stream.close(resolve));
    }).on("error", reject);
  });
}

async function process(obj, current) {
  for (const [key, value] of Object.entries(obj)) {
    const target = path.join(current, key);
    if (typeof value === "string") {
      console.log(`Caching ${key}`);
      await fetchFile(value, target);
    } else if (typeof value === "object") {
      await process(value, target);
    }
  }
}

(async () => {
  const listPath = path.join(__dirname, "..", "downloadableassets.txt");
  const json = fs.readFileSync(listPath, "utf8");
  const assets = JSON.parse(json);
  const baseDir = path.join(__dirname, "..", "assets");
  await process(assets, baseDir);

  require(path.join(__dirname, "build_assets_manifest.js"));
})();
