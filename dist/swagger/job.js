"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteJobSwagger = exports.getJobSwagger = exports.getMyAllJobSwagger = exports.getAllJobSwagger = exports.updateJobSwagger = exports.JobSwagger = void 0;
exports.JobSwagger = {
    "hapi-swagger": {
        responses: {
            201: {
                description: "Job post successfully.",
            },
            400: {
                description: "Input Fields Required.",
            },
            403: {
                description: "Forbidden request.",
            },
            406: {
                description: "Not acceptable request.",
            },
            409: {
                description: "Job already posted.",
            },
            501: {
                description: "Requeset not implemented.",
            },
        },
    },
};
exports.updateJobSwagger = {
    "hapi-swagger": {
        responses: {
            201: {
                description: "Job post successfully.",
            },
            400: {
                description: "Input Fields Required.",
            },
            403: {
                description: "Forbidden request.",
            },
            404: {
                description: "Posted job not found!",
            },
            501: {
                description: "Requeset not implemented.",
            },
        },
    },
};
exports.getAllJobSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Receive posted job successfully!",
            },
            404: {
                description: "Posted job not found!",
            },
            501: {
                description: "Requeset not implemented.",
            },
        },
    },
};
exports.getMyAllJobSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Receive posted job successfully!",
            },
            403: {
                description: "Forbidden request.",
            },
            404: {
                description: "Posted job not found!",
            },
            501: {
                description: "Requeset not implemented.",
            },
        },
    },
};
exports.getJobSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Receive posted job successfully!",
            },
            404: {
                description: "Posted job not found!",
            },
            501: {
                description: "Requeset not implemented.",
            },
        },
    },
};
exports.deleteJobSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Receive posted job successfully!",
            },
            403: {
                description: "Forbidden request",
            },
            404: {
                description: "Posted job not found!",
            },
            501: {
                description: "Requeset not implemented.",
            },
        },
    },
};
//# sourceMappingURL=job.js.map