import { stat } from "fs/promises";
import { createPrivateReadStream } from "./create-private-read-stream.1.19.3.mjs";

/**
 * @typedef {"text/plain; charset=utf-8" | "text/html; charset=utf-8" | "text/css; charset=utf-8" | "text/javascript; charset=utf-8" | "application/json; charset=utf-8" | "application/manifest+json; charset=utf-8" | "application/wasm" | "image/png" | "video/mp4" | "application/octet-stream"} ContentTypeHeader
 */

/**
 * @typedef {"no-cache" | "max-age=31536000, immutable"} CacheControlHeader
 */

/**
 * @typedef SendFileOptions
 * @property {string} joinedAbsolutePathname
 * @property {ContentTypeHeader} [contentTypeHeader]
 * @property {CacheControlHeader} [cacheControlHeader]
 * @property {number} [status]
 * @property {{ [key: string]: string }} [cookie]
 */

/**
 * @typedef SendDataOptions
 * @property {string | Buffer} data
 * @property {ContentTypeHeader} [contentTypeHeader]
 * @property {CacheControlHeader} [cacheControlHeader]
 * @property {number} [status]
 * @property {{[key: string]: string}} [cookie]
 */

/**
 * @typedef SendHrefOptions
 * @property {string} href
 * @property {number} [status]
 * @property {{[key: string]: string}} [cookie]
 */

/**
 * @typedef Http2WritableConnection
 * @property {(sendFileOptions: SendFileOptions) => Promise<"success" | "failed-no-further-action" | "failed-directory" | "failed-unknown-stats" | "failed-stats-not-found">} sendFile
 * @property {(sendDataOptions: SendDataOptions) => "success" | "failed-no-further-action"} sendData
 * @property {(sendHrefOptions: SendHrefOptions) => "success" | "failed-no-further-action"} sendHref
 */

/** @param {string} pathname @returns {CacheControlHeader} */
let getCacheControlHeader = (pathname) => {
    if (pathname.endsWith(".txt")) {
        return "no-cache";
    }
    if (pathname.endsWith(".html")) {
        return "no-cache";
    }
    if (pathname.endsWith(".css")) {
        return "max-age=31536000, immutable";
    }
    if (pathname.endsWith(".js")) {
        return "max-age=31536000, immutable";
    }
    if (pathname.endsWith(".json")) {
        return "max-age=31536000, immutable";
    }
    if (pathname.endsWith(".webmanifest")) {
        return "max-age=31536000, immutable";
    }
    if (pathname.endsWith(".wasm")) {
        return "max-age=31536000, immutable";
    }
    if (pathname.endsWith(".png")) {
        return "max-age=31536000, immutable";
    }
    if (pathname.endsWith(".mp4")) {
        return "max-age=31536000, immutable";
    }
    return "no-cache";
};

/** @param {string} pathname @returns {ContentTypeHeader} */
let getContentTypeHeader = (pathname) => {
    if (pathname.endsWith(".txt")) {
        return "text/plain; charset=utf-8";
    }
    if (pathname.endsWith(".html")) {
        return "text/html; charset=utf-8";
    }
    if (pathname.endsWith(".css")) {
        return "text/css; charset=utf-8";
    }
    if (pathname.endsWith(".js")) {
        return "text/javascript; charset=utf-8";
    }
    if (pathname.endsWith(".json")) {
        return "application/json; charset=utf-8";
    }
    if (pathname.endsWith(".webmanifest")) {
        return "application/manifest+json; charset=utf-8";
    }
    if (pathname.endsWith(".wasm")) {
        return "application/wasm";
    }
    if (pathname.endsWith(".png")) {
        return "image/png";
    }
    if (pathname.endsWith(".mp4")) {
        return "video/mp4";
    }
    return "application/octet-stream";
};

/** @param {import("./create-private-read-stream.1.19.3.mjs").PrivateReadStream} privateReadStream @param {import("./get-server-http2-private-writable-stream.1.19.3.mjs").ServerHttp2PrivateWritableStream} serverHttp2PrivateWritableStream @param {import("../utilities.1.0.0/create-log-error.1.0.0.mjs").LogError} logError @returns {Promise<"success" | "failed-no-further-action" | "failed-headers-not-sent">} */
let pipePrivateStreams = (privateReadStream, serverHttp2PrivateWritableStream, logError) => {
    return new Promise((resolve) => {
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        let resolved = false;

        // status not needed because result is optional
        privateReadStream.onData((chunk) => {
            if (resolved === false) {
                let writeStatus = serverHttp2PrivateWritableStream.write(chunk);

                if (writeStatus === "failed-destroyed" || writeStatus === "failed-writable-ended") {
                    // cannot be destroyed while sending data
                    privateReadStream.destroy();

                    resolved = true;
                    resolve("failed-no-further-action");
                } else if (writeStatus === "failed-headers-not-sent") {
                    // cannot be destroyed while sending data
                    privateReadStream.destroy();

                    resolved = true;
                    resolve("failed-headers-not-sent");
                } else if (writeStatus === "success-drain") {
                    // cannot be ended or destroyed while sending data
                    privateReadStream.pause();

                    serverHttp2PrivateWritableStream.onceDrain(() => {
                        // only appears once. Failed will be handled elsewere
                        privateReadStream.resume();
                    });
                }
            }
        });

        // status not needed because result is optional
        privateReadStream.onEnd(() => {
            if (resolved === false) {
                let endStatus = serverHttp2PrivateWritableStream.endAndDestroyDuplex();

                if (endStatus === "failed-destroyed" || endStatus === "failed-writable-ended") {
                    // cannot be destroyed while sending data
                    privateReadStream.destroy();

                    resolved = true;
                    resolve("failed-no-further-action");
                } else if (endStatus === "failed-headers-not-sent") {
                    // cannot be destroyed while sending data
                    privateReadStream.destroy();

                    resolved = true;
                    resolve("failed-headers-not-sent");
                } else {
                    resolved = true;
                    resolve("success");
                }
            }
        });

        privateReadStream.onDestroy(() => {
            if (resolved === false) {
                if (serverHttp2PrivateWritableStream.isEndedOrDuplexDestroyed() === false) {
                    serverHttp2PrivateWritableStream.endAndDestroyDuplex();
                }

                logError("privateReadStream got destoryed before it ended.", {
                    logLevel: 0.65
                });

                resolved = true;
                resolve("failed-no-further-action");
            }
        });

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    });
};

/**
 * @param {import("./get-server-http2-private-writable-stream.1.19.3.mjs").ServerHttp2PrivateWritableStream} serverHttp2PrivateWritableStream
 * @param {import("node:http2").IncomingHttpHeaders} incomingHttpHeaders
 * @param {import("../utilities.1.0.0/create-log-error.1.0.0.mjs").LogError} logError
 * @returns {Http2WritableConnection}
 */
export let getHttp2WritableConnection = (serverHttp2PrivateWritableStream, incomingHttpHeaders, logError) => {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @param {SendFileOptions} sendFileOptions
     * @returns {Promise<"success" | "failed-no-further-action" | "failed-directory" | "failed-unknown-stats" | "failed-stats-not-found">}
     */
    let sendFile = (sendFileOptions) => {
        return new Promise(async (resolve) => {
            try {
                let stats = await stat(sendFileOptions.joinedAbsolutePathname);

                if (stats.isFile()) {
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                    let status = sendFileOptions.status;

                    let contentTypeHeader = sendFileOptions.contentTypeHeader;

                    if (contentTypeHeader === undefined) {
                        contentTypeHeader = getContentTypeHeader(sendFileOptions.joinedAbsolutePathname);
                    }

                    let cacheControlHeader = sendFileOptions.cacheControlHeader;

                    if (cacheControlHeader === undefined) {
                        cacheControlHeader = getCacheControlHeader(sendFileOptions.joinedAbsolutePathname);
                    }

                    /** @type {import("node:http2").OutgoingHttpHeaders} */
                    let outgoingHttpHeaders = {
                        "x-content-type-options": "nosniff",
                        "cache-control": cacheControlHeader,
                        "content-type": contentTypeHeader,
                    };

                    if (sendFileOptions.cookie !== undefined) {
                        outgoingHttpHeaders["set-cookie"] = Object.entries(sendFileOptions.cookie).map((keyValueArray) => {
                            return keyValueArray.join("=");
                        });
                    }

                    if (incomingHttpHeaders.range !== undefined && incomingHttpHeaders.range.startsWith("bytes=")) {
                        if (status === undefined) {
                            status = 206;
                        }

                        let startEndArray = incomingHttpHeaders.range.substring(6).split("-", 2);

                        let start;
                        let end;

                        if (startEndArray[0] !== undefined) {
                            start = parseInt(startEndArray[0]);

                            if (isNaN(start)) {
                                start = 0;
                            }
                        } else {
                            start = 0;
                        }

                        if (startEndArray[1] !== undefined) {
                            end = parseInt(startEndArray[1]);

                            if (isNaN(end)) {
                                end = 0;
                            }
                        } else {
                            end = 0;
                        }

                        if (end === 0) {
                            end = Math.min(start + 10 ** 6, stats.size - 1);
                        }

                        let length = end - start + 1;

                        outgoingHttpHeaders[":status"] = status;
                        outgoingHttpHeaders["content-range"] = `bytes ${start}-${end}/${stats.size}`;
                        outgoingHttpHeaders["content-length"] = length;
                        outgoingHttpHeaders["accept-ranges"] = "bytes";

                        let respondStatus = serverHttp2PrivateWritableStream.respond(outgoingHttpHeaders);

                        if (respondStatus === "failed-destroyed" || respondStatus === "failed-writable-ended") {
                            resolve("failed-no-further-action");
                        } else {
                            let privateReadStream = createPrivateReadStream({
                                joinedAbsolutePathname: sendFileOptions.joinedAbsolutePathname,
                                start: start,
                                end: end
                            }, logError);

                            // pipePrivateStreamsStatus cannot be "failed-headers-not-sent" because headers are definentally sent above
                            let pipePrivateStreamsStatus = await pipePrivateStreams(privateReadStream, serverHttp2PrivateWritableStream, logError);

                            if (pipePrivateStreamsStatus === "success") {
                                resolve("success");
                            } else {
                                resolve("failed-no-further-action");
                            }
                        }
                    } else {
                        if (status === undefined) {
                            status = 200;
                        }

                        outgoingHttpHeaders[":status"] = status;

                        let respondStatus = serverHttp2PrivateWritableStream.respond(outgoingHttpHeaders);

                        if (respondStatus === "failed-destroyed" || respondStatus === "failed-writable-ended") {
                            resolve("failed-no-further-action");
                        } else {
                            let privateReadStream = createPrivateReadStream({
                                joinedAbsolutePathname: sendFileOptions.joinedAbsolutePathname
                            }, logError);

                            // pipePrivateStreamsStatus cannot be "failed-headers-not-sent" because headers are definentally sent above
                            let pipePrivateStreamsStatus = await pipePrivateStreams(privateReadStream, serverHttp2PrivateWritableStream, logError);

                            if (pipePrivateStreamsStatus === "success") {
                                resolve("success");
                            } else {
                                resolve("failed-no-further-action");
                            }
                        }
                    }

                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                } else if (stats.isDirectory()) {
                    resolve("failed-directory");
                } else {
                    logError("stats is no file or directory.", {
                        logLevel: 0.35
                    });
                    resolve("failed-unknown-stats");
                }
            } catch (error) {
                if (error !== null && typeof error === "object") { // @ts-ignore // if "code" not in error, error.code !== "ENOENT" will not be executed. Therefore this only gets executed if "code" is in error, wich is fine.
                    if (("code" in error) === false || error.code !== "ENOENT") {
                        if ("message" in error && typeof error.message === "string") {
                            logError(error.message, {
                                logLevel: 0.35
                            });
                        } else {
                            logError("cannot find message of type string in error.", {
                                logLevel: 0.35
                            });
                        }
                    }
                } else {
                    logError("error is not an object.", {
                        logLevel: 0.35
                    });
                }

                resolve("failed-stats-not-found");
            }
        });
    };

    /**
     * @param {SendDataOptions} sendDataOptions
     * @returns {"success" | "failed-no-further-action"}
     */
    let sendData = (sendDataOptions) => {
        let status = sendDataOptions.status;

        if (status === undefined) {
            status = 200;
        }

        let contentTypeHeader = sendDataOptions.contentTypeHeader;

        if (contentTypeHeader === undefined) {
            contentTypeHeader = "text/plain; charset=utf-8";
        }

        let cacheControlHeader = sendDataOptions.cacheControlHeader;

        if (cacheControlHeader === undefined) {
            cacheControlHeader = "no-cache";
        }

        /** @type {import("node:http2").OutgoingHttpHeaders} */
        let outgoingHttpHeaders = {
            ":status": status,
            "cache-control": cacheControlHeader,
            "x-content-type-options": "nosniff",
            "content-type": contentTypeHeader
        };

        if (sendDataOptions.cookie !== undefined) {
            outgoingHttpHeaders["set-cookie"] = Object.entries(sendDataOptions.cookie).map((keyValueArray) => {
                return keyValueArray.join("=");
            });
        }

        let respondStatus = serverHttp2PrivateWritableStream.respond(outgoingHttpHeaders);

        if (respondStatus === "failed-destroyed" || respondStatus === "failed-writable-ended") {
            return "failed-no-further-action";
        }

        // writeStatus cannot be "failed-headers-not-sent" because headers are definentally sent above
        let writeStatus = serverHttp2PrivateWritableStream.write(sendDataOptions.data);

        if (writeStatus === "failed-destroyed" || writeStatus === "failed-writable-ended") {
            return "failed-no-further-action";
        }

        // endStatus cannot be "failed-headers-not-sent" because headers are definentally sent above
        let endStatus = serverHttp2PrivateWritableStream.endAndDestroyDuplex();

        if (endStatus === "failed-destroyed" || endStatus === "failed-writable-ended") {
            return "failed-no-further-action";
        }

        return "success";
    };

    /**
     * @param {SendHrefOptions} sendHrefOptions
     * @returns {"success" | "failed-no-further-action"}
     */
    let sendHref = (sendHrefOptions) => {
        let status = sendHrefOptions.status;

        if (status === undefined) {
            status = 307;
        }

        /** @type {import("node:http2").OutgoingHttpHeaders} */
        let outgoingHttpHeaders = {
            ":status": status,
            "location": sendHrefOptions.href
        };

        if (sendHrefOptions.cookie !== undefined) {
            outgoingHttpHeaders["set-cookie"] = Object.entries(sendHrefOptions.cookie).map((keyValueArray) => {
                return keyValueArray.join("=");
            });
        }

        let respondStatus = serverHttp2PrivateWritableStream.respond(outgoingHttpHeaders);

        if (respondStatus === "failed-destroyed" || respondStatus === "failed-writable-ended") {
            return "failed-no-further-action";
        }

        // endStatus cannot be "failed-headers-not-sent" because headers are definentally sent above
        let endStatus = serverHttp2PrivateWritableStream.endAndDestroyDuplex();

        if (endStatus === "failed-destroyed" || endStatus === "failed-writable-ended") {
            return "failed-no-further-action";
        }

        return "success";
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    return {
        sendFile: sendFile,
        sendData: sendData,
        sendHref: sendHref
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
};
