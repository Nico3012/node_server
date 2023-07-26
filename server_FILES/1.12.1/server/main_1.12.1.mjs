export default async connection => { // connection: { method, path, search, params, body, cookie, sendFile, sendData, sendHref }
    try {
        return await connection.sendFile({
            path: connection.path,
            search: connection.search
        });
    } catch (status) {
        return await connection.sendData({
            data: `Error ${status}`,
            status
        });
    }
};

// Tutorial:

// let status = await sendFile({
//     path: "/index.html",
//     search: "?key=value",
//     status: 200,
//     cookie: {
//         key: "value; HttpOnly; Secure"
//     }
// });

// let status = await sendData({
//     data: "Hello World!",
//     mime: "text/plain; charset=utf-8",
//     status: 200,
//     cookie: {
//         key: "value; HttpOnly; Secure"
//     }
// });

// let status = await sendHref({
//     href: "/",
//     status: 308,
//     cookie: {
//         key: "value; HttpOnly; Secure"
//     }
// });
