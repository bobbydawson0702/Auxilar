import { Request, ResponseToolkit } from "@hapi/hapi";
import GridFsStorage from "multer-gridfs-storage";
import multer from "multer";
import Grid from "gridfs-stream";

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
import mongoose from "mongoose";

const options = { abortEarly: false, stripUnknown: true };

export let proposalRoute = [
  {
    method: "POST",
    path: "/{jobId}",
    config: {
      auth: "jwt",
      description: "Apply proposal",
      plugins: ProposalSwagger,
      payload: {
        maxBytes: 10485760000,
        output: "stream",
        parse: true,
        allow: "multipart/form-data",
        multipart: { output: "stream" },
      },
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
      // },
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
          console.log(
            "------------------<<<<<<<here>>>>>>>>>>>>>>>>>---------------",
            data["proposalData"]["cover_letter"]
          );

          try {
            // Check whether Posted job exist
            await Job.findById(request.params.jobId);
          } catch (err) {
            return response
              .response({ status: "err", err: "Posted job not found!" })
              .code(404);
          }
          // Check whether already apply proposal
          const existingProposal = await Job.findOne({
            _id: request.params.jobId,
            "proposals.expert_email": account.email,
          });
          console.log(
            "request.params.jobId--------------------",
            request.params.jobId
          );
          if (existingProposal) {
            return response
              .response({ status: "err", err: "Proposal already exist!" })
              .code(409);
          }

          const proposalField = {
            expert_email: account.email,
            cover_letter: data["proposalData"]["cover_letter"],
            total_amount: data["proposalData"]["total_amount"],
            milestones: data["proposalData"]["milestones"],
            proposal_status: 1,
            mentor_check: [],
            attached_file: {},
          };

          if (data["proposalData"]["mentors"]) {
            const mentor_check = [];
            data["proposalData"]["mentors"].forEach((item) => {
              mentor_check.push({
                mentor: item,
                checked: false,
              });
            });

            proposalField["mentor_check"] = mentor_check;
            proposalField["proposal_status"] = 2;
          }

          if (data["attached_file"]) {
            const bucketdb = mongoose.connection.db;
            const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
              bucketName: "file",
            });

            const attached_file = data["attached_file"];
            // console.log(request.payload);

            console.log(
              "-------------here-----------",
              attached_file.hapi.filename
            );
            const uploadStream = bucket.openUploadStream(
              attached_file.hapi.filename
            );
            uploadStream.on("finish", async (file) => {
              proposalField["attached_file"] = {
                name: attached_file.hapi.filename,
                file_id: file._id,
              };
              const proposal = await Job.findOneAndUpdate(
                { _id: request.params.jobId },
                {
                  $push: {
                    proposals: proposalField,
                  },
                },
                { new: true }
              ).select("proposals");
            });
            await attached_file.pipe(uploadStream);
          } else {
            console.log(
              "----------------------------here-------------------------------------"
            );
            const proposal = await Job.findOneAndUpdate(
              { _id: request.params.jobId },
              {
                $push: {
                  proposals: proposalField,
                },
              },
              { new: true }
            ).select("proposals");
          }
          return response
            .response({ status: "ok", data: "Proposal successfully applied" })
            .code(201);
        } catch (error) {
          return response
            .response({ status: "err", err: "Not implemented!" })
            .code(501);
        }
      },
    },
  },

  {
    method: "PUT",
    path: "/{jobId}",
    config: {
      auth: "jwt",
      description: "Update applied proposal",
      plugins: updateProposalSwagger,
      payload: {
        maxBytes: 10485760000,
        output: "stream",
        parse: true,
        allow: "multipart/form-data",
        multipart: { output: "stream" },
      },
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
      // },
      handler: async (request: Request, response: ResponseToolkit) => {
        try {
          const currentDate = new Date().toUTCString();
          console.log(
            `PUT api/v1/proposal/${request.params.jobId} 
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

          try {
            // Check whether Posted job, proposal exist
            // delete uploaded file
            const appliedProposal = await Job.findOne(
              {
                _id: request.params.jobId,
                "proposals.expert_email": account.email,
              },
              { "proposals.$": 1 }
            );
            console.log(
              "here---------------------->>>>>>>>>>",
              Object.keys(appliedProposal.proposals[0]["attached_file"])
            );
            const fileid =
              appliedProposal.proposals[0]["attached_file"].file_id;

            console.log("fileid---------------------->>>>>>>>>>>>", fileid);
            if (fileid) {
              console.log(
                "fileid defined????---------------------->>>>>>>>>>>>",
                fileid
              );
              const bucketdb = mongoose.connection.db;
              const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
                bucketName: "file",
              });
              try {
                bucket.delete(fileid);
              } catch (err) {
                return response
                  .response({ status: "err", err: "Not implemented" })
                  .code(501);
              }
            }
          } catch (err) {
            return response
              .response({ status: "err", err: "Applied proposal not found!" })
              .code(404);
          }

          const proposalField = {
            expert_email: account.email,
            cover_letter: data["proposalData"]["cover_letter"],
            total_amount: data["proposalData"]["total_amount"],
            milestones: data["proposalData"]["milestones"],
            proposal_status: 1,
            mentor_check: [],
            attached_file: {},
          };

          if (data["proposalData"]["mentors"].length) {
            console.log(
              "data[proposalData][mentors]------------->>>>>>>>>>",
              data["proposalData"]["mentors"]
            );
            const mentor_check = [];
            data["proposalData"]["mentors"].forEach((item) => {
              mentor_check.push({
                mentor: item,
                checked: false,
              });
            });

            proposalField["mentor_check"] = mentor_check;
            proposalField["proposal_status"] = 2;
          }

          if (data["attached_file"]) {
            const bucketdb = mongoose.connection.db;
            const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
              bucketName: "file",
            });

            const attached_file = data["attached_file"];
            // console.log(request.payload);

            const uploadStream = bucket.openUploadStream(
              attached_file.hapi.filename
            );
            uploadStream.on("finish", async (file) => {
              proposalField["attached_file"] = {
                name: attached_file.hapi.filename,
                file_id: file._id,
              };
              const proposal = await Job.findOneAndUpdate(
                {
                  _id: request.params.jobId,
                  "proposals.expert_email": account.email,
                },
                {
                  $set: {
                    "proposals.$.cover_letter": proposalField.cover_letter,
                    "proposals.$.total_amount": proposalField.total_amount,
                    "proposals.$.milestones": proposalField.milestones,
                    "proposals.$.proposal_status":
                      proposalField.proposal_status,
                    "proposals.$.mentor_check":
                      proposalField["mentor_check"] ?? null,
                    "proposals.$.attached_file": proposalField["attached_file"],
                  },
                },
                { new: true }
              );
            });

            console.log(
              "-------------here-----------",
              attached_file.hapi.filename
            );
            await attached_file.pipe(uploadStream);
          } else {
            console.log(
              "----------------------------here-------------------------------------"
            );
            const proposal = await Job.findOneAndUpdate(
              {
                _id: request.params.jobId,
                "proposals.expert_email": account.email,
              },
              {
                $set: {
                  "proposals.$.cover_letter": proposalField.cover_letter,
                  "proposals.$.total_amount": proposalField.total_amount,
                  "proposals.$.milestones": proposalField.milestones,
                  "proposals.$.proposal_status": proposalField.proposal_status,
                  "proposals.$.mentor_check":
                    proposalField["mentor_check"] ?? null,
                  "proposals.$.attached_file": null,
                },
              },
              { new: true }
            ).select("proposals");
          }
          return response
            .response({ status: "ok", data: "Proposal successfully updated" })
            .code(201);
        } catch (error) {
          return response
            .response({ status: "err", err: "Not implemented!" })
            .code(501);
        }
      },
    },
  },

  {
    method: "GET",
    path: "/{jobId}",
    options: {
      auth: "jwt",
      description: "Get applied proposal to certain job",
      plugins: getProposalSwagger,
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
        // if (account.account_type !== "expert") {
        //   return response
        //     .response({ status: "err", err: "Frobidden Request!" })
        //     .code(403);
        // }
        let proposal;
        const ObjectId = mongoose.Types.ObjectId;
        if (account.account_type === "client") {
          proposal = await Job.aggregate([
            {
              $match: {
                _id: new ObjectId(request.params.jobId),
              },
            },
            {
              $project: {
                proposals: {
                  $filter: {
                    input: "$proposals",
                    as: "proposal",
                    cond: {
                      $eq: ["$$proposal.proposal_status", 1],
                    },
                  },
                },
              },
            },
          ]);
          if (!proposal) {
            return response
              .response({ staus: "err", err: "Not found applied proposal" })
              .code(404);
          }
        } else if (account.account_type === "expert") {
          proposal = await Job.aggregate([
            {
              $match: {
                _id: new ObjectId(request.params.jobId),
                "proposals.expert_email": account.email,
              },
            },
            {
              $project: {
                proposals: {
                  $filter: {
                    input: "$proposals",
                    as: "proposal",
                    cond: {
                      $eq: [
                        "$$proposal.expert_email",
                        request.auth.credentials.email,
                      ],
                    },
                  },
                },
              },
            },
          ]);
          if (!proposal) {
            return response
              .response({ staus: "err", err: "Not found applied proposal" })
              .code(404);
          }
        } else {
          console.log("account.id ------------------", account.id);
          proposal = await Job.aggregate([
            {
              $match: {
                _id: new ObjectId(request.params.jobId),
                "proposals.mentor_check.mentor": account.email,
              },
            },
            { $unwind: "$proposals" },
            {
              $match: {
                "proposals.mentor_check.mentor": account.email,
              },
            },
          ]);
          if (!proposal) {
            return response
              .response({ staus: "err", err: "Not found applied proposal" })
              .code(404);
          }
        }

        return response.response({ status: "ok", data: proposal }).code(201);
      } catch (error) {
        return response
          .response({ staus: "err", err: "Not implemented" })
          .code(501);
      }
    },
  },

  {
    method: "DELETE",
    path: "/{jobId}",
    options: {
      auth: "jwt",
      description: "Delete applied proposal",
      plugins: deleteProposalSwagger,
      tags: ["api", "proposal"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(`DELETE api/v1/proposal/${request.params.proposalId} from 
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
          _id: request.params.jobId,
          "proposals.expert_email": account.email,
        });
        console.log(
          "existingproposal ------------->>>>>>>>>>>",
          existingProposal
        );
        if (!existingProposal) {
          return response
            .response({ status: "err", err: "Applied proposal not found!" })
            .code(409);
        }

        try {
          await Job.findOneAndUpdate(
            {
              _id: request.params.jobId,
              "proposals.expert_email": account.email,
            },
            {
              $pull: {
                proposals: { expert_email: account.email },
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
    method: "PUT",
    path: "/{jobId}/withdraw",
    options: {
      auth: "jwt",
      description: "Withdraw applied proposal",
      plugins: updateProposalSwagger,
      tags: ["api", "proposal"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(
          `PUT api/v1/proposal/${request.params.jobId} 
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

        const proposal = await Job.findOneAndUpdate(
          {
            _id: request.params.jobId,
            "proposals.expert_email": account.email,
          },
          {
            $set: {
              "proposals.$.proposal_status": 0,
            },
          },
          { new: true }
        ).select("proposals");
        return response
          .response({ status: "ok", data: "Proposal successfully updated" })
          .code(201);
      } catch (error) {
        return response
          .response({ status: "err", err: "Not implemented!" })
          .code(501);
      }
    },
  },

  {
    method: "GET",
    path: "/",
    options: {
      auth: "jwt",
      description: "Get all proposals",
      plugins: getProposalSwagger,
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
        if (account.account_type === "client") {
          return response
            .response({ status: "err", err: "Forbidden Request!" })
            .code(403);
        }
        let proposal;
        if (account.account_type === "expert") {
          proposal = await Job.aggregate([
            { $unwind: "$proposals" },
            {
              $match: {
                "proposals.expert_email": account.email,
              },
            },
          ]);
          if (!proposal) {
            return response
              .response({ staus: "err", err: "Not found applied proposal" })
              .code(404);
          }
        } else {
          console.log("account.id ------------------", account.id);
          proposal = await Job.aggregate([
            { $unwind: "$proposals" },
            {
              $match: {
                "proposals.mentor_check.mentor": account.email,
              },
            },
          ]);
          if (!proposal) {
            return response
              .response({ staus: "err", err: "Not found applied proposal" })
              .code(404);
          }
        }

        return response.response({ status: "ok", data: proposal }).code(201);
      } catch (error) {
        return response
          .response({ staus: "err", err: "Not implemented" })
          .code(501);
      }
    },
  },
];
