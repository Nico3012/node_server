import { createHttp2SecureServer } from "./server.1.19.3/create-http2-secure-server.1.19.3.mjs";
import { handleHttp2Connection } from "./handle-http2-connection.mjs";
import { createGetJoinedAbsolutePathname } from "./utilities.1.0.0/create-get-joined-absolute-pathname.1.0.0.mjs";
import { createLogError } from "./utilities.1.0.0/create-log-error.1.0.0.mjs";

let logError = createLogError(0, {
    showProtocol: false,
    hideDirectories: true
}); // 0.24

let getJoinedAbsolutePathname = createGetJoinedAbsolutePathname(import.meta.url);

createHttp2SecureServer(handleHttp2Connection, logError, {
    joinedAbsoluteCertPathname: getJoinedAbsolutePathname("localhost.crt"),
    joinedAbsoluteKeyPathname: getJoinedAbsolutePathname("localhost.key")
}, 443);
