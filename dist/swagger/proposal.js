"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveProposalSwagger = exports.downloadProposalSwagger = exports.deleteProposalSwagger = exports.getProposalSwagger = exports.getMyAllProposalSwagger = exports.getAllProposalSwagger = exports.updateProposalSwagger = exports.ProposalSwagger = void 0;
exports.ProposalSwagger = {
    "hapi-swagger": {
        responses: {
            201: {
                description: "Apply proposal success.",
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
                description: "Proposal already applyed.",
            },
            501: {
                description: "Requeset not implemented.",
            },
        },
    },
};
exports.updateProposalSwagger = {
    "hapi-swagger": {
        responses: {
            201: {
                description: "Proposal post successfully.",
            },
            400: {
                description: "Input Fields Required.",
            },
            403: {
                description: "Forbidden request.",
            },
            404: {
                description: "Posted Proposal not found!",
            },
            501: {
                description: "Requeset not implemented.",
            },
        },
    },
};
exports.getAllProposalSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Receive posted Proposal successfully!",
            },
            204: {
                description: "No Content",
            },
            403: {
                description: "Forbidden request.",
            },
            404: {
                description: "Posted Proposal not found!",
            },
            501: {
                description: "Request not implemented.",
            },
        },
    },
};
exports.getMyAllProposalSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Receive posted Proposal successfully!",
            },
            403: {
                description: "Forbidden request.",
            },
            404: {
                description: "Posted Proposal not found!",
            },
            501: {
                description: "Requeset not implemented.",
            },
        },
    },
};
exports.getProposalSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Receive posted Proposal successfully!",
            },
            404: {
                description: "Posted Proposal not found!",
            },
            501: {
                description: "Requeset not implemented.",
            },
        },
    },
};
exports.deleteProposalSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Receive posted Proposal successfully!",
            },
            403: {
                description: "Forbidden request",
            },
            404: {
                description: "Posted Proposal not found!",
            },
            501: {
                description: "Request not implemented.",
            },
        },
    },
};
exports.downloadProposalSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Download attached files Success",
            },
            403: {
                description: "Forbidden request",
            },
            404: {
                description: "Proposal not found!",
            },
            501: {
                description: "Request not implemented.",
            },
        },
    },
};
exports.approveProposalSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Proposal approved Successfully",
            },
            403: {
                description: "Forbidden request",
            },
            404: {
                description: "Applied Proposal not found!",
            },
            501: {
                description: "Request not implemented.",
            },
        },
    },
};
//# sourceMappingURL=proposal.js.map