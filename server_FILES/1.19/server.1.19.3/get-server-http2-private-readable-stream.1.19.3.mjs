/**
 * @typedef ServerHttp2PrivateReadableStream
 * @property {() => "success" | "failed-destroyed" | "failed-readable-ended" | "failed-paused"} pause
 * @property {() => "success" | "failed-destroyed" | "failed-readable-ended" | "failed-not-paused"} resume
 * @property {(encoding: "utf-8") => "success" | "failed-destroyed" | "failed-readable-ended"} setEncoding
 * @property {(callback: () => undefined) => "success" | "failed-destroyed"} onDuplexDestroy - no further event will be fired & fires always
 * @property {(callback: (chunk: string | Buffer) => undefined) => "success" | "failed-destroyed" | "failed-readable-ended"} onData
 * @property {(callback: () => undefined) => "success" | "failed-destroyed" | "failed-readable-ended"} onEnd - no more data events will be fired & does not fires always
 */

/**
 * @param {import("node:http2").ServerHttp2Stream} serverHttp2Stream
 * @param {import("../utilities.1.0.0/create-log-error.1.0.0.mjs").LogError} logError
 * @returns {ServerHttp2PrivateReadableStream}
 */
export let getServerHttp2PrivateReadableStream = (serverHttp2Stream, logError) => {
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

    let pause = () => {
        if (serverHttp2Stream.destroyed === true) {
            logError("serverHttp2Stream got destroyed.", {
                logLevel: 0.75
            });
            return "failed-destroyed";
        }

        if (serverHttp2Stream.readableEnded === true) {
            logError("serverHttp2Stream readable got ended.", {
                logLevel: 0.75
            });
            return "failed-readable-ended";
        }

        if (serverHttp2Stream.isPaused() === true) {
            logError("serverHttp2Stream is paused.", {
                logLevel: 0.75
            });
            return "failed-paused";
        }

        serverHttp2Stream.pause();
        return "success";
    };

    let resume = () => {
        if (serverHttp2Stream.destroyed === true) {
            logError("serverHttp2Stream got destroyed.", {
                logLevel: 0.75
            });
            return "failed-destroyed";
        }

        if (serverHttp2Stream.readableEnded === true) {
            logError("serverHttp2Stream readable got ended.", {
                logLevel: 0.75
            });
            return "failed-readable-ended";
        }

        if (serverHttp2Stream.isPaused() === false) {
            logError("serverHttp2Stream is not paused.", {
                logLevel: 0.75
            });
            return "failed-not-paused";
        }

        serverHttp2Stream.resume();
        return "success";
    };

    /** @param {"utf-8"} encoding @returns {"success" | "failed-destroyed" | "failed-readable-ended"} */
    let setEncoding = (encoding) => {
        if (serverHttp2Stream.destroyed === true) {
            logError("serverHttp2Stream got destroyed.", {
                logLevel: 0.75
            });
            return "failed-destroyed";
        }

        if (serverHttp2Stream.readableEnded === true) {
            logError("serverHttp2Stream readable got ended.", {
                logLevel: 0.75
            });
            return "failed-readable-ended";
        }

        serverHttp2Stream.setEncoding(encoding);
        return "success";
    };

    /** @param {() => undefined} callback @returns {"success" | "failed-destroyed"} */
    let onDuplexDestroy = (callback) => {
        if (serverHttp2Stream.destroyed === true) {
            logError("serverHttp2Stream got destroyed.", {
                logLevel: 0.75
            });
            return "failed-destroyed";
        }

        serverHttp2Stream.on("close", callback);
        return "success";
    };

    /** @param {(chunk: string | Buffer) => undefined} callback @returns {"success" | "failed-destroyed" | "failed-readable-ended"} */
    let onData = (callback) => {
        if (serverHttp2Stream.destroyed === true) {
            logError("serverHttp2Stream got destroyed.", {
                logLevel: 0.75
            });
            return "failed-destroyed";
        }

        if (serverHttp2Stream.readableEnded === true) {
            logError("serverHttp2Stream readable got ended.", {
                logLevel: 0.75
            });
            return "failed-readable-ended";
        }

        serverHttp2Stream.on("data", callback);
        return "success";
    };

    /** @param {() => undefined} callback @returns {"success" | "failed-destroyed" | "failed-readable-ended"} */
    let onEnd = (callback) => {
        if (serverHttp2Stream.destroyed === true) {
            logError("serverHttp2Stream got destroyed.", {
                logLevel: 0.75
            });
            return "failed-destroyed";
        }

        if (serverHttp2Stream.readableEnded === true) {
            logError("serverHttp2Stream readable got ended.", {
                logLevel: 0.75
            });
            return "failed-readable-ended";
        }

        serverHttp2Stream.on("end", callback);
        return "success";
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    return {
        pause: pause,
        resume: resume,
        setEncoding: setEncoding,
        onDuplexDestroy: onDuplexDestroy,
        onData: onData,
        onEnd: onEnd
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
};
