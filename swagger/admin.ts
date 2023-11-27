export const updateAccountStatusSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Update account status success!",
      },
      400: {
        description: "Input Fields Required.",
      },
      403: {
        description: "Forbidden request.",
      },
      404: {
        description: "Account not found!",
      },
      409: {
        description: "Account already exists.",
      },
      501: {
        description: "Request not implemented!",
      },
    },
  },
};

export const getAccountInfoSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Get account info success!",
      },
      403: {
        description: "Forbidden request.",
      },
      501: {
        description: "Request not implemented!",
      },
    },
  },
};

export const deleteAccountInfoSwagger = {
  "hapi-swagger": {
    responses: {
      200: {
        description: "Delete account success!",
      },
      403: {
        description: "Forbidden request.",
      },
      404: {
        description: "Account not found!",
      },
      501: {
        description: "Request not implemented!",
      },
    },
  },
};
