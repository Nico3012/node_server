export default async (host, method, url, body, sendFile, sendData, sendHref) => {
    try {
        return await sendFile(url.path, url.search);
    } catch (error) {
        return await sendData(`Error ${error}`);
    }
};
