/**
 * @typedef CreateLogErrorOptions
 * @property {boolean} showProtocol
 * @property {boolean} hideDirectories
 */

/**
 * @typedef LogErrorOptions
 * @property {number} logLevel
 * @property {boolean} [showProtocol]
 * @property {boolean} [hideDirectories]
 */

/**
 * @typedef {(errorMessage: string, logErrorOptions: LogErrorOptions) => undefined} LogError
 */

/**
 * @param {number} minLogLevel - [0, 1] 0: everything, 1: only important errors
 * @param {CreateLogErrorOptions} createLogErrorOptions
 * @returns {LogError}
 */
export let createLogError = (minLogLevel, createLogErrorOptions) => {
    /**
     * @type {LogError}
     */
    let logError = (errorMessage, logErrorOptions) => {
        let logLevel = logErrorOptions.logLevel;

        if (logLevel > 1) {
            logError(`logLevel should be less or equal to 1 but received ${logLevel.toFixed(2)}. Now it will be set to 1.`, {
                logLevel: 1
            });

            logLevel = 1;
        } else if (logLevel < 0) {
            logError(`logLevel should be larger or equal to 0 but received ${logLevel.toFixed(2)}. Now it will be set to 0.`, {
                logLevel: 1
            });

            logLevel = 0;
        }

        if (logLevel >= minLogLevel) {
            /** @type {string[]} */
            let protocols = [];

            /** @type {string[]} */
            let pathnames = [];

            /** @type {string[]} */
            let lines = [];

            /** @type {string[]} */
            let columns = [];

            let error = new Error();

            if ("stack" in error) {
                let errorLocationArray = error.stack.match(/[a-z]+:\/\/[^:]+:[0-9]+:[0-9]+/g); // fails if browser includes port ":" in domain

                if (errorLocationArray !== null) {
                    for (let index = 1; index < errorLocationArray.length; index += 1) {
                        /** @type {string} */ // @ts-ignore // for condition
                        let errorLocation = errorLocationArray[index]; // "file:///dir/file.ext:line:column"

                        /** @type {[ string, string, string ]} */ // @ts-ignore // must be three strings because of regex
                        let splitedErrorLocation = errorLocation.split(/:(?=[0-9])/g);

                        /** @type {[ string, string ]} */ // @ts-ignore // must be three strings because of regex
                        let protocolPathname = splitedErrorLocation[0].split("://");

                        protocols.push(protocolPathname[0]);
                        pathnames.push(protocolPathname[1]);
                        lines.push(splitedErrorLocation[1]);
                        columns.push(splitedErrorLocation[2]);
                    }
                }
            }

            let message = `Error | ${errorMessage} | at logLevel: ${logLevel.toFixed(2)}`;

            for (let index = 0; index < protocols.length; index += 1) {
                message += `\n`;

                if (logErrorOptions.showProtocol === true || (logErrorOptions.showProtocol === undefined && createLogErrorOptions.showProtocol === true)) {
                    message += ` protocol: ${protocols[index]},`;
                }

                if (logErrorOptions.hideDirectories === true || (logErrorOptions.hideDirectories === undefined && createLogErrorOptions.hideDirectories === true)) {
                    // @ts-ignore // pathnames[index] cannot be undefined
                    message += ` filename: ${pathnames[index].split("/").at(-1)},`;
                } else {
                    message += ` pathname: ${pathnames[index]},`;
                }

                message += ` line: ${lines[index]}, column: ${columns[index]};`;
            }

            console.log(message);
        }
    };

    if (minLogLevel > 1) {
        let oldMinLogLevel = minLogLevel;

        minLogLevel = 1;

        logError(`minLogLevel should be less or equal to 1 but received ${oldMinLogLevel.toFixed(2)}. Now it was set to 1.`, {
            logLevel: 1
        });
    } else if (minLogLevel < 0) {
        let oldMinLogLevel = minLogLevel;

        minLogLevel = 0;

        logError(`minLogLevel should be larger or equal to 0 but received ${oldMinLogLevel.toFixed(2)}. Now it was set to 0.`, {
            logLevel: 1
        });
    }

    return logError;
};
