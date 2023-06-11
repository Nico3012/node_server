import env from "./env_1.10.3_host.mjs";

export default async (host, method, url, body, sendFile, sendData, sendHref) => {
    try {
        return await sendFile(env.dir, url.path, url.search);
    } catch (error) {
        return await sendData(`Error ${error}`);
    }
};
