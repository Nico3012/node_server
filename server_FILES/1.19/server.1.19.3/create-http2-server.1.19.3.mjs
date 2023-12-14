import { createServer } from "node:http2";
import { getServerHttp2PrivateReadableStream } from "./get-server-http2-private-readable-stream.1.19.3.mjs";
import { getServerHttp2PrivateWritableStream } from "./get-server-http2-private-writable-stream.1.19.3.mjs";
import { getHttp2ReadableConnection } from "./get-http2-readable-connection.1.19.3.mjs";
import { getHttp2WritableConnection } from "./get-http2-writable-connection.1.19.3.mjs";

/**
 * @callback HandleHttp2Connection
 * @param {import("./get-http2-readable-connection.1.19.3.mjs").Http2ReadableConnection} http2ReadableConnection
 * @param {import("./get-http2-writable-connection.1.19.3.mjs").Http2WritableConnection} http2WritableConnection
 * @returns {Promise<undefined>}
 */

/** @param {HandleHttp2Connection} handleHttp2Connection @param {import("../utilities.1.0.0/create-log-error.1.0.0.mjs").LogError} logError @param {number} port @returns {undefined} */
export let createHttp2Server = (handleHttp2Connection, logError, port) => {
    let http2Server = createServer();

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    http2Server.on("sessionError", /** @param {Error} error @param {import("node:http2").ServerHttp2Session} serverHttp2Session */(error, serverHttp2Session) => {
        if (serverHttp2Session.destroyed === false) {
            serverHttp2Session.destroy();
        }

        logError(error.message, {
            logLevel: 0.25
        });
    });

    http2Server.on("error", /** @param {Error} error */(error) => {
        logError(error.message, {
            logLevel: 0.25
        });
    });

    http2Server.on("connection", /** @param {import("node:net").Socket} socket */(socket) => {
        socket.on("error", /** @param {Error} error */(error) => {
            if (socket.destroyed === false) {
                socket.destroy();
            }

            logError(error.message, {
                logLevel: 0.25
            });
        });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    http2Server.on("stream", async (serverHttp2Stream, incomingHttpHeaders) => {
        let serverHttp2PrivateReadableStream = getServerHttp2PrivateReadableStream(serverHttp2Stream, logError);
        let serverHttp2PrivateWritableStream = getServerHttp2PrivateWritableStream(serverHttp2Stream, logError);

        let http2ReadableConnection = getHttp2ReadableConnection(serverHttp2PrivateReadableStream, incomingHttpHeaders, logError);
        let http2WritableConnection = getHttp2WritableConnection(serverHttp2PrivateWritableStream, incomingHttpHeaders, logError);

        let timeoutWarned = false;

        let timeoutId = setTimeout(() => {
            timeoutWarned = true;

            logError("handleHttp2Connection runs now for 20 seconds. If this is not what you want, please check handleHttp2Connection.", {
                logLevel: 0.25
            });
        }, 20_000);

        serverHttp2PrivateReadableStream.onDuplexDestroy(() => {
            if (timeoutWarned === false) {
                clearTimeout(timeoutId);
            }
        });

        await handleHttp2Connection(http2ReadableConnection, http2WritableConnection);
    });

    http2Server.listen(port);
};
