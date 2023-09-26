// create __filename variable in module
let { fileURLToPath, pathToFileURL } = await import("node:url"); // use pathToFileURL for dynamic import
let __filename = fileURLToPath(import.meta.url);

// create __dirname variable in module
let { dirname, join } = await import("node:path");
let __dirname = dirname(__filename);

// let { x, y, z } = await import(pathToFileURL(join(__dirname, "..", "dir", "file.mjs")).href); // import x, y, z from "../dir/file.mjs"
// let stats = stat(join(__dirname, "..", "dir", "file.ext")); // get stats from "../dir/file.ext"

let { createSecureServer, connect } = await import("node:http2");
let { readFile } = await import("node:fs/promises");

let { env } = await import(pathToFileURL(join(__dirname, "env.1.15.3.mjs")).href);

let respondWithError = ({ stream, status, message }) => {
    return new Promise(resolve => {
        if (stream.destroyed) {
            resolve(499); // resolves as no further action is required
        } else {
            stream.respond({
                ":status": status,
                "cache-control": "no-cache",
                "x-content-type-options": "nosniff",
                "content-type": "text/plain; charset=utf-8"
            });

            stream.write(`Error ${status}: ${message}`);

            stream.end();

            stream.on("finish", () => {
                resolve(status);
            });
        }
    });
};

let clients = Object.fromEntries(Object.entries(env.entries).map(([authority, address]) => {
    let client = connect(`http://${address}`);

    client.on("error", error => {
        console.log(error.message);
    });

    return [authority, client];
}));

let server = createSecureServer({
    cert: await readFile(env.cert),
    key: await readFile(env.key)
});

server.on("error", error => {
    console.log(error.message);
});

server.on("stream", async (stream, headers) => {
    stream.on("error", error => {
        console.log(error.message);
    });

    let authority = headers[":authority"];

    let client = clients[authority];

    if (client) {
        if (client.destroyed) {
            client = clients[authority] = connect(`http://${env.entries[authority]}`);

            client.on("error", error => {
                console.log(error.message);
            });
        }

        let request = client.request(headers);

        request.on("error", async error => {
            await respondWithError({
                stream,
                status: 500,
                message: error.message
            });
        });

        request.on("response", headers => {
            if (!stream.destroyed) {
                stream.respond(headers);

                request.pipe(stream, {
                    end: true
                }); // send data back to client
            }
        });

        stream.pipe(request, {
            end: true
        }); // send client data to server
    } else {
        await respondWithError({
            stream,
            status: 404,
            message: `Authority ${authority} is not available`
        });
    }
});

server.listen(443);
