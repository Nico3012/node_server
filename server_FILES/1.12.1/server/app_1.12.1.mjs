import main from "./main_1.12.1.mjs";
import env from "./env_1.12.1.mjs";
import http2 from "node:http2";
import fs from "node:fs";

let server = env.secure ? http2.createSecureServer({
    cert: await fs.promises.readFile(env.cert),
    key: await fs.promises.readFile(env.key)
}) : http2.createServer();

let getMime = path => {
    if (path.endsWith(".txt")) return "text/plain; charset=utf-8";
    if (path.endsWith(".html")) return "text/html; charset=utf-8";
    if (path.endsWith(".css")) return "text/css; charset=utf-8";
    if (path.endsWith(".js")) return "text/javascript; charset=utf-8";
    if (path.endsWith(".json")) return "application/json; charset=utf-8";
    if (path.endsWith(".webmanifest")) return "application/manifest+json; charset=utf-8";
    if (path.endsWith(".wasm")) return "application/wasm";
    if (path.endsWith(".pdf")) return "application/pdf";
    if (path.endsWith(".png")) return "image/png";
    if (path.endsWith(".mp4")) return "video/mp4";
    if (path.endsWith(".woff")) return "font/woff";
    if (path.endsWith(".woff2")) return "font/woff2";
    return "application/octet-stream";
};

server.on("error", error => console.log(error.message));

server.on("stream", (stream, headers) => {
    let method = headers[":method"];

    let [path, search = ""] = headers[":path"].split(/(?=\?)/, 2);
    path = path.replaceAll(/\.\./g, ".");
    if (path.endsWith("/")) path += "index.html";

    let params = Object.fromEntries(new URLSearchParams(search));

    let body = new Promise(resolve => {
        let data = "";
        stream.setEncoding("utf-8");
        stream.on("data", chunk => data += chunk);
        stream.on("end", () => resolve(data));
    });

    let cookie = headers.cookie ? Object.fromEntries(headers.cookie.split("; ").map(string => string.split("="))) : {};

    let sendFile = ({ path, search = "", status = 200, cookie }) => new Promise((resolve, reject) => {
        fs.promises.stat("./app" + path)
            .then(stat => {
                if (stat.isFile()) {
                    if (headers.range) {
                        let offset = Number(headers.range.split("-", 1)[0].replaceAll(/\D/g, ""));
                        let end = Math.min(offset + 10 ** 6, stat.size - 1);
                        let length = end - offset + 1;

                        stream.respondWithFile("./app" + path, {
                            ":status": 206,
                            "content-type": getMime(path),
                            "content-range": `bytes ${offset}-${end}/${stat.size}`,
                            "content-length": length,
                            "accept-ranges": "bytes",
                            ...(cookie && {
                                "set-cookie": Object.entries(cookie).map(array => array.join("="))
                            })
                        }, {
                            offset,
                            length
                        });
                        stream.on("finish", () => resolve(206));
                    } else {
                        stream.respondWithFile("./app" + path, {
                            ":status": status,
                            "content-type": getMime(path),
                            ...(cookie && {
                                "set-cookie": Object.entries(cookie).map(array => array.join("="))
                            })
                        });
                        stream.on("finish", () => resolve(status));
                    }
                } else if (stat.isDirectory()) {
                    stream.respond({
                        ":status": 308,
                        "location": path + "/" + search,
                        ...(cookie && {
                            "set-cookie": Object.entries(cookie).map(array => array.join("="))
                        })
                    });
                    stream.end();
                    stream.on("finish", () => resolve(308));
                } else
                    reject(403);
            })
            .catch(() => reject(404));
    });

    let sendData = ({ data, mime = "text/plain; charset=utf-8", status = 200, cookie }) => new Promise(resolve => {
        stream.respond({
            ":status": status,
            "content-type": mime,
            ...(cookie && {
                "set-cookie": Object.entries(cookie).map(array => array.join("="))
            })
        });
        stream.end(data);
        stream.on("finish", () => resolve(status));
    });

    let sendHref = ({ href, status = 308, cookie }) => new Promise(resolve => {
        stream.respond({
            ":status": status,
            "location": href,
            ...(cookie && {
                "set-cookie": Object.entries(cookie).map(array => array.join("="))
            })
        });
        stream.end();
        stream.on("finish", () => resolve(status));
    });

    main({ method, path, search, params, body, cookie, sendFile, sendData, sendHref });
});

server.listen(env.secure ? 443 : env.port);
