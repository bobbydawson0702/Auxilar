import { Request, ResponseToolkit } from "@hapi/hapi";
import {
  JobSwagger,
  deleteJobSwagger,
  getAllJobSwagger,
  getJobSwagger,
  getMyAllJobSwagger,
  updateJobSwagger,
} from "../swagger/job";
import { JobSchema, updateJobSchema } from "../validation/job";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
// import mongoose from "mongoose";
// import config from "../config";
import Account from "../models/account";
import Job from "../models/job";
import Client from "../models/profile/client";
// require('dotenv').config();

const options = { abortEarly: false, stripUnknown: true };

export let jobRoute = [
  {
    method: "POST",
    path: "/",
    options: {
      auth: "jwt",
      description: "Post job",
      plugins: JobSwagger,
      tags: ["api", "job"],
      validate: {
        payload: JobSchema,
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
          `POST api/v1/job request from ${request.auth.credentials.email} Time: ${currentDate}`
        );
        // check whether account is client
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        if (account.account_type !== "client") {
          return response
            .response({ status: "err", err: "Forbidden request!" })
            .code(403);
        }

        // check whether profile exist
        const client = await Client.findOne({ account: account.id });
        if (!client) {
          return response
            .response({ status: "err", err: "Your profile does not exist" })
            .code(406);
        }

        const data = request.payload;

        // check job already posted by current account
        const alreadyPostedJob = await Job.findOne({
          client_email: account.email,
          title: data["title"],
        });
        if (alreadyPostedJob) {
          return response
            .response({ status: "err", err: "Job already posted" })
            .code(409);
        }

        // Todo check expert list

        const jobField = {
          client_email: account.email,
          title: data["title"],
          description: data["description"],
          budget_type: data["budget_type"],
          budget_amount: data["budget_amount"],
          end_date: data["end_date"],
          skill_set: data["skill_set"],
          job_type: data["job_type"],
          pub_date: currentDate,
          invited_expert: data["invited_expert"],
        };

        const newJob = new Job(
          jobField
          // { client_email: account.email },
          // { $set: jobField },
          // { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        await newJob.save();
        console.log("job posted successfully!", newJob);

        return response.response({ status: "ok", data: newJob }).code(201);
      } catch (error) {
        return response.response({ err: error }).code(501);
      }
    },
  },

  {
    method: "PUT",
    path: "/{jobId}",
    options: {
      auth: "jwt",
      description: "Update posted job",
      plugins: updateJobSwagger,
      tags: ["api", "job"],
      validate: {
        payload: updateJobSchema,
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
          `PUT api/v1/job/${request.params.jobId} request from ${request.auth.credentials.email} Time: ${currentDate}`
        );
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        // check whether account is client
        if (account.account_type !== "client") {
          return response
            .response({ status: "err", err: "Forbidden requeset!" })
            .code(403);
        }

        // check whether job exist
        try {
          await Job.findById(request.params.jobId);
        } catch (error) {
          return response
            .response({ status: "err", err: "Posted Job not found!" })
            .code(404);
        }

        const data = request.payload;
        const jobField = {
          title: data["title"],
          description: data["description"],
          budget_type: data["budget_type"],
          budget_amount: data["budget_amount"],
          end_date: data["end_date"],
          state: data["state"],
          skill_set: data["skill_set"],
          job_type: data["job_type"],
        };

        data["invited_expert"]
          ? (jobField["invitied_expert"] = data["invited_expert"])
          : null;

        const job = await Job.findOneAndUpdate(
          { _id: request.params.jobId, client_email: account.email },
          {
            $set: jobField,
          },
          { new: true }
        );

        // await job.save();
        console.log("job updated successfully!", job);

        return response
          .response({ status: "ok", data: "Job updated successfully" })
          .code(201);
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },
  {
    method: "GET",
    path: "/",
    options: {
      auth: "jwt",
      description: "Get all posted job",
      plugins: getAllJobSwagger,
      tags: ["api", "job"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(
          `GET api/v1/job request from ${request.auth.credentials.email} Time: ${currentDate}`
        );

        // check whether account is expert
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        if (account.account_type !== "expert") {
          return response
            .response({ status: "err", err: "Forbidden request" })
            .code(403);
        }

        const allJobs: Array<Object> = await Job.find().sort({ pub_date: -1 });
        const responseData: object = {
          length: allJobs.length,
          allJobs,
        };
        return response
          .response({ status: "ok", data: responseData })
          .code(200);
      } catch (error) {
        return response
          .response({ status: "err", err: "Request not implemented!" })
          .code(501);
      }
    },
  },
  {
    method: "GET",
    path: "/myjob",
    options: {
      auth: "jwt",
      description: "Get my all posted job",
      plugins: getMyAllJobSwagger,
      tags: ["api", "job"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(
          `GET api/v1/job/myjob request from ${request.auth.credentials.email} Time: ${currentDate}`
        );
        // Check whether account is client
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        if (account.account_type !== "client") {
          return response
            .response({ status: "err", err: "Forbidden request!" })
            .code(403);
        }

        const allMyJobs: Array<Object> = await Job.find({
          client_email: account.email,
        }).sort({
          pub_date: -1,
        });
        if (allMyJobs.length === 0) {
          return response
            .response({ status: "err", err: "Posted job not found!" })
            .code(404);
        }
        const responseData: Object = {
          length: allMyJobs.length,
          allMyJobs,
        };
        return response
          .response({ status: "ok", data: responseData })
          .code(200);
      } catch (error) {
        return response
          .response({ status: "err", err: "Request not implemented!" })
          .code(501);
      }
    },
  },
  {
    method: "GET",
    path: "/{jobId}",
    options: {
      auth: "jwt",
      description: "Get posted job",
      plugins: getJobSwagger,
      tags: ["api", "job"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(
          `GET api/v1/job/${request.params.jobId} request from ${request.auth.credentials.email} Time: ${currentDate}`
        );
        try {
          const job = await Job.find({
            _id: request.params.jobId,
            client_email: request.auth.credentials.email,
          });
          return response.response({ status: "ok", data: job }).code(200);
        } catch (error) {
          return response
            .response({ status: "err", err: "Posted job not found!" })
            .code(404);
        }
      } catch (error) {
        return response
          .response({ status: "err", err: "Request not implemented!" })
          .code(501);
      }
    },
  },
  {
    method: "DELETE",
    path: "/{jobId}",
    options: {
      auth: "jwt",
      description: "Delete posted job",
      plugins: deleteJobSwagger,
      tags: ["api", "job"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        console.log(
          `DELETE api/v1/job/${request.params.jobId} request from ${request.auth.credentials.email}`
        );
        // Check account whether it's client
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        if (account.account_type !== "client") {
          return response
            .response({ status: "err", err: "Forbidden request!" })
            .code(403);
        }

        try {
          await Job.deleteOne({
            _id: request.params.jobId,
            client_email: account.email,
          });
          return response
            .response({ status: "ok", data: "successfuly deleted!" })
            .code(200);
        } catch (error) {
          return response
            .response({ status: "err", err: "Posted job not found!" })
            .code(404);
        }
      } catch (error) {
        return response
          .response({ status: "err", err: "Request not implemented!" })
          .code(501);
      }
    },
  },


  // {
  //   method: 'POST',
  //   path: '/proposal',
  //   // options: {
  //   config: {
  //     auth: 'jwt',
  //     description: 'Create or Update job',
  //     plugins: JobSwagger,
  //     payload: {
  //       maxBytes: 10485760000,
  //       output: 'stream',
  //       parse: true,
  //       allow: "multipart/form-data",
  //       multipart: { output: 'stream' }
  //       // maxBytes: 10 * 1024 * 1024, // Maximum file size (10MB in this example)
  //     },
  //     tags: ['api', 'job'],
  //     validate: {
  //       payload: JobSchema,
  //       options,
  //       failAction: (request, h, error) => {
  //         const details = error.details.map((d) => {
  //           return { err: d.message, pagth: d.path }
  //         })
  //         return h.response(details).code(400).takeover();
  //       }
  //     },
  //     // },
  //     handler: async (request: Request, response: ResponseToolkit) => {
  //       try {
  //         console.log(`POST api/v1/job request from ${request.auth.credentials.email}`);

  //         const bucketdb = mongoose.connection.db;
  //         const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
  //           bucketName: 'file',
  //         });

  //         const file = request.payload['file'];
  //         // console.log(request.payload);

  //         console.log('-------------here-----------', file.hapi.filename);
  //         const uploadStream = bucket.openUploadStream(file.hapi.filename);
  //         file.pipe(uploadStream);

  //         return response.response({ msg: 'Success!' });
  //       } catch (error) {
  //         return response.response({ err: error });
  //       }
  //     }
  //   }
  // }
];
