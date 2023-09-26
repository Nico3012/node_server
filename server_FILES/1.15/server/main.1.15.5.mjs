// create __filename variable in module
let { fileURLToPath, pathToFileURL } = await import("node:url"); // use pathToFileURL for dynamic import
let __filename = fileURLToPath(import.meta.url);

// create __dirname variable in module
let { dirname, join } = await import("node:path");
let __dirname = dirname(__filename);

// let { x, y, z } = await import(pathToFileURL(join(__dirname, "..", "dir", "file.mjs")).href); // import x, y, z from "../dir/file.mjs"
// let stats = stat(join(__dirname, "..", "dir", "file.ext")); // get stats from "../dir/file.ext"

export let main = async connection => { // connection: { method, path, search, params, body, cookie, sendFile, sendData, sendHref }
    try {
        await connection.sendFile({
            path: connection.path
        });
    } catch (status) { // status ∈ { 308, 403, 404 }
        if (status === 308) {
            await connection.sendHref({
                href: `${connection.path}/${connection.search}`
            });
        } else {
            await connection.sendData({
                data: `Error ${status}`,
                status
            });
        }
    }
};

// let status = await connection.sendFile({
//     path: "/index.html", // becomes `${__dirname}/app/index.html`
//     status?: 200, // headers.range ? 206 : 200
//     cookie?: {
//         key: "value; HttpOnly; Secure"
//     }
// });

// let status = await connection.sendData({
//     data?: "Hello World!",
//     contentType?: "text/plain; charset=utf-8",
//     cacheControl?: "no-cache",
//     status?: 200, // data ? 200 : 204
//     cookie?: {
//         key: "value; HttpOnly; Secure"
//     }
// });

// let status = await connection.sendHref({
//     href: "/directory/?key=value",
//     status?: 308,
//     cookie?: {
//         key: "value; HttpOnly; Secure"
//     }
// });
