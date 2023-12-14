import { createSecureServer } from "node:http2";
import { readFile } from "node:fs/promises";
import { getServerHttp2PrivateReadableStream } from "./get-server-http2-private-readable-stream.1.19.3.mjs";
import { getServerHttp2PrivateWritableStream } from "./get-server-http2-private-writable-stream.1.19.3.mjs";
import { getHttp2ReadableConnection } from "./get-http2-readable-connection.1.19.3.mjs";
import { getHttp2WritableConnection } from "./get-http2-writable-connection.1.19.3.mjs";

/**
 * @typedef Http2SecureServerOptions
 * @property {string} joinedAbsoluteCertPathname
 * @property {string} joinedAbsoluteKeyPathname
 */

/** @param {import("./create-http2-server.1.19.3.mjs").HandleHttp2Connection} handleHttp2Connection @param {import("../utilities.1.0.0/create-log-error.1.0.0.mjs").LogError} logError @param {Http2SecureServerOptions} http2SecureServerOptions @param {number} port @returns {Promise<undefined>} */
export let createHttp2SecureServer = async (handleHttp2Connection, logError, http2SecureServerOptions, port) => {
    let http2SecureServer = createSecureServer({
        cert: await readFile(http2SecureServerOptions.joinedAbsoluteCertPathname),
        key: await readFile(http2SecureServerOptions.joinedAbsoluteKeyPathname)
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    http2SecureServer.on("sessionError", /** @param {Error} error @param {import("node:http2").ServerHttp2Session} serverHttp2Session */(error, serverHttp2Session) => {
        if (serverHttp2Session.destroyed === false) {
            serverHttp2Session.destroy();
        }

        logError(error.message, {
            logLevel: 0.25
        });
    });

    // @ts-ignore // error is not needed but must be listed to get tlsSocket variable in function
    http2SecureServer.on("tlsClientError", /** @param {Error} error @param {import("node:tls").TLSSocket} tlsSocket */(error, tlsSocket) => {
        if (tlsSocket.destroyed === false) {
            tlsSocket.destroy();
        }

        logError("tlsClientError: tlsSocket got destroyed now.", {
            logLevel: 0.2
        });
    });

    http2SecureServer.on("error", /** @param {Error} error */(error) => {
        logError(error.message, {
            logLevel: 0.25
        });
    });

    http2SecureServer.on("connection", /** @param {import("node:net").Socket} socket */(socket) => {
        socket.on("error", /** @param {Error} error */(error) => {
            if (socket.destroyed === false) {
                socket.destroy();
            }

            logError(error.message, {
                logLevel: 0.25
            });
        });
    });

    http2SecureServer.on("secureConnection", /** @param {import("node:tls").TLSSocket} tlsSocket */(tlsSocket) => {
        tlsSocket.on("error", /** @param {Error} error */(error) => {
            if (tlsSocket.destroyed === false) {
                tlsSocket.destroy();
            }

            logError(error.message, {
                logLevel: 0.25
            });
        });
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    http2SecureServer.on("stream", async (serverHttp2Stream, incomingHttpHeaders) => {
        let serverHttp2PrivateReadableStream = getServerHttp2PrivateReadableStream(serverHttp2Stream, logError);
        let serverHttp2PrivateWritableStream = getServerHttp2PrivateWritableStream(serverHttp2Stream, logError);

        let http2ReadableConnection = getHttp2ReadableConnection(serverHttp2PrivateReadableStream, incomingHttpHeaders, logError);
        let http2WritableConnection = getHttp2WritableConnection(serverHttp2PrivateWritableStream, incomingHttpHeaders, logError);

        let timeoutWarned = false;

        let timeoutId = setTimeout(() => {
            timeoutWarned = true;

            logError("handleHttp2Connection runs now for 20 seconds. If this is not what you want, please check handleHttp2Connection.", {
                logLevel: 0.9
            });
        }, 20_000);

        serverHttp2PrivateReadableStream.onDuplexDestroy(() => {
            if (timeoutWarned === false) {
                clearTimeout(timeoutId);
            }
        });

        await handleHttp2Connection(http2ReadableConnection, http2WritableConnection);
    });

    http2SecureServer.listen(port);
};
