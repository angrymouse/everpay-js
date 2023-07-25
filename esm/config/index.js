export const everpayTxVersion = 'v1';
export const bundleInternalTxVersion = 'v1';
export const getEverpayHost = (debug) => {
    return debug === true ? 'https://api-dev.everpay.io' : 'https://api.everpay.io';
};
export const getExpressHost = (debug) => {
    return debug === true ? 'https://express-dev.everpay.io' : 'https://express.everpay.io';
};
