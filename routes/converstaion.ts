import { Request, ResponseToolkit } from "@hapi/hapi";
import {
  ConversationSwagger,
  deleteMessageSwagger,
  deleteMyConversationSwagger,
  downloadMessageFileSwagger,
  getAllConversationSwagger,
  getMessageSwagger,
  getMyConversationSwagger,
  putMessageToConversationSwagger,
  updateMessageSwagger,
} from "../swagger/converstaion";
import {
  ConversationSchema,
  putMessageToConversationSchema,
  updateMessageSchema,
} from "../validation/conversation";
import Account from "../models/account";
import Conversation from "../models/conversation";
import mongoose, { Schema } from "mongoose";

const options = { abortEarly: false, stripUnknown: true };

export let conversationRoute = [
  {
    method: "POST",
    path: "/",
    options: {
      auth: "jwt",
      description: "Create a conversation",
      plugins: ConversationSwagger,
      tags: ["api", "conversation"],
      validate: {
        payload: ConversationSchema,
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
          `POST api/v1/conversation/ request from ${request.auth.credentials.email} Time: ${currentDate}`
        );

        // check account
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // If account is expert return 403 error
        if (account.account_type === "expert") {
          return response
            .response({ status: "err", err: "Forbidden request!" })
            .code(403);
        }

        const data = request.payload;

        let conversationField;

        // check expert_email
        const expert = await Account.findOne({ email: data["expert_email"] });
        if (!expert) {
          return response
            .response({ status: "err", err: "expert does not exist" })
            .code(404);
        }

        // if account is client
        if (account.account_type === "client") {
          // check whether required fied such as job, proposal
          if (!(data["job"] && data["proposal"])) {
            return response
              .response({
                status: "err",
                err: "Job or proposal fields are empty",
              })
              .code(400);
          }

          // check whether conversation already exist
          const existConversation = await Conversation.findOne({
            client_email: account.email,
            expert_email: data["expert_email"],
          });

          if (existConversation) {
            return response
              .response({ status: "err", err: "Conversation already exist!" })
              .code(409);
          }

          // fill conversationField
          conversationField = {
            client_email: account.email,
            expert_email: data["expert_email"],
            job: data["job"],
            proposal: data["proposal"],
          };
        } else if (account.account_type === "mentor") {
          // check whether conversation already exist
          const existConversation = await Conversation.findOne({
            mentor_email: account.email,
            expert_email: data["expert_email"],
          });

          if (existConversation) {
            return response
              .response({ status: "err", err: "Conversation already exist!" })
              .code(409);
          }

          // fill conversationField
          conversationField = {
            expert: data["expert"],
            mentor_email: account.email,
          };
        }

        //create new conversation
        const newConversation = new Conversation(conversationField);
        await newConversation.save();

        return response
          .response({ status: "ok", data: newConversation })
          .code(201);
      } catch (err) {
        return response
          .response({ status: "err", err: "Not implemented!" })
          .code(501);
      }
    },
  },
  {
    method: "GET",
    path: "/all",
    options: {
      auth: "jwt",
      description: "Get all conversations",
      plugins: getAllConversationSwagger,
      tags: ["api", "conversation"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(
          `GET api/v1/conversation request from ${request.auth.credentials.email} Time: ${currentDate}`
        );

        // check whether account is Admin
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        });

        let allConversations;

        if (account.account_type === "admin") {
          // get entire conversations logged in databse
          allConversations = await Conversation.aggregate([
            {
              $project: {
                _id: 0,
                client_email: 1,
                expert_email: 1,
                mentor_email: 1,
                "job.title": 1,
                "job.id": 1,
                "proposal.id": 1,
              },
            },
          ]);
        } else if (account.account_type === "client") {
          // get all conversations associated with current client.
          allConversations = await Conversation.aggregate([
            {
              $match: {
                client_email: account.email,
              },
            },
            {
              $project: {
                _id: 0,
                client_email: 1,
                expert_email: 1,
                mentor_email: 1,
                "job.title": 1,
                "job.id": 1,
                "proposal.id": 1,
              },
            },
          ]);
        } else if (account.account_type === "expert") {
          // get all conversations associated with current expert.
          allConversations = await Conversation.aggregate([
            {
              $match: {
                expert_email: account.email,
              },
            },
            {
              $project: {
                _id: 0,
                client_email: 1,
                expert_email: 1,
                mentor_email: 1,
                "job.title": 1,
                "job.id": 1,
                "proposal.id": 1,
              },
            },
          ]);
        } else {
          // get all conversations associated with current mentor.
          allConversations = await Conversation.aggregate([
            {
              $match: {
                mentor_email: account.email,
              },
            },
            {
              $project: {
                _id: 0,
                client_email: 1,
                expert_email: 1,
                mentor_email: 1,
                "job.title": 1,
                "job.id": 1,
                "proposal.id": 1,
              },
            },
          ]);
        }

        return response
          .response({ status: "ok", data: allConversations })
          .code(200);
      } catch (err) {
        return response
          .response({ status: "err", err: "Not implemented" })
          .code(501);
      }
    },
  },
  {
    method: "GET",
    path: "/my/{contact_email}",
    options: {
      auth: "jwt",
      description: "Get specific conversation",
      plugins: getMyConversationSwagger,
      tags: ["api", "conversation"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(
          `GET api/v1/my/${request.params.contact_email} request from ${request.auth.credentials.email} Time: ${currentDate}`
        );

        // check whether acount exist
        const myAccount = await Account.findOne({
          email: request.auth.credentials.email,
        });

        const contactAccount = await Account.findOne({
          email: request.params.contact_email,
        });

        if (!(myAccount && contactAccount)) {
          return response
            .response({ status: "err", err: "Account does not exist!" })
            .code(404);
        }

        let client_email: string = null;
        let expert_email: string = null;
        let mentor_email: string = null;

        // check account type
        switch (myAccount.account_type) {
          case "client": {
            client_email = myAccount.email;
            break;
          }
          case "expert": {
            expert_email = myAccount.email;
            break;
          }
          case "mentor": {
            mentor_email = myAccount.email;
            break;
          }
        }

        let isAllright: boolean = true;
        switch (contactAccount.account_type) {
          case "client": {
            !client_email
              ? (client_email = contactAccount.email)
              : (isAllright = false);
            break;
          }
          case "expert": {
            !expert_email
              ? (expert_email = contactAccount.email)
              : (isAllright = false);
            break;
          }
          case "mentor": {
            !mentor_email
              ? (mentor_email = contactAccount.email)
              : (isAllright = false);
            break;
          }
        }

        // if myAccount.account_type === contactAccount.acount_type Conversation is not exist
        if (!isAllright) {
          return response
            .response({ status: "err", err: "Conversation does not exist" })
            .code(404);
        }

        // build query
        const queryAll: object = {
          $and: [],
        };
        if (client_email) queryAll["$and"].push({ client_email });
        if (expert_email) queryAll["$and"].push({ expert_email });
        if (mentor_email) queryAll["$and"].push({ mentor_email });

        console.log("queryAll---------------->>>>>>>>>", queryAll);

        const myConversation = await Conversation.aggregate([
          {
            $match: queryAll,
          },
          // {
          //   $project: {
          //     _id: 0,
          //     client_email: 1,
          //     expert_email: 1,
          //     mentor_email: 1,
          //     "job.title": 1,
          //     "job.id": 1,
          //     "proposal.id": 1,
          //   },
          // },
        ]);

        if (!myConversation) {
          return response
            .response({ status: "err", err: "Conversation does not exist" })
            .code(404);
        }

        return response
          .response({ status: "ok", data: myConversation })
          .code(200);
      } catch (err) {
        return response
          .response({ status: "err", err: "Not implemented" })
          .code(501);
      }
    },
  },
  {
    method: "DELETE",
    path: "/my/{contact_email}",
    options: {
      auth: "jwt",
      description: "Delete specific conversation",
      plugins: deleteMyConversationSwagger,
      tags: ["api", "conversation"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(
          `DELETE api/v1/my/${request.params.contact_email} request from ${request.auth.credentials.email} Time: ${currentDate}`
        );

        // check whether acount exist
        const myAccount = await Account.findOne({
          email: request.auth.credentials.email,
        });

        const contactAccount = await Account.findOne({
          email: request.params.contact_email,
        });

        if (!(myAccount && contactAccount)) {
          return response
            .response({ status: "err", err: "Account does not exist!" })
            .code(404);
        }

        let client_email: string = null;
        let expert_email: string = null;
        let mentor_email: string = null;

        // check account type
        switch (myAccount.account_type) {
          case "client": {
            client_email = myAccount.email;
            break;
          }
          case "expert": {
            expert_email = myAccount.email;
            break;
          }
          case "mentor": {
            mentor_email = myAccount.email;
            break;
          }
        }

        let isAllright: boolean = true;
        switch (contactAccount.account_type) {
          case "client": {
            !client_email
              ? (client_email = contactAccount.email)
              : (isAllright = false);
            break;
          }
          case "expert": {
            !expert_email
              ? (expert_email = contactAccount.email)
              : (isAllright = false);
            break;
          }
          case "mentor": {
            !mentor_email
              ? (mentor_email = contactAccount.email)
              : (isAllright = false);
            break;
          }
        }

        // if myAccount.account_type === contactAccount.acount_type Conversation is not exist
        if (!isAllright) {
          return response
            .response({ status: "err", err: "Conversation does not exist" })
            .code(404);
        }

        // build query
        const queryAll: object = {
          $and: [],
        };
        if (client_email) queryAll["$and"].push({ client_email });
        if (expert_email) queryAll["$and"].push({ expert_email });
        if (mentor_email) queryAll["$and"].push({ mentor_email });

        console.log("queryAll---------------->>>>>>>>>", queryAll);

        // find conversation
        const myConversation = await Conversation.aggregate([
          {
            $match: queryAll,
          },
          {
            $project: {
              _id: 0,
              client_email: 1,
              expert_email: 1,
              mentor_email: 1,
              "job.title": 1,
              "job.id": 1,
              "proposal.id": 1,
            },
          },
        ]);

        if (!myConversation) {
          return response
            .response({ status: "err", err: "Conversation does not exist" })
            .code(404);
        }

        // delete conversation
        myConversation.forEach(async (item) => {
          console.log("item------------------>>>>>>>>>>>", item);
          await Conversation.deleteOne({
            client_email: item.client_email,
            expert_email: item.expert_email,
            mentor_email: item.mentor_email,
          });
        });

        console.log("myConversation---------------->", "myConversation");
        return response
          .response({ status: "ok", data: myConversation })
          .code(200);
      } catch (err) {
        return response
          .response({ status: "err", err: "Not implemented" })
          .code(501);
      }
    },
  },

  // handle messages
  {
    method: "PATCH",
    path: "/my/messages",
    config: {
      auth: "jwt",
      description: "Add a message to conversation",
      plugins: putMessageToConversationSwagger,
      payload: {
        maxBytes: 10485760000,
        output: "stream",
        parse: true,
        allow: "multipart/form-data",
        multipart: { output: "stream" },
      },
      tags: ["api", "conversation"],
      validate: {
        payload: putMessageToConversationSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return { err: d.message, path: d.path };
          });
          return h.response(details).code(400).takeover();
        },
      },
      handler: async (request: Request, response: ResponseToolkit) => {
        try {
          const currentDate = new Date();
          console.log(
            `PATCH api/v1/my/messages request from ${request.auth.credentials.email} Time: ${currentDate}`
          );

          const data = request.payload;

          // check whether acount exist
          const myAccount = await Account.findOne({
            email: request.auth.credentials.email,
          });

          const contactAccount = await Account.findOne({
            email: data["messageData"]["to"],
          });

          if (!(myAccount && contactAccount)) {
            return response
              .response({ status: "err", err: "Account does not exist!" })
              .code(404);
          }

          let client_email: string = null;
          let expert_email: string = null;
          let mentor_email: string = null;

          // check account type
          switch (myAccount.account_type) {
            case "client": {
              client_email = myAccount.email;
              break;
            }
            case "expert": {
              expert_email = myAccount.email;
              break;
            }
            case "mentor": {
              mentor_email = myAccount.email;
              break;
            }
          }

          let isAllright: boolean = true;
          switch (contactAccount.account_type) {
            case "client": {
              !client_email
                ? (client_email = contactAccount.email)
                : (isAllright = false);
              break;
            }
            case "expert": {
              !expert_email
                ? (expert_email = contactAccount.email)
                : (isAllright = false);
              break;
            }
            case "mentor": {
              !mentor_email
                ? (mentor_email = contactAccount.email)
                : (isAllright = false);
              break;
            }
          }

          // if myAccount.account_type === contactAccount.acount_type Conversation is not exist
          if (!isAllright) {
            return response
              .response({ status: "err", err: "Conversation does not exist" })
              .code(404);
          }

          // confirm message field
          const messageField = {
            sender: myAccount.email,
            message_type: data["messageData"]["message_type"],
            message_body: data["messageData"]["message_body"],
            parent_message_id: data["messageData"]["parent_message_id"] ?? null,
            attached_files: [],
            created_date: currentDate,
            expire_date: null,
          };

          // build query to find conversation
          const queryAll: object = {
            $and: [],
          };
          if (client_email) queryAll["$and"].push({ client_email });
          if (expert_email) queryAll["$and"].push({ expert_email });
          if (mentor_email) queryAll["$and"].push({ mentor_email });

          if (data["messageData"]["job"]) {
            queryAll["$and"].push({
              "job.id": data["messageData"]["job"]["id"],
            });
            queryAll["$and"].push({
              "job.title": data["messageData"]["job"]["title"],
            });
          }

          try {
            // Check whether conversation exist
            await Conversation.findOne(queryAll);
          } catch (err) {
            return response
              .response({ status: "err", err: "Conversation does not exist" })
              .code(404);
          }

          let myConversation;

          // add attached files if it exist
          if (data["attached_files"]) {
            // push a message to the conversation
            console.log("queryAll---------------->>>>>>>>>", queryAll);

            myConversation = await Conversation.findOneAndUpdate(
              queryAll,
              {
                $push: {
                  messages: messageField,
                },
              },
              { new: true }
            );

            // get message id
            const message = await Conversation.aggregate([
              {
                $match: queryAll,
              },
              {
                $project: {
                  messages: {
                    $filter: {
                      input: "$messages",
                      as: "message",
                      cond: {
                        $eq: ["$$message.created_date", currentDate],
                      },
                    },
                  },
                },
              },
            ]);
            // upload_attached_files
            data["attached_files"].forEach(async (fileItem) => {
              const bucketdb = mongoose.connection.db;
              const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
                bucketName: "messageFiles",
              });

              const attached_file = fileItem;
              const uploadStream = bucket.openUploadStream(
                attached_file.hapi.filename
              );
              uploadStream.on("finish", async (file) => {
                // record attached_files info to database
                const queryMessage = queryAll;
                queryMessage["$and"].push({
                  "messages._id": message[0].messages[0]._id,
                });
                const attachedMessage = await Conversation.findOneAndUpdate(
                  queryMessage,
                  {
                    $push: {
                      "messages.$.attached_files": {
                        name: attached_file.hapi.filename,
                        file_id: file._id,
                      },
                    },
                  },
                  { new: true }
                );
              });

              await attached_file.pipe(uploadStream);
            });
          } else {
            // add a message to the conversation
            myConversation = await Conversation.findOneAndUpdate(
              queryAll,
              {
                $push: {
                  messages: messageField,
                },
              },
              { new: true }
            );
          }

          return response
            .response({ status: "ok", data: myConversation })
            .code(200);
        } catch (err) {
          return response
            .response({ status: "err", err: "Not implemented" })
            .code(501);
        }
      },
    },
  },
  {
    method: "PATCH",
    path: "/my/messages/{messageId}",
    config: {
      auth: "jwt",
      description: "update a message",
      plugins: updateMessageSwagger,
      payload: {
        maxBytes: 10485760000,
        output: "stream",
        parse: true,
        allow: "multipart/form-data",
        multipart: { output: "stream" },
      },
      tags: ["api", "conversation"],
      validate: {
        payload: updateMessageSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return { err: d.message, path: d.path };
          });
          return h.response(details).code(400).takeover();
        },
      },
      handler: async (request: Request, response: ResponseToolkit) => {
        try {
          const currentDate = new Date();
          console.log(
            `PATCH api/v1/my/messages request from ${request.auth.credentials.email} Time: ${currentDate}`
          );

          const data = request.payload;

          // check whether acount exist
          const myAccount = await Account.findOne({
            email: request.auth.credentials.email,
          });

          const contactAccount = await Account.findOne({
            email: data["messageData"]["to"],
          });

          if (!(myAccount && contactAccount)) {
            return response
              .response({ status: "err", err: "Account does not exist!" })
              .code(404);
          }

          let client_email: string = null;
          let expert_email: string = null;
          let mentor_email: string = null;

          // check account type
          switch (myAccount.account_type) {
            case "client": {
              client_email = myAccount.email;
              break;
            }
            case "expert": {
              expert_email = myAccount.email;
              break;
            }
            case "mentor": {
              mentor_email = myAccount.email;
              break;
            }
          }

          let isAllright: boolean = true;
          switch (contactAccount.account_type) {
            case "client": {
              !client_email
                ? (client_email = contactAccount.email)
                : (isAllright = false);
              break;
            }
            case "expert": {
              !expert_email
                ? (expert_email = contactAccount.email)
                : (isAllright = false);
              break;
            }
            case "mentor": {
              !mentor_email
                ? (mentor_email = contactAccount.email)
                : (isAllright = false);
              break;
            }
          }

          // if myAccount.account_type === contactAccount.acount_type Conversation is not exist
          if (!isAllright) {
            return response
              .response({ status: "err", err: "Conversation does not exist" })
              .code(404);
          }

          // build query to find conversation
          const queryAll: object = {
            $and: [],
          };
          if (client_email) queryAll["$and"].push({ client_email });
          if (expert_email) queryAll["$and"].push({ expert_email });
          if (mentor_email) queryAll["$and"].push({ mentor_email });

          if (data["messageData"]["job"]) {
            queryAll["$and"].push({
              "job.id": data["messageData"]["job"]["id"],
            });
            queryAll["$and"].push({
              "job.title": data["messageData"]["job"]["title"],
            });
          }

          const queryMessage = queryAll;
          queryMessage["$and"].push({
            "messages._id": request.params.messageId,
          });

          let myConversation;

          try {
            // Check whether conversation exist
            const sendedMessage = await Conversation.findOne(queryAll, {
              "messages.$": 1,
            });

            console.log(
              "sendedMessage-------------->>>>>>>>>>>>",
              sendedMessage
            );

            const attached_files = sendedMessage.messages[0]["attached_files"];

            // delete uploaded files
            if (attached_files) {
              attached_files.forEach((item) => {
                const bucketdb = mongoose.connection.db;
                const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
                  bucketName: "messageFiles",
                });
                try {
                  bucket.delete(item.file_id);
                } catch (err) {
                  return response
                    .response({ staus: "err", err: "Not implemented!" })
                    .code(501);
                }
              });
            }
          } catch (err) {
            return response
              .response({ status: "err", err: "Message does not exist!" })
              .code(404);
          }

          // confirm message field
          const messageField = {
            sender: myAccount.email,
            message_type: data["messageData"]["message_type"],
            message_body: data["messageData"]["message_body"],
            parent_message_id: data["messageData"]["parent_message_id"] ?? null,
            attached_files: [],
            created_date: currentDate,
            expire_date: null,
          };

          console.log(
            "data[attached_files]--------------------->>>>>>>>>>",
            data["attached_files"]
          );

          // add attached files if it exist
          if (data["attached_files"]) {
            // Update message in the conversation
            console.log("queryAll---------------->>>>>>>>>", queryAll);

            myConversation = await Conversation.findOneAndUpdate(
              queryAll,
              {
                $set: {
                  "messages.$.sender": messageField.sender,
                  "messages.$.message_type": messageField.message_type,
                  "messages.$.message_body": messageField.message_body,
                  "messages.$.parent_message_id":
                    messageField.parent_message_id,
                  "messages.$.attached_files": [],
                  "messages.$.created_date": messageField.created_date,
                  "messages.$.expire_date": messageField.expire_date,
                },
              },
              { new: true }
            );

            // // get message id
            // const message = await Conversation.aggregate([
            //   {
            //     $match: queryAll,
            //   },
            //   {
            //     $project: {
            //       messages: {
            //         $filter: {
            //           input: "$messages",
            //           as: "message",
            //           cond: {
            //             $eq: ["$$message.created_date", currentDate],
            //           },
            //         },
            //       },
            //     },
            //   },
            // ]);

            // upload_attached_files
            data["attached_files"].forEach(async (fileItem) => {
              const bucketdb = mongoose.connection.db;
              const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
                bucketName: "messageFiles",
              });

              const attached_file = fileItem;
              const uploadStream = bucket.openUploadStream(
                attached_file.hapi.filename
              );
              uploadStream.on("finish", async (file) => {
                // record attached_files info to database
                // const queryMessage = queryAll;
                // queryMessage["$and"].push({
                //   "messages._id": message[0].messages[0]._id,
                // });
                myConversation = await Conversation.findOneAndUpdate(
                  queryAll,
                  {
                    $push: {
                      "messages.$.attached_files": {
                        name: attached_file.hapi.filename,
                        file_id: file._id,
                      },
                    },
                  },
                  { new: true }
                );
              });

              await attached_file.pipe(uploadStream);
            });
          } else {
            // Update message in the conversation
            myConversation = await Conversation.findOneAndUpdate(
              queryAll,
              {
                $set: {
                  "messages.$.sender": messageField.sender,
                  "messages.$.message_type": messageField.message_type,
                  "messages.$.message_body": messageField.message_body,
                  "messages.$.parent_message_id":
                    messageField.parent_message_id,
                  "messages.$.attached_files": [],
                  "messages.$.created_date": messageField.created_date,
                  "messages.$.expire_date": messageField.expire_date,
                },
              },
              { new: true }
            );
          }

          return response
            .response({ status: "ok", data: "Update message Success!" })
            .code(200);
        } catch (err) {
          return response
            .response({ status: "err", err: "Not implemented" })
            .code(501);
        }
      },
    },
  },

  {
    method: "GET",
    path: "/my/messages/{contact_email}/{messageId}",
    options: {
      auth: "jwt",
      description: "Get specific message in conversation",
      plugins: getMessageSwagger,
      tags: ["api", "conversation"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(`GET api/v1/conversation/my/message/${request.params.contact_email}/${request.params.messageId} from 
        ${request.auth.credentials.email} Time: ${currentDate}`);
        const data = request.payload;

        // check whether acount exist
        const myAccount = await Account.findOne({
          email: request.auth.credentials.email,
        });

        const contactAccount = await Account.findOne({
          email: request.params.contact_email,
        });

        if (!(myAccount && contactAccount)) {
          return response
            .response({ status: "err", err: "Account does not exist!" })
            .code(404);
        }

        let client_email: string = null;
        let expert_email: string = null;
        let mentor_email: string = null;

        // check account type
        switch (myAccount.account_type) {
          case "client": {
            client_email = myAccount.email;
            break;
          }
          case "expert": {
            expert_email = myAccount.email;
            break;
          }
          case "mentor": {
            mentor_email = myAccount.email;
            break;
          }
        }

        let isAllright: boolean = true;
        switch (contactAccount.account_type) {
          case "client": {
            !client_email
              ? (client_email = contactAccount.email)
              : (isAllright = false);
            break;
          }
          case "expert": {
            !expert_email
              ? (expert_email = contactAccount.email)
              : (isAllright = false);
            break;
          }
          case "mentor": {
            !mentor_email
              ? (mentor_email = contactAccount.email)
              : (isAllright = false);
            break;
          }
        }

        // if myAccount.account_type === contactAccount.acount_type Conversation is not exist
        if (!isAllright) {
          return response
            .response({ status: "err", err: "Conversation does not exist" })
            .code(404);
        }

        // build query to find conversation
        const queryAll: object = {
          $and: [],
        };
        if (client_email) queryAll["$and"].push({ client_email });
        if (expert_email) queryAll["$and"].push({ expert_email });
        if (mentor_email) queryAll["$and"].push({ mentor_email });

        const queryMessage = queryAll;
        queryMessage["$and"].push({
          "messages._id": request.params.messageId,
        });

        let myMessage;

        try {
          // Get my message in conversation
          myMessage = await Conversation.findOne(queryAll, {
            "messages.$": 1,
          });
        } catch (err) {
          return response
            .response({ status: "err", err: "Message does not exist!" })
            .code(404);
        }

        return response.response({ status: "ok", data: myMessage }).code(200);
      } catch (err) {
        return response
          .response({ status: "err", err: "Not implemented" })
          .code(501);
      }
    },
  },
  {
    method: "DELETE",
    path: "/my/messages/{contact_email}/{messageId}",
    options: {
      auth: "jwt",
      description: "Delete specific message in conversation",
      plugins: deleteMessageSwagger,
      tags: ["api", "conversation"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(`DELETE api/v1/conversation/my/message/${request.params.contact_email}/${request.params.messageId} from 
        ${request.auth.credentials.email} Time: ${currentDate}`);
        const data = request.payload;

        // check whether acount exist
        const myAccount = await Account.findOne({
          email: request.auth.credentials.email,
        });

        const contactAccount = await Account.findOne({
          email: request.params.contact_email,
        });

        if (!(myAccount && contactAccount)) {
          return response
            .response({ status: "err", err: "Account does not exist!" })
            .code(404);
        }

        let client_email: string = null;
        let expert_email: string = null;
        let mentor_email: string = null;

        // check account type
        switch (myAccount.account_type) {
          case "client": {
            client_email = myAccount.email;
            break;
          }
          case "expert": {
            expert_email = myAccount.email;
            break;
          }
          case "mentor": {
            mentor_email = myAccount.email;
            break;
          }
        }

        let isAllright: boolean = true;
        switch (contactAccount.account_type) {
          case "client": {
            !client_email
              ? (client_email = contactAccount.email)
              : (isAllright = false);
            break;
          }
          case "expert": {
            !expert_email
              ? (expert_email = contactAccount.email)
              : (isAllright = false);
            break;
          }
          case "mentor": {
            !mentor_email
              ? (mentor_email = contactAccount.email)
              : (isAllright = false);
            break;
          }
        }

        // if myAccount.account_type === contactAccount.acount_type Conversation is not exist
        if (!isAllright) {
          return response
            .response({ status: "err", err: "Conversation does not exist" })
            .code(404);
        }

        // build query to find conversation
        const queryAll: object = {
          $and: [],
        };
        if (client_email) queryAll["$and"].push({ client_email });
        if (expert_email) queryAll["$and"].push({ expert_email });
        if (mentor_email) queryAll["$and"].push({ mentor_email });

        const queryMessage = queryAll;
        queryMessage["$and"].push({
          "messages._id": request.params.messageId,
        });

        let myMessage;

        try {
          console.log("here------------------------>>>>>>>>");
          // Get my message in conversation
          myMessage = await Conversation.findOneAndUpdate(
            queryAll,
            {
              $pull: {
                messages: { _id: request.params.messageId },
              },
            },
            { new: true }
          );
        } catch (err) {
          return response
            .response({ status: "err", err: "Message does not exist!" })
            .code(404);
        }

        return response.response({ status: "ok", data: "Delete message Success!" }).code(200);
      } catch (err) {
        return response
          .response({ status: "err", err: "Not implemented" })
          .code(501);
      }
    },
  },
  {
    method: "GET",
    path: "/download/{fileId}",
    options: {
      auth: "jwt",
      description: "download message file",
      plugins: downloadMessageFileSwagger,
      tags: ["api", "proposal"],
    },
    handler: async (request: Request, h) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(`GET api/v1/conversation/download/${request.params.fileId} from 
        ${request.auth.credentials.email} Time: ${currentDate}`);

        const bucketdb = mongoose.connection.db;
        const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
          bucketName: "messageFiles",
        });

        // const downloadfile = bucket
        // .openDownloadStream(new ObjectId(`${request.params.fileId}`))
        // .pipe(fs.createWriteStream("Contract Project Lead.docx"));
        // const cursor = bucket.find({_id: new ObjectId(`${request.params.fileId}`)});
        // for await (const docs of cursor) {
        //   console.log(docs);
        // }
        const ObjectId = mongoose.Types.ObjectId;
        let mime = require("mime-types");
        console.log("mime------------->>>>>>>>>>>>>>", "mime");
        let file = bucket.find({ _id: new ObjectId(request.params.fileId) });
        let filename;
        let contentType;
        for await (const docs of file) {
          console.log(docs);
          filename = docs.filename;
          contentType = mime.contentType(docs.filename);
        }

        const downloadStream = bucket.openDownloadStream(
          new ObjectId(request.params.fileId)
        );
        return h
          .response(downloadStream)
          .header("Content-Type", contentType)
          .header("Content-Disposition", "attachment; filename= " + filename);
      } catch (err) {
        return h.response({ status: "err", err: "Download failed" }).code(501);
      }
    },
  },
];
