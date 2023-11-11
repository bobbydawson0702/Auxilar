"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
<<<<<<< HEAD
exports.deleteJobSwagger = exports.getJobSwagger = exports.getMyAllJobSwagger = exports.getAllJobSwagger = exports.findPostedJobSwagger = exports.updateJobSwagger = exports.JobSwagger = void 0;
=======
exports.deleteJobSwagger = exports.getJobSwagger = exports.getMyAllJobSwagger = exports.getAllJobSwagger = exports.updateJobSwagger = exports.JobSwagger = void 0;
>>>>>>> c0fac13a95db9fa562724f2fd60dbfe3f4b7a9b6
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
<<<<<<< HEAD
exports.findPostedJobSwagger = {
    "hapi-swagger": {
        responses: {
            201: {
                description: "Find Posted Job successfully.",
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
            406: {
                description: "Not acceptable request.",
            },
            501: {
                description: "Requeset not implemented.",
            },
        },
    },
};
=======
>>>>>>> c0fac13a95db9fa562724f2fd60dbfe3f4b7a9b6
exports.getAllJobSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Receive posted job successfully!",
            },
            204: {
                description: "No Content",
            },
            403: {
                description: "Forbidden request.",
            },
            404: {
                description: "Posted job not found!",
            },
            501: {
                description: "Request not implemented.",
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