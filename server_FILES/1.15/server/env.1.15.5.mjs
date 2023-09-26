// create __filename variable in module
let { fileURLToPath, pathToFileURL } = await import("node:url"); // use pathToFileURL for dynamic import
let __filename = fileURLToPath(import.meta.url);

// create __dirname variable in module
let { dirname, join } = await import("node:path");
let __dirname = dirname(__filename);

// let { x, y, z } = await import(pathToFileURL(join(__dirname, "..", "dir", "file.mjs")).href); // import x, y, z from "../dir/file.mjs"
// let stats = stat(join(__dirname, "..", "dir", "file.ext")); // get stats from "../dir/file.ext"

export let env = {
    secure: true,
    // if (secure)
    cert: join(__dirname, "localhost.crt"),
    key: join(__dirname, "localhost.key"),
    // if (!secure)
    port: 8080
};
