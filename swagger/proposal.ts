export const ProposalSwagger = {
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
  
  export const updateProposalSwagger = {
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

  
  export const getAllProposalSwagger = {
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
  
  export const getMyAllProposalSwagger = {
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
  
  export const getProposalSwagger = {
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
  export const deleteProposalSwagger = {
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
<<<<<<< HEAD
=======
        },
      },
    },
  };
  export const downloadProposalSwagger = {
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
>>>>>>> df30c4a5ccc3006a2e9a9881aa978952a3c485d3
        },
      },
    },
  };
  export const downloadProposalSwagger = {
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

  export const approveProposalSwagger = {
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
