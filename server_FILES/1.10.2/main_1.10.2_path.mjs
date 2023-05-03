export default async (method, url, body, sendFile, sendData, sendHref) => {
    try {
        return await sendFile(url.path, url.search);
    } catch (error) {
        return await sendData(`Error ${error}`);
    }
};
