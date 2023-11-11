"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProfileSwagger = exports.updateEducationSwagger = exports.updatePersonDetailSwagger = exports.updateResumeSwagger = exports.updateVerifierSwagger = exports.addPortfolioItemSwagger = exports.deletePortfolioItemSwagger = exports.updatePortfolioItemSwagger = exports.updatePortfolioSwagger = exports.updateSummarySwagger = exports.updateBaseInfoSwagger = exports.getProfileSwagger = exports.ProfileSwagger = void 0;
exports.ProfileSwagger = {
    "hapi-swagger": {
        responses: {
            201: {
                description: "Profile created successfully.",
            },
            400: {
                description: "Input Fields Required.",
            },
            403: {
                description: "Forbidden request",
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
exports.updateBaseInfoSwagger = {
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
exports.updateSummarySwagger = {
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
exports.updatePortfolioSwagger = {
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
exports.updatePortfolioItemSwagger = {
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
exports.deletePortfolioItemSwagger = {
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
exports.addPortfolioItemSwagger = {
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
exports.updateVerifierSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "success.",
            },
            404: {
                description: "Profile not found!",
            },
            501: {
                description: "Request not implemented.",
            },
        },
    },
};
exports.updateResumeSwagger = {
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
exports.updatePersonDetailSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "success.",
            },
            404: {
                description: "Profile not found!",
            },
            501: {
                description: "Request not implemented.",
            },
        },
    },
};
exports.updateEducationSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "success.",
            },
            404: {
                description: "Profile not found!",
            },
            501: {
                description: "Request not implemented.",
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