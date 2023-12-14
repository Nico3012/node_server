import { createGetJoinedAbsolutePathname } from "./utilities.1.0.0/create-get-joined-absolute-pathname.1.0.0.mjs";

let getJoinedAbsolutePathname = createGetJoinedAbsolutePathname(import.meta.url);

/** @type {import("./server.1.19.3/create-http2-server.1.19.3.mjs").HandleHttp2Connection} */
export let handleHttp2Connection = async (http2ReadableConnection, http2WritableConnection) => {
    let sendFileStatus = await http2WritableConnection.sendFile({
        joinedAbsolutePathname: getJoinedAbsolutePathname("./app" + http2ReadableConnection.pathname),
        cacheControlHeader: "no-cache"
    });

    if (sendFileStatus === "failed-directory") {
        http2WritableConnection.sendHref({
            href: http2ReadableConnection.pathname + "/" + http2ReadableConnection.search
        });
    } else if (sendFileStatus === "failed-stats-not-found") {
        http2WritableConnection.sendData({
            data: "Error 404",
            status: 404
        });
    } else if (sendFileStatus === "failed-unknown-stats") {
        http2WritableConnection.sendData({
            data: "Error 403",
            status: 403
        });
    }
};
