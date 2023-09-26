import env from "./env_1.12.1.mjs";
import http2 from "node:http2";
import fs from "node:fs";

let server = http2.createSecureServer({
    cert: await fs.promises.readFile(env.cert),
    key: await fs.promises.readFile(env.key)
});

let clients = Object.fromEntries(Object.entries(env.entries).map(([authority, address]) => {
    let client = http2.connect(`http://${address}`);
    client.on("error", error => console.log(error.message));

    return [authority, client];
}));

let respondWithError = (stream, status, message) => {
    stream.respond({
        ":status": status,
        "content-type": "text/plain; charset=utf-8"
    });
    stream.end(`Error ${status}: ${message}`);
};

server.on("error", error => console.log(error.message));

server.on("stream", (stream, headers) => {
    let authority = headers[":authority"];

    let client = clients[authority];

    if (client) {
        if (client.destroyed || client.closed) {
            client = clients[authority] = http2.connect(`http://${env.entries[authority]}`);
            client.on("error", error => console.log(error.message));
        }

        let request = client.request(headers);
        stream.pipe(request);

        request.on("error", error => respondWithError(stream, 500, error.message));

        request.on("response", headers => stream.respond(headers));
        request.pipe(stream);
    } else
        respondWithError(stream, 404, `Authority ${authority} is not available`);
});

server.listen(443);
