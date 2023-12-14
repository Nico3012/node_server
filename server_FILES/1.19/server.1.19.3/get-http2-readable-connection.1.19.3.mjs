/**
 * @typedef Http2ReadableConnection
 * @property {string} method
 * @property {string} pathname
 * @property {string} search
 * @property {{ [key: string]: string }} searchParams
 * @property {{ [key: string]: string }} cookie
 * @property {Promise<string>} body
 */

/**
 * @param {import("./get-server-http2-private-readable-stream.1.19.3.mjs").ServerHttp2PrivateReadableStream} serverHttp2PrivateReadableStream
 * @param {import("node:http2").IncomingHttpHeaders} incomingHttpHeaders
 * @param {import("../utilities.1.0.0/create-log-error.1.0.0.mjs").LogError} logError
 * @returns {Http2ReadableConnection}
 */
export let getHttp2ReadableConnection = (serverHttp2PrivateReadableStream, incomingHttpHeaders, logError) => {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /** @type {string} */
    let method;
    if (incomingHttpHeaders[":method"] !== undefined) {
        method = incomingHttpHeaders[":method"];
    } else {
        method = "GET";
    }

    /** @type {string[]} */
    let pathArray;
    if (incomingHttpHeaders[":path"] !== undefined) {
        pathArray = incomingHttpHeaders[":path"].split(/(?=\?)/, 2);
    } else {
        pathArray = [];
    }

    /** @type {string} */
    let pathname;
    if (pathArray[0] !== undefined) {
        pathname = pathArray[0];

        if (pathname.includes("..")) {
            pathname = pathname.replaceAll("..", ".");
        }
        if (pathname.endsWith("/")) {
            pathname += "index.html";
        }
    } else {
        pathname = "/index.html";
    }

    /** @type {string} */
    let search;
    if (pathArray[1] !== undefined) {
        search = pathArray[1];
    } else {
        search = "";
    }

    /** @type {{[key: string]: string}} */
    let searchParams = Object.fromEntries(new URLSearchParams(search));

    /** @type {{[key: string]: string}} */
    let cookie = {};
    if (incomingHttpHeaders.cookie !== undefined) {
        cookie = Object.fromEntries(incomingHttpHeaders.cookie.split("; ").map((keyValue) => {
            return keyValue.split("=");
        }));
    }

    /** @type {Promise<string>} */
    let body = new Promise((resolve) => {
        let data = "";

        // status not needed because result is optional
        serverHttp2PrivateReadableStream.setEncoding("utf-8");

        // status not needed because result is optional
        serverHttp2PrivateReadableStream.onData((chunk) => {
            if (typeof chunk === "string") {
                data += chunk;
            }
        });

        let resolved = false;

        // status not needed because result is optional
        serverHttp2PrivateReadableStream.onEnd(() => {
            resolved = true;
            resolve(data);
        });

        let onDuplexDestroyStatus = serverHttp2PrivateReadableStream.onDuplexDestroy(() => {
            if (resolved === false) {
                logError("serverHttp2PrivateReadableStream duplex got destroyed before readable ended.", {
                    logLevel: 0.5
                });

                resolve(data);
            }
        });

        if (onDuplexDestroyStatus !== "success") {
            logError("serverHttp2PrivateReadableStream duplex got destroyed immediately.", {
                logLevel: 0.8
            });

            resolve(data);
        }
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    return {
        method: method,
        pathname: pathname,
        search: search,
        searchParams: searchParams,
        cookie: cookie,
        body: body
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
};
