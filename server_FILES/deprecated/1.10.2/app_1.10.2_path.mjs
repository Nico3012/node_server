import main from "./main_1.10.2_path.mjs";
import env from "./env_1.10.2_path.mjs";
import https from "node:https";
import http from "node:http";
import fs from "node:fs";

https.createServer({ cert: await fs.promises.readFile(env.cert), key: await fs.promises.readFile(env.key) }, (req, res) => main(
    req.method,

    (([path, search = ""]) => ({
        path: path.endsWith("/") ? path.replace(/\.\./g, ".") + "index.html" : path.replace(/\.\./g, "."),
        search,
        params: Object.fromEntries(new URLSearchParams(search))
    }))(req.url.split(/(?=\?)/, 2)),

    new Promise((resolve, reject, body = "") => req.on("data", data => body += data).on("end", () => resolve(body))),

    (path, search = "", status = 200) => new Promise((resolve, reject) => fs.promises.stat("./app" + path).then(data => data.isFile() ? fs.createReadStream("./app" + path).on("open", () => res.writeHead(status, {
        "Content-Type": path.endsWith(".txt") ? "text/plain" : path.endsWith(".html") ? "text/html" : path.endsWith(".css") ? "text/css" : path.endsWith(".js") ? "text/javascript" : path.endsWith(".json") ? "application/json" : path.endsWith(".wasm") ? "application/wasm" : path.endsWith(".pdf") ? "application/pdf" : path.endsWith(".png") ? "image/png" : path.endsWith(".woff") ? "font/woff" : path.endsWith(".woff2") ? "font/woff2" : "application/octet-stream"
    })).pipe(res).on("finish", resolve) : data.isDirectory() ? res.writeHead(308, {
        "Location": path + "/" + search
    }).end().on("finish", resolve) : reject(403)).catch(() => reject(404))),

    (data, mime = "text/plain", status = 200) => new Promise((resolve, reject) => res.writeHead(status, {
        "Content-Type": mime
    }).end(data).on("finish", resolve)),

    (href, status = 308) => new Promise((resolve, reject) => res.writeHead(status, {
        "Location": href
    }).end().on("finish", resolve))
)).listen(443);

http.createServer((req, res) => res.writeHead(308, {
    "Location": "https://" + req.headers.host + req.url
}).end()).listen(80);
