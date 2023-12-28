import { Request, ResponseToolkit } from "@hapi/hapi";
import {
  ChimeSDKMeetingsClient,
  CreateAttendeeCommand,
  CreateMeetingCommand,
} from "@aws-sdk/client-chime-sdk-meetings";

import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

import {
  createBookingCallSwagger,
  deleteBookedCallSwagger,
  getBookedCallSwagger,
  updateBookedCallSwagger,
} from "../swagger/bokkingCall";
import {
  createBookingSchema,
  updateBookedCallSchema,
} from "../validation/bookingCall";
import BookingCall from "../models/bookingCall";
import Account from "../models/account";

dotenv.config();

const options = { abortEarly: false, stripUnknown: true };

const client = new ChimeSDKMeetingsClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESSKEYID,
    secretAccessKey: process.env.AWS_SECRETACCESSKEY,
  },
});

export let bookingCallRoute = [
  {
    method: "POST",
    path: "/",
    options: {
      // auth: "jwt",
      description: "Create a BookingCall",
      plugins: createBookingCallSwagger,
      tags: ["api", "bookingCall"],
      // validate: {
      //   payload: createBookingSchema,
      //   options,
      //   failAction: (request, h, error) => {
      //     const details = error.details.map((d) => {
      //       return { err: d.message };
      //     });
      //     return h.response(details).code(400).takeover();
      //   },
      // },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        // const currentDate = new Date().toUTCString();

        // console.log(
        //   `POST api/v1/book request from ${request.auth.credentials.email} Time: ${currentDate}`
        // );

        // const data = request.payload;

        // Get account info
        // const account = await Account.findOne({
        //   email: request.auth.credentials.email,
        // });

        const externalMeetingId = uuidv4();
        const clientRequestToken = uuidv4();
        console.log(
          "externalMeetingId----------------------------->",
          externalMeetingId
        );

        const input = {
          // CreateMeetingRequest
          ClientRequestToken: clientRequestToken, // required
          MediaRegion: process.env.AWS_REGION, // required
          // MeetingHostId: meetingHostId,
          ExternalMeetingId: externalMeetingId, // required
          // NotificationsConfiguration: { // NotificationsConfiguration
          //   LambdaFunctionArn: "STRING_VALUE",
          //   SnsTopicArn: "STRING_VALUE",
          //   SqsQueueArn: "STRING_VALUE",
          // },
          // MeetingFeatures: { // MeetingFeaturesConfiguration
          //   Audio: { // AudioFeatures
          //     EchoReduction: "AVAILABLE" || "UNAVAILABLE",
          //   },
          //   Video: { // VideoFeatures
          //     MaxResolution: "None" || "HD" || "FHD",
          //   },
          //   Content: { // ContentFeatures
          //     MaxResolution: "None" || "FHD" || "UHD",
          //   },
          //   Attendee: { // AttendeeFeatures
          //     MaxCount: Number("int"),
          //   },
          // },
          // PrimaryMeetingId: "STRING_VALUE",
          // TenantIds: [ // TenantIdList
          //   "STRING_VALUE",
          // ],
          // Tags: [ // TagList
          //   { // Tag
          //     Key: "STRING_VALUE", // required
          //     Value: "STRING_VALUE", // required
          //   },
          // ],
        };

        const command = new CreateMeetingCommand(input);
        // console.log("command---------------------------->", command);
        const chimeResponse = await client.send(command);

        // console.log("chimeResponse--------------------->", chimeResponse);

        // Create attendee command
        const externalUserId = uuidv4();

        const attendanceInput = {
          MeetingId: chimeResponse.Meeting.MeetingId,
          ExternalUserId: externalUserId,
          // Capabilities: {
          //   //AttendeeCapabilities
          //   Audio: "SendReceive",
          //   Video: "SendReceive",
          //   Content: "SendReceive",
          // },
        };

        const attendeeCommand = new CreateAttendeeCommand(attendanceInput);

        const attendeeResponse = await client.send(attendeeCommand);

        console.log("attendeeResponse----------------->", attendeeResponse);

        // const bookingCallData = {
        //   owner: {
        //     id: account._id,
        //     first_name: account.first_name,
        //     last_name: account.last_name,
        //   },
        //   participants: data["participants"],
        //   call_link: data["call_link"],
        //   title: data["title"],
        //   description: data["description"] ?? null,
        //   meeting_date: data["meeting_date"],
        //   meeting_time: data["meeting_time"],
        //   status: data["status"],
        // };

        // const bookingCall = new BookingCall(bookingCallData);
        // await bookingCall.save();
        return response
          .response({ status: "ok", data: { "meetingResponse": chimeResponse.Meeting, "attendeeResponse": attendeeResponse.Attendee } })
          .code(201);
      } catch (error) {
        return response.response({ status: "error", err: error }).code(501);
      }
    },
  },
  {
    method: "GET",
    path: "/",
    options: {
      auth: "jwt",
      description: "Get a booked call",
      plugins: getBookedCallSwagger,
      tags: ["api", "bookingCall"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(
          `GET api/v1/book request from ${request.auth.credentials.email} Time: ${currentDate}`
        );

        // Get account id
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });

        const bookedCalls = await BookingCall.find({
          $or: [
            {
              "owner.id": account._id,
            },
            {
              "participants.participant.id": account._id,
            },
          ],
        });

        return response.response({ status: "ok", data: bookedCalls }).code(200);
      } catch (error) {
        return response
          .response({ staus: "err", err: "Not implemented" })
          .code(501);
      }
    },
  },
  {
    method: "GET",
    path: "/bookedcalls/{contactorId}",
    options: {
      auth: "jwt",
      description: "Get a booked call",
      plugins: getBookedCallSwagger,
      tags: ["api", "bookingCall"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(
          `GET api/v1/book/${request.params.contactorId} request from ${request.auth.credentials.email} Time: ${currentDate}`
        );

        // Get account id
        const contactorAccount = await Account.findById(
          request.params.contactorId
        );

        if (!contactorAccount) {
          return response
            .response({ status: "err", err: "Not found!" })
            .code(404);
        }

        const bookedCalls = await BookingCall.find({
          $or: [
            {
              "owner.id": contactorAccount._id,
            },
            {
              "participants.participant.id": contactorAccount._id,
            },
          ],
        }).select("meeting_date meeting_time");

        return response.response({ status: "ok", data: bookedCalls }).code(200);
      } catch (error) {
        return response
          .response({ staus: "err", err: "Not implemented" })
          .code(501);
      }
    },
  },
  {
    method: "GET",
    path: "/{bookingCallId}",
    options: {
      auth: "jwt",
      description: "Get a booked call",
      plugins: getBookedCallSwagger,
      tags: ["api", "bookingCall"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(
          `GET api/v1/book${request.params.bookingCallId} request from ${request.auth.credentials.email} Time: ${currentDate}`
        );

        // Get account id
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });

        const bookedCalls = await BookingCall.find({
          $and: [
            {
              $or: [
                {
                  "owner.id": account._id,
                },
                {
                  "participants.participant.id": account._id,
                },
              ],
            },
            {
              _id: request.params.bookingCallId,
            },
          ],
        });

        return response.response({ status: "ok", data: bookedCalls }).code(200);
      } catch (error) {
        return response
          .response({ staus: "err", err: "Not implemented" })
          .code(501);
      }
    },
  },
  {
    method: "PUT",
    path: "/{bookingCallId}",
    options: {
      auth: "jwt",
      description: "Update booked call",
      plugins: updateBookedCallSwagger,
      tags: ["api", "bookingCall"],
      validate: {
        payload: updateBookedCallSchema,
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
          `PUT api/v1/book/${request.params.bookingCallId} request form ${request.auth.credentials.email} Time: ${currentDate}`
        );

        // Get account info
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });
        let updatedBookedCall;
        try {
          const data = request.payload;

          const updatedBookingCallData = {
            participants: data["participants"],
            call_link: data["call_link"],
            title: data["title"],
            description: data["description"] ?? null,
            meeting_date: data["meeting_date"],
            meeting_time: data["meeting_time"],
            status: data["status"],
          };
          updatedBookedCall = await BookingCall.findOneAndUpdate(
            {
              "owner.id": account._id,
              _id: request.params.bookingCallId,
            },
            {
              participants: updatedBookingCallData["participants"],
              call_link: updatedBookingCallData["call_link"],
              title: updatedBookingCallData["title"],
              description: updatedBookingCallData["description"] ?? null,
              meeting_date: updatedBookingCallData["meeting_date"],
              meeting_time: updatedBookingCallData["meeting_time"],
              status: updatedBookingCallData["status"],
            },
            {
              new: true,
            }
          );
        } catch (error) {
          return response
            .response({
              status: "err",
              err: "Not found booked call",
            })
            .code(404);
        }

        return response
          .response({ status: "ok", data: updatedBookedCall })
          .code(200);
      } catch (error) {
        return response
          .response({ staus: "err", err: "Not implemented" })
          .code(501);
      }
    },
  },
  {
    method: "DELETE",
    path: "/{bookingCallId}",
    options: {
      auth: "jwt",
      description: "Delete a booked call",
      plugins: deleteBookedCallSwagger,
      tags: ["api", "bookingCall"],
    },

    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currendDate = new Date().toUTCString();

        console.log(
          `DELETE api/v1/book/${request.params.bookingCallId} from ${request.auth.credentials.email} Time: ${currendDate}`
        );

        // GET account info
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });

        const deleteBookedCall = await BookingCall.deleteOne({
          "owner.id": account._id,
          _id: request.params.bookingCallId,
        });

        if (!deleteBookedCall.deletedCount) {
          return response
            .response({
              status: "err",
              err: "Booked call Not found!",
            })
            .code(404);
        } else {
          return response
            .response({
              status: "ok",
              data: "Booked call deleted successfully!",
            })
            .code(200);
        }
      } catch (error) {
        return response
          .response({ status: "err", err: "Not implemented!" })
          .code(501);
      }
    },
  },
];
