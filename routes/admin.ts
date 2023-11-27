import { Request, ResponseToolkit } from "@hapi/hapi";
import {
  deleteAccountInfoSwagger,
  getAccountInfoSwagger,
  updateAccountStatusSwagger,
} from "../swagger/admin";
import { updateAccountStatusSchema } from "../validation/admin";
import Account from "../models/account";
import Expert from "../models/profile/expert";

const options = { abortEarly: false, stripUnknown: true };
export let adminRoute = [
  {
    method: "PATCH",
    path: "/update/{account_email}",
    options: {
      auth: "jwt",
      description: "update acount status",
      plugins: updateAccountStatusSwagger,
      tags: ["api", "admin"],
      validate: {
        payload: updateAccountStatusSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return {
              err: d.message,
            };
          });
          return h.response(details).code(400).takeover();
        },
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(
          `PATCH api/v1/admin/update/${request.params.account_email} from ${request.auth.credentials.email} Time: ${currentDate}`
        );

        // check wether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check wether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }

        // check whether account exist, update status
        try {
          const data = request.payload;
          console.log(
            "account_email-------------->>>>>>",
            request.params.account_email
          );

          const account = await Account.findOneAndUpdate(
            { email: request.params.account_email },
            {
              $set: {
                active: data["active"],
              },
            }
          );

          return response
            .response({ status: "ok", data: "Update account status success!" })
            .code(200);
        } catch (err) {
          return response
            .response({ status: "err", err: "Account not found" })
            .code(404);
        }
      } catch (error) {
        return response.response({ staus: "err", err: error }).code(501);
      }
    },
  },
  {
    method: "GET",
    path: "/{accounts_per_page}/{page_index}",
    options: {
      auth: "jwt",
      description: "Get all account info",
      plugins: getAccountInfoSwagger,
      tags: ["api", "admin"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(
          `GET api/v1/admin/ from ${request.auth.credentials.email} Time: ${currentDate}`
        );

        const accounts_per_page: number = Number(
          request.params.accounts_per_page
        );
        const page_index: number = Number(request.params.page_index);
        console.log(
          "account_per_page --------------->>>>>>>",
          typeof accounts_per_page
        );
        console.log("page_index --------------->>>>>>>", typeof page_index);
        // check wether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check wether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }

        const totalCount = await Account.find({}).count();
        console.log("totalCount--------------->>>>>>>>>>", totalCount);

        const accountinfo = await Account.aggregate([
          {
            $project: {
              first_name: 1,
              last_name: 1,
              email: 1,
              account_type: 1,
              active: 1,
              _id: 0,
            },
          },
          {
            $skip: accounts_per_page * (page_index - 1),
          },
          {
            $limit: accounts_per_page,
          },
        ]);
        return response
          .response({ status: "ok", data: { totalCount, accountinfo } })
          .code(200);
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },
  {
    method: "DELETE",
    path: "/delete/{account_email}",
    options: {
      auth: "jwt",
      description: "Delete account",
      plugins: deleteAccountInfoSwagger,
      tags: ["api", "admin"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(
          `DELETE api/v1/admin/${request.params.account_email} from ${request.auth.credentials.email} Time: ${currentDate}`
        );

        // check wether admin exist
        const admin = await Account.findOne({
          email: request.auth.credentials.email,
        });

        // check wether is admin
        if (admin.account_type !== "admin") {
          return response
            .response({ status: "err", err: "Not allowed account" })
            .code(403);
        }

        try {
          const deletedAccount = await Account.deleteOne({
            email: request.params.account_email,
          });

          return response
            .response({ status: "ok", data: deletedAccount })
            .code(200);
        } catch (error) {
          return response
            .response({ status: "err", err: "Account not found!" })
            .code(404);
        }
      } catch (error) {
        return response.response({ status: "err", err: error }).code(501);
      }
    },
  },
];
