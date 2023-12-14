/**
 * @typedef ServerHttp2PrivateWritableStream
 * @property {() => boolean} isEndedOrDuplexDestroyed - no more interactions with WRITABLE stream
 * @property {() => "success" | "failed-destroyed" | "failed-writable-ended" | "failed-headers-not-sent"} endAndDestroyDuplex
 * @property {(outgoingHttpHeaders: import("node:http2").OutgoingHttpHeaders) => "success" | "failed-destroyed" | "failed-writable-ended" | "failed-headers-sent"} respond
 * @property {(chunk: string | Buffer) => "success" | "success-drain" | "failed-destroyed" | "failed-writable-ended" | "failed-headers-not-sent"} write
 * @property {(callback: () => undefined) => "success" | "failed-destroyed"} onDuplexDestroy - no further event will be fired & fires always
 * @property {(callback: () => undefined) => "success" | "failed-destroyed" | "failed-writable-ended"} onceDrain
 */

/**
 * @param {import("node:http2").ServerHttp2Stream} serverHttp2Stream
 * @param {import("../utilities.1.0.0/create-log-error.1.0.0.mjs").LogError} logError
 * @returns {ServerHttp2PrivateWritableStream}
 */
export let getServerHttp2PrivateWritableStream = (serverHttp2Stream, logError) => {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    serverHttp2Stream.on("error", (error) => {
        if (serverHttp2Stream.destroyed === false) {
            serverHttp2Stream.destroy();
        }

        logError(error.message, {
            logLevel: 0.45
        });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    let isEndedOrDuplexDestroyed = () => {
        return serverHttp2Stream.destroyed || serverHttp2Stream.writableEnded;
    };

    /** @returns {"success" | "failed-destroyed" | "failed-writable-ended" | "failed-headers-not-sent"} */
    let endAndDestroyDuplex = () => {
        if (serverHttp2Stream.destroyed === true) {
            logError("serverHttp2Stream got destroyed.", {
                logLevel: 0.25
            });
            return "failed-destroyed";
        }

        if (serverHttp2Stream.writableEnded === true) {
            logError("serverHttp2Stream writable ended.", {
                logLevel: 0.75
            });
            return "failed-writable-ended";
        }

        if (serverHttp2Stream.headersSent === false) {
            logError("serverHttp2Stream headers are not sent.", {
                logLevel: 0.75
            });
            return "failed-headers-not-sent";
        }

        serverHttp2Stream.end();

        setTimeout(() => {
            if (serverHttp2Stream.destroyed === false) {
                serverHttp2Stream.destroy();

                logError("serverHttp2Stream now got destroyed but end has not destroyed it for 20 seconds.", {
                    logLevel: 0.8
                });
            }
        }, 20_000);

        return "success";
    };

    /** @param {import("node:http2").OutgoingHttpHeaders} outgoingHttpHeaders @returns {"success" | "failed-destroyed" | "failed-writable-ended" | "failed-headers-sent"} */
    let respond = (outgoingHttpHeaders) => {
        if (serverHttp2Stream.destroyed === true) {
            logError("serverHttp2Stream got destroyed.", {
                logLevel: 0.23
            });
            return "failed-destroyed";
        }

        if (serverHttp2Stream.writableEnded === true) {
            logError("serverHttp2Stream writable ended.", {
                logLevel: 0.75
            });
            return "failed-writable-ended";
        }

        if (serverHttp2Stream.headersSent === true) {
            logError("serverHttp2Stream headers are already sent.", {
                logLevel: 0.75
            });
            return "failed-headers-sent";
        }

        serverHttp2Stream.respond(outgoingHttpHeaders);
        return "success";
    };

    /** @param {string | Buffer} chunk @returns {"success" | "success-drain" | "failed-destroyed" | "failed-writable-ended" | "failed-headers-not-sent"} */
    let write = (chunk) => {
        if (serverHttp2Stream.destroyed === true) {
            logError("serverHttp2Stream got destroyed.", {
                logLevel: 0.23
            });
            return "failed-destroyed";
        }

        if (serverHttp2Stream.writableEnded === true) {
            logError("serverHttp2Stream writable ended.", {
                logLevel: 0.75
            });
            return "failed-writable-ended";
        }

        if (serverHttp2Stream.headersSent === false) {
            logError("serverHttp2Stream headers are not sent.", {
                logLevel: 0.75
            });
            return "failed-headers-not-sent";
        }

        if (serverHttp2Stream.write(chunk)) {
            return "success";
        } else {
            return "success-drain";
        }
    };

    /** @param {() => undefined} callback @returns {"success" | "failed-destroyed"} */
    let onDuplexDestroy = (callback) => {
        if (serverHttp2Stream.destroyed === true) {
            logError("serverHttp2Stream got destroyed.", {
                logLevel: 0.25
            });
            return "failed-destroyed";
        }

        serverHttp2Stream.on("close", callback);
        return "success";
    };

    /** @param {() => undefined} callback @returns {"success" | "failed-destroyed" | "failed-writable-ended"} */
    let onceDrain = (callback) => {
        if (serverHttp2Stream.destroyed === true) {
            logError("serverHttp2Stream got destroyed.", {
                logLevel: 0.25
            });
            return "failed-destroyed";
        }

        if (serverHttp2Stream.writableEnded === true) {
            logError("serverHttp2Stream writable ended.", {
                logLevel: 0.75
            });
            return "failed-writable-ended";
        }

        serverHttp2Stream.once("drain", callback);
        return "success";
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    return {
        isEndedOrDuplexDestroyed: isEndedOrDuplexDestroyed,
        endAndDestroyDuplex: endAndDestroyDuplex,
        respond: respond,
        write: write,
        onDuplexDestroy: onDuplexDestroy,
        onceDrain: onceDrain
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
};
