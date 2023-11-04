export const ProfileSwagger = {
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
export const getProfileSwagger = {
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
export const deleteProfileSwagger = {
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
