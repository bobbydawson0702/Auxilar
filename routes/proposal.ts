import { Request, ResponseToolkit } from "@hapi/hapi";
import {
  ProposalSwagger,
  deleteProposalSwagger,
  getAllProposalSwagger,
  getProposalSwagger,
  updateProposalSwagger,
} from "../swagger/proposal";
import { ProposalSchema, updateProposalSchema } from "../validation/proposal";
import Account from "../models/account";
import Expert from "../models/profile/expert";
import Job from "../models/job";

const options = { abortEarly: false, stripUnknown: true };

export let proposalRoute = [
  {
    method: "POST",
    path: "/{jobId}",
    options: {
      auth: "jwt",
      description: "apply Proposal",
      plugins: ProposalSwagger,
      tags: ["api", "proposal"],
      validate: {
        payload: ProposalSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return { err: d.message, path: d.path };
          });
          return h.response(details).code(400).takeover();
        },
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(
          `POST api/v1/proposal/${request.params.jobId} 
          request from ${request.auth.credentials.email} Time: ${currentDate}`
        );

        // Check whether account is expert
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        if (account.account_type !== "expert") {
          return response
            .response({ status: "err", err: "Forbidden request" })
            .code(403);
        }

        // Check whether profile exist
        try {
          await Expert.findOne({ account: account.id });
        } catch (error) {
          return response
            .response({ status: "err", err: "Your profile does not exist" })
            .code(406);
        }

        const data = request.payload;

        // Check whether already apply proposal
        const existingProposal = await Job.findOne({
          _id: request.params.jobId,
          "proposals.expert_email": account.email,
        });
        if (existingProposal) {
          return response
            .response({ status: "err", err: "Proposal already exist!" })
            .code(409);
        }
        // apply proposal
        const proposal = await Job.findOneAndUpdate(
          { _id: request.params.jobId },
          {
            $push: {
              proposals: {
                expert_email: account.email,
                cover_letter: data["cover_letter"],
                attached_file: data["attached_file"],
                milestones: data["milestones"],
              },
            },
          },
          { new: true }
        ).select("proposals");

        if (!proposal) {
          return response
            .response({ status: "err", err: "Posted job not found!" })
            .code(404);
        }

        return response.response({ status: "ok", data: proposal }).code(201);
      } catch (error) {
        return response
          .response({ status: "err", err: "Not implemented!" })
          .code(501);
      }
    },
  },

  {
    method: "PUT",
    path: "/{proposalId}",
    options: {
      auth: "jwt",
      description: "Update proposal",
      plugins: updateProposalSwagger,
      tags: ["api", "proposal"],
      validate: {
        payload: updateProposalSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return { err: d.message, path: d.path };
          });

          return h.response(details).code(400).takeover();
        },
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(`PUT api/v1/proposal/${request.params.proposalId} from 
        ${request.auth.credentials.email} Time: ${currentDate}`);

        // Check whether account is expert
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        if (account.account_type !== "expert") {
          return response
            .response({ status: "err", err: "Frobidden Request!" })
            .code(403);
        }

        // Check whether profile exist
        try {
          await Expert.findOne({ account: account.id });
        } catch (error) {
          return response
            .response({ status: "err", err: "Your profile does not exist" })
            .code(406);
        }

        const data = request.payload;

        // Edit proposal
        const proposal = await Job.findOneAndUpdate(
          {
            "proposals._id": request.params.proposalId,
            "proposals.expert_email": account.email,
          },
          {
            $set: {
              proposals: {
                expert_email: account.email,
                cover_letter: data["cover_letter"],
                attached_file: data["attached_file"],
                milestones: data["milestones"],
              },
            },
          },
          { new: true }
        ).select("proposals");

        if (!proposal) {
          return response
            .response({ status: "err", err: "Applied Proposal not found!" })
            .code(404);
        }

        return response.response({ status: "ok", data: proposal }).code(201);
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "GET",
    path: "/{proposalId}",
    options: {
      auth: "jwt",
      description: "Update proposal",
      plugins: getProposalSwagger,
      tags: ["api", "proposal"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(`GET api/v1/proposal/${request.params.proposalId} from 
        ${request.auth.credentials.email} Time: ${currentDate}`);

        // const account = await Account.findOne({
        //   email: request.auth.credentials.email,
        // });
        // // Check whether account is expert
        // // if (account.account_type !== "expert") {
        // //   return response
        // //     .response({ status: "err", err: "Frobidden Request!" })
        // //     .code(403);
        // // }

        const proposal = await Job.findOne({
          "proposals._id": request.params.proposalId,
          "proposals.expert_email": request.auth.credentials.email,
        }).select("proposals");

        if (!proposal) {
          return response
            .response({ status: "err", err: "Applied Proposal not found!" })
            .code(404);
        }

        return response.response({ status: "ok", data: proposal }).code(201);
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },

  {
    method: "DELETE",
    path: "/{proposalId}",
    options: {
      auth: "jwt",
      description: "Delete proposal",
      plugins: deleteProposalSwagger,
      tags: ["api", "proposal"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(`GET api/v1/proposal/${request.params.proposalId} from 
        ${request.auth.credentials.email} Time: ${currentDate}`);

        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        // Check whether account is expert
        if (account.account_type !== "expert") {
          return response
            .response({ status: "err", err: "Frobidden Request!" })
            .code(403);
        }

        // Check whether already apply proposal
        const existingProposal = await Job.findOne({
          "proposals._id": request.params.proposalId,
          "proposals.expert_email": account.email,
        });
        if (!existingProposal) {
          return response
            .response({ status: "err", err: "Applied proposal not found!" })
            .code(409);
        }

        try {
          await Job.findOneAndUpdate(
            {
              "proposals._id": request.params.proposalId,
              "proposals.expert_email": request.auth.credentials.email,
            },
            {
              $pull: {
                proposals: { _id: request.params.proposalId },
              },
            }
          );
          return response
            .response({ status: "ok", data: "successfully deleted!" })
            .code(200);
        } catch (error) {
          return response
            .response({ status: "err", err: "Applied Proposal not found!" })
            .code(404);
        }
      } catch (error) {
        return response.response({ status: "err", err: "error" }).code(501);
      }
    },
  },

  {
    method: "GET",
    path: "/",
    options: {
      auth: "jwt",
      description: "Update proposal",
      plugins: getAllProposalSwagger,
      tags: ["api", "proposal"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(`GET api/v1/proposal/${request.params.proposalId} from 
        ${request.auth.credentials.email} Time: ${currentDate}`);

        // const account = await Account.findOne({
        //   email: request.auth.credentials.email,
        // });
        // // Check whether account is expert
        // // if (account.account_type !== "expert") {
        // //   return response
        // //     .response({ status: "err", err: "Frobidden Request!" })
        // //     .code(403);
        // // }

        const proposal = await Job.find({
          "proposals.expert_email": request.auth.credentials.email,
        }).select("proposals").sort({'pub_date': -1});

        if (!proposal) {
          return response
            .response({ status: "err", err: "Applied Proposal not found!" })
            .code(404);
        }

        return response.response({ status: "ok", data: proposal }).code(201);
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },
];
