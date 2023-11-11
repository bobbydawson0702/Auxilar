"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccountPasswordSwagger = exports.resetAccountPasswordSwagger = exports.forgotAccountPasswordSwagger = exports.changeAccountPasswordSwagger = exports.currentAccountSwagger = exports.signinAccountSwagger = exports.verifyEmailSwagger = exports.createAccountSwagger = void 0;
exports.createAccountSwagger = {
    "hapi-swagger": {
        responses: {
            201: {
                description: "Account created successfully.",
            },
            400: {
                description: "Input Fields Required.",
            },
            409: {
                description: "Account already exists.",
            },
        },
    },
};
exports.verifyEmailSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Successfully re-send email verification",
            },
            400: {
                description: "Sending email verification failed",
            },
        },
    },
};
exports.signinAccountSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Successfully logged in.",
            },
            400: {
                description: "Input Fields Required.",
            },
            402: {
                description: "Email verify is required",
            },
            404: {
                description: "User not found.",
            },
            405: {
                description: "Password incorrect.",
            },
        },
    },
};
exports.currentAccountSwagger = {
    "hapi-swagger": {
        securityDefinitions: {
            jwt: {
                type: "apiKey",
                name: "Authorization",
                in: "header",
            },
        },
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Get current user successfully.",
            },
            401: {
                description: "Unauthorized",
            },
        },
    },
};
exports.changeAccountPasswordSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Successfully changed.",
            },
            400: {
                description: "Input Fields Required.",
            },
        },
    },
};
exports.forgotAccountPasswordSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Successfully reset your password. Please update your password .",
            },
            400: {
                description: "Resetting password failed",
            },
            404: {
                description: "Account not found",
            },
        },
    },
};
exports.resetAccountPasswordSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Successfully reset your password.",
            },
            400: {
                description: "Input invalid",
            },
            404: {
                description: "Passcode incorrect",
            },
        },
    },
};
exports.updateAccountPasswordSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Successfully update your password.",
            },
            400: {
                description: "Password input invalid",
            },
            404: {
                description: "Account not found",
            },
        },
    },
};
//# sourceMappingURL=account.js.map