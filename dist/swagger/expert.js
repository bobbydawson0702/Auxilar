"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProfileSwagger = exports.getProfileSwagger = exports.ProfileSwagger = void 0;
exports.ProfileSwagger = {
    "hapi-swagger": {
        responses: {
            201: {
                description: "Profile created successfully.",
            },
            400: {
                description: "Input Fields Required.",
            },
            501: {
                description: "Requeset not implemented.",
            },
        },
    },
};
exports.getProfileSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "success.",
            },
            404: {
                description: "Profile not found!",
            },
            501: {
                description: "Requeset not implemented.",
            },
        },
    },
};
exports.deleteProfileSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Delete profile success",
            },
            404: {
                description: "Profile not found!",
            },
            501: {
                description: "Requeset not implemented.",
            },
        },
    },
};
//# sourceMappingURL=expert.js.map