export const JobSwagger = {
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
      409: {
        description: "Job already posted.",
      },
      501: {
        description: "Requeset not implemented.",
      },
    },
  },
};

export const updateJobSwagger = {
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

export const getAllJobSwagger = {
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

export const getMyAllJobSwagger = {
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

export const getJobSwagger = {
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
export const deleteJobSwagger = {
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