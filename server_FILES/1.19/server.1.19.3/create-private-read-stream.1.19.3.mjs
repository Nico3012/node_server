import { createReadStream } from "fs";

/**
 * @typedef PrivateReadStream
 * @property {() => boolean} isDestroyed - no more interactions with stream
 * @property {() => boolean} isEndedOrDestroyed - no more interactions with stream
 * @property {() => "success" | "failed-destroyed"} destroy
 * @property {() => "success" | "failed-destroyed" | "failed-readable-ended" | "failed-paused"} pause
 * @property {() => "success" | "failed-destroyed" | "failed-readable-ended" | "failed-not-paused"} resume
 * @property {(encoding: "utf-8") => "success" | "failed-destroyed" | "failed-readable-ended"} setEncoding
 * @property {(callback: () => undefined) => "success" | "failed-destroyed"} onDestroy - no further event will be fired & fires always
 * @property {(callback: (chunk: string | Buffer) => undefined) => "success" | "failed-destroyed" | "failed-readable-ended"} onData
 * @property {(callback: () => undefined) => "success" | "failed-destroyed" | "failed-readable-ended"} onEnd - no more data events will be fired & does not fires always
 */

/**
 * @typedef createPrivateReadStreamOptions
 * @property {string} joinedAbsolutePathname
 * @property {number} [start]
 * @property {number} [end]
 */

/**
 * @param {createPrivateReadStreamOptions} createPrivateReadStreamOptions
 * @param {import("../utilities.1.0.0/create-log-error.1.0.0.mjs").LogError} logError
 * @returns {PrivateReadStream}
 */
export let createPrivateReadStream = (createPrivateReadStreamOptions, logError) => {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /** @type {import("node:fs").ReadStream} */
    let readStream;

    if (createPrivateReadStreamOptions.start === undefined || createPrivateReadStreamOptions.end === undefined) {
        readStream = createReadStream(createPrivateReadStreamOptions.joinedAbsolutePathname);
    } else {
        readStream = createReadStream(createPrivateReadStreamOptions.joinedAbsolutePathname, {
            start: createPrivateReadStreamOptions.start,
            end: createPrivateReadStreamOptions.end
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    let isDestroyed = () => {
        return readStream.destroyed;
    };

    let isEndedOrDestroyed = () => {
        return readStream.destroyed || readStream.readableEnded;
    };

    let destroy = () => {
        if (readStream.destroyed === true) {
            logError("readStream got destroyed.", {
                logLevel: 0.75
            });
            return "failed-destroyed";
        }

        readStream.destroy();
        return "success";
    };

    let pause = () => {
        if (readStream.destroyed === true) {
            logError("readStream got destroyed.", {
                logLevel: 0.75
            });
            return "failed-destroyed";
        }

        if (readStream.readableEnded === true) {
            logError("readStream readable ended.", {
                logLevel: 0.75
            });
            return "failed-readable-ended";
        }

        if (readStream.isPaused() === true) {
            logError("readStream is paused.", {
                logLevel: 0.75
            });
            return "failed-paused";
        }

        readStream.pause();
        return "success";
    };

    let resume = () => {
        if (readStream.destroyed === true) {
            logError("readStream got destroyed.", {
                logLevel: 0.75
            });
            return "failed-destroyed";
        }

        if (readStream.readableEnded === true) {
            logError("readStream readable ended.", {
                logLevel: 0.75
            });
            return "failed-readable-ended";
        }

        if (readStream.isPaused() === false) {
            logError("readStream is not paused.", {
                logLevel: 0.75
            });
            return "failed-not-paused";
        }

        readStream.resume();
        return "success";
    };

    /** @param {"utf-8"} encoding @returns {"success" | "failed-destroyed" | "failed-readable-ended"} */
    let setEncoding = (encoding) => {
        if (readStream.destroyed === true) {
            logError("readStream got destroyed.", {
                logLevel: 0.75
            });
            return "failed-destroyed";
        }

        if (readStream.readableEnded === true) {
            logError("readStream readable ended.", {
                logLevel: 0.75
            });
            return "failed-readable-ended";
        }

        readStream.setEncoding(encoding);
        return "success";
    };

    /** @param {() => undefined} callback @returns {"success" | "failed-destroyed"} */
    let onDestroy = (callback) => {
        if (readStream.destroyed === true) {
            logError("readStream got destroyed.", {
                logLevel: 0.75
            });
            return "failed-destroyed";
        }

        readStream.on("close", callback);
        return "success";
    };

    /** @param {(chunk: string | Buffer) => undefined} callback @returns {"success" | "failed-destroyed" | "failed-readable-ended"} */
    let onData = (callback) => {
        if (readStream.destroyed === true) {
            logError("readStream got destroyed.", {
                logLevel: 0.75
            });
            return "failed-destroyed";
        }

        if (readStream.readableEnded === true) {
            logError("readStream readable ended.", {
                logLevel: 0.75
            });
            return "failed-readable-ended";
        }

        readStream.on("data", callback);
        return "success";
    };

    /** @param {() => undefined} callback @returns {"success" | "failed-destroyed" | "failed-readable-ended"} */
    let onEnd = (callback) => {
        if (readStream.destroyed === true) {
            logError("readStream got destroyed.", {
                logLevel: 0.75
            });
            return "failed-destroyed";
        }

        if (readStream.readableEnded === true) {
            logError("readStream readable ended.", {
                logLevel: 0.75
            });
            return "failed-readable-ended";
        }

        readStream.on("end", callback);
        return "success";
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    return {
        isDestroyed: isDestroyed,
        isEndedOrDestroyed: isEndedOrDestroyed,
        destroy: destroy,
        pause: pause,
        resume: resume,
        setEncoding: setEncoding,
        onDestroy: onDestroy,
        onData: onData,
        onEnd: onEnd
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
};
