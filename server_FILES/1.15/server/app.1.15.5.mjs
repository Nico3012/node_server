// create __filename variable in module
let { fileURLToPath, pathToFileURL } = await import("node:url"); // use pathToFileURL for dynamic import
let __filename = fileURLToPath(import.meta.url);

// create __dirname variable in module
let { dirname, join } = await import("node:path");
let __dirname = dirname(__filename);

// let { x, y, z } = await import(pathToFileURL(join(__dirname, "..", "dir", "file.mjs")).href); // import x, y, z from "../dir/file.mjs"
// let stats = stat(join(__dirname, "..", "dir", "file.ext")); // get stats from "../dir/file.ext"

let { createSecureServer, createServer } = await import("node:http2");
let { readFile, stat } = await import("node:fs/promises");

let { env } = await import(pathToFileURL(join(__dirname, "env.1.15.5.mjs")).href);
let { main } = await import(pathToFileURL(join(__dirname, "main.1.15.5.mjs")).href);

let getCacheControl = path => {
    if (path.endsWith(".txt")) {
        return "no-cache";
    }
    if (path.endsWith(".html")) {
        return "no-cache";
    }
    if (path.endsWith(".css")) {
        return "max-age=31536000, immutable";
    }
    if (path.endsWith(".js")) {
        return "max-age=31536000, immutable";
    }
    if (path.endsWith(".json")) {
        return "max-age=31536000, immutable";
    }
    if (path.endsWith(".webmanifest")) {
        return "max-age=31536000, immutable";
    }
    if (path.endsWith(".wasm")) {
        return "max-age=31536000, immutable";
    }
    if (path.endsWith(".png")) {
        return "max-age=31536000, immutable";
    }
    if (path.endsWith(".mp4")) {
        return "max-age=31536000, immutable";
    }
    return "no-cache";
};

let getContentType = path => {
    if (path.endsWith(".txt")) {
        return "text/plain; charset=utf-8";
    }
    if (path.endsWith(".html")) {
        return "text/html; charset=utf-8";
    }
    if (path.endsWith(".css")) {
        return "text/css; charset=utf-8";
    }
    if (path.endsWith(".js")) {
        return "text/javascript; charset=utf-8";
    }
    if (path.endsWith(".json")) {
        return "application/json; charset=utf-8";
    }
    if (path.endsWith(".webmanifest")) {
        return "application/manifest+json; charset=utf-8";
    }
    if (path.endsWith(".wasm")) {
        return "application/wasm";
    }
    if (path.endsWith(".png")) {
        return "image/png";
    }
    if (path.endsWith(".mp4")) {
        return "video/mp4";
    }
    return "application/octet-stream";
};

let server = env.secure ? createSecureServer({
    cert: await readFile(env.cert),
    key: await readFile(env.key)
}) : createServer();

server.on("error", error => {
    console.log(error.message);
});

server.on("stream", async (stream, headers) => {
    stream.on("error", error => {
        console.log(error.message);
    });

    let method = headers[":method"];

    let [path, search = ""] = headers[":path"].split(/(?=\?)/, 2);
    if (path.includes("..")) {
        path = path.replaceAll(/\.\./g, ".");
    }
    if (path.endsWith("/")) {
        path = path.concat("index.html");
    }

    let params = Object.fromEntries(new URLSearchParams(search));

    let cookie = headers.cookie ? Object.fromEntries(headers.cookie.split("; ").map(string => {
        return string.split("=");
    })) : {};

    let body = new Promise(resolve => {
        let data = "";

        stream.setEncoding("utf-8");

        stream.on("data", chunk => {
            data = data.concat(chunk);
        });

        stream.on("end", () => {
            resolve(data);
        });
    });

    let sendFile = ({ path, status, cookie }) => {
        return new Promise((resolve, reject) => {
            let pathArray = path.split("/").map(string => {
                if (string === "") {
                    return ".";
                } else {
                    return string;
                }
            });

            let absolutePath = join(__dirname, "app", ...pathArray);

            stat(absolutePath).then(stats => {
                if (stats.isFile()) {
                    if (stream.destroyed) {
                        resolve(499); // resolves as no further action is required
                    } else {
                        if (headers.range?.startsWith("bytes=")) {
                            if (status === undefined) {
                                status = 206;
                            }

                            let [start, end] = headers.range.substring(6).split("-", 2).map(string => {
                                return Number(string);
                            });
                            if (end === 0) {
                                end = Math.min(start + 10 ** 6, stats.size - 1);
                            }
                            let length = end - start + 1;

                            stream.respondWithFile(absolutePath, {
                                ":status": status,
                                "cache-control": getCacheControl(absolutePath),
                                "x-content-type-options": "nosniff",
                                "content-type": getContentType(absolutePath),
                                "content-range": `bytes ${start}-${end}/${stats.size}`,
                                "content-length": length,
                                "accept-ranges": "bytes",
                                ...(cookie !== undefined && {
                                    "set-cookie": Object.entries(cookie).map(array => {
                                        return array.join("=");
                                    })
                                })
                            }, {
                                offset: start,
                                length
                            });

                            stream.on("finish", () => {
                                resolve(status);
                            });
                        } else {
                            if (status === undefined) {
                                status = 200;
                            }

                            stream.respondWithFile(absolutePath, {
                                ":status": status,
                                "cache-control": getCacheControl(absolutePath),
                                "x-content-type-options": "nosniff",
                                "content-type": getContentType(absolutePath),
                                ...(cookie !== undefined && {
                                    "set-cookie": Object.entries(cookie).map(array => {
                                        return array.join("=");
                                    })
                                })
                            });

                            stream.on("finish", () => {
                                resolve(status);
                            });
                        }
                    }
                } else if (stats.isDirectory()) {
                    reject(308);
                } else {
                    reject(403);
                }
            }).catch(() => {
                reject(404);
            });
        });
    };

    let sendData = ({ data, contentType = "text/plain; charset=utf-8", cacheControl = "no-cache", status, cookie }) => {
        return new Promise(resolve => {
            if (status === undefined) {
                if (data === undefined) {
                    status = 204;
                } else {
                    status = 200;
                }
            }

            if (stream.destroyed) {
                resolve(499); // resolves as no further action is required
            } else {
                stream.respond({
                    ":status": status,
                    ...(data !== undefined && {
                        "cache-control": cacheControl,
                        "x-content-type-options": "nosniff",
                        "content-type": contentType
                    }),
                    ...(cookie !== undefined && {
                        "set-cookie": Object.entries(cookie).map(array => {
                            return array.join("=");
                        })
                    })
                });

                if (data) {
                    stream.write(data);
                }

                stream.end();

                stream.on("finish", () => {
                    resolve(status);
                });
            }
        });
    };

    let sendHref = ({ href, status = 308, cookie }) => {
        return new Promise(resolve => {
            if (stream.destroyed) {
                resolve(499); // resolves as no further action is required
            } else {
                stream.respond({
                    ":status": status,
                    "location": href,
                    ...(cookie !== undefined && {
                        "set-cookie": Object.entries(cookie).map(array => {
                            return array.join("=");
                        })
                    })
                });

                stream.end();

                stream.on("finish", () => {
                    resolve(status);
                });
            }
        });
    };

    await main({
        method,
        path,
        search,
        params,
        cookie,
        body,
        sendFile,
        sendData,
        sendHref
    });
});

server.listen(env.secure ? 443 : env.port);
