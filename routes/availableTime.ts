import { Request, ResponseToolkit } from "@hapi/hapi";
import {
  createAvailableTimeSwagger,
  deleteAvailableTimeSwagger,
  getAvailableTimeSwagger,
  updateAvailableTimeSwagger,
} from "../swagger/availableTime";
import {
  createAvailableTimeSchema,
  updateAvailableTimeSchema,
} from "../validation/availableTime";
import AvailableTime from "../models/availableTime";

const options = { abortEarly: false, stripUnknown: true };

export let availableTimeRoute = [
  {
    method: "POST",
    path: "/",
    options: {
      auth: "jwt",
      description: "Create schedule",
      plugins: createAvailableTimeSwagger,
      tags: ["api", "availaleTime"],
      validate: {
        payload: createAvailableTimeSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return { err: d.message };
          });
          return h.response(details).code(400).takeover();
        },
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        console.log(
          `POST api/v1/schedule request from ${request.auth.credentials.email} Time: ${currentDate}`
        );

        // check whether schedul already exist.
        const isAlreadyExist = await AvailableTime.findOne({
          email: request.auth.credentials.email,
        });
        if (isAlreadyExist) {
          return response
            .response({ status: "err", err: "Schedule alrady exist" })
            .code(409);
        }

        const data = request.payload;
        const scheduleDataField = {
          email: request.auth.credentials.email,
          regular: {
            days: data["regular"]["days"] ?? null,
          },
          irregular: data["irregular"] ?? null,
        };
        const newAvailableTime = await new AvailableTime(scheduleDataField);

        await newAvailableTime.save();

        return response
          .response({ status: "ok", data: "Schedule created successfully!" })
          .code(201);
      } catch (err) {
        return response
          .response({ status: err, err: "Not implemented" })
          .code(501);
      }
    },
  },
  {
    method: "GET",
    path: "/",
    options: {
      auth: "jwt",
      description: "Get schedule",
      plugins: getAvailableTimeSwagger,
      tags: ["api", "availableTime"],
    },

    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        console.log(
          `GET api/v1/schedule request from ${request.auth.credentials.email} Time: ${currentDate}`
        );

        // check whether schedul already exist.
        const schedule = await AvailableTime.findOne({
          email: request.auth.credentials.email,
        });
        if (!schedule) {
          return response
            .response({ status: "err", err: "Schedule does not exist!" })
            .code(404);
        }
        return response.response({ status: "ok", data: schedule }).code(200);
      } catch (err) {
        return response
          .response({ status: err, err: "Not implemented" })
          .code(501);
      }
    },
  },
  {
    method: "PUT",
    path: "/",
    options: {
      auth: "jwt",
      description: "Update schedule",
      plugins: updateAvailableTimeSwagger,
      tags: ["api", "availaleTime"],
      validate: {
        payload: updateAvailableTimeSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return { err: d.message };
          });
          return h.response(details).code(400).takeover();
        },
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        console.log(
          `PUT api/v1/schedule request from ${request.auth.credentials.email} Time: ${currentDate}`
        );

        const data = request.payload;
        const scheduleDataField = {
          email: request.auth.credentials.email,
          regular: {
            days: data["regular"]["days"] ?? null,
          },
          irregular: data["irregular"] ?? null,
        };
        let updateSchedule;
        try {
          updateSchedule = await AvailableTime.findOneAndUpdate(
            {
              email: request.auth.credentials.email,
            },
            {
              "regular.days": scheduleDataField.regular.days,
              irregular: scheduleDataField.irregular,
            },
            { new: true }
          );
        } catch (err) {
          return response
            .response({ status: "err", err: "Schedule does not exist!" })
            .code(404);
        }

        return response
          .response({ status: "ok", data: updateSchedule })
          .code(200);
      } catch (err) {
        return response
          .response({ status: err, err: "Not implemented" })
          .code(501);
      }
    },
  },
  {
    method: "DELETE",
    path: "/",
    options: {
      auth: "jwt",
      description: "Delete schedule",
      plugins: deleteAvailableTimeSwagger,
      tags: ["api", "availableTime"],
    },

    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();

        console.log(
          `DELETE api/v1/schedule request from ${request.auth.credentials.email} Time: ${currentDate}`
        );

        const deleteSchedule = await AvailableTime.deleteOne({
          email: request.auth.credentials.email,
        });
        if (!deleteSchedule.deletedCount) {
          return response
            .response({ status: "err", err: "Schedule does not exist!" })
            .code(404);
        } else {
          return response
            .response({
              status: "ok",
              data: "Schedule deleted successfully!",
            })
            .code(200);
        }
      } catch (err) {
        return response
          .response({ status: err, err: "Not implemented" })
          .code(501);
      }
    },
  },
];