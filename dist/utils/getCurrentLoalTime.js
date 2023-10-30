"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getCurrentLoalTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60 * 1000; // offset in milliseconds
    const localTime = now.getTime() - offset;
    const localDate = new Date(localTime);
    return localDate;
};
exports.default = getCurrentLoalTime;
//# sourceMappingURL=getCurrentLoalTime.js.map