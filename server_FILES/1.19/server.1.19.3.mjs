import { createHttp2Server } from "./server.1.19.3/create-http2-server.1.19.3.mjs";
import { handleHttp2Connection } from "./handle-http2-connection.mjs";
import { createLogError } from "./utilities.1.0.0/create-log-error.1.0.0.mjs";

let logError = createLogError(0, {
    showProtocol: false,
    hideDirectories: true
});

createHttp2Server(handleHttp2Connection, logError, 8080);
