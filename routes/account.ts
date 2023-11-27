import { Request, ResponseToolkit } from "@hapi/hapi";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Account from "../models/account";
import Passcode from "../models/passcode";
import config from "../config";
import {
  createAccountSwagger,
  verifyEmailSwagger,
  signinAccountSwagger,
  currentAccountSwagger,
  changeAccountPasswordSwagger,
  forgotAccountPasswordSwagger,
  updateAccountPasswordSwagger,
  resetAccountPasswordSwagger,
} from "../swagger/account";
import {
  changeAccountPasswordSchema,
  createAccountSchema,
  forgotAccountPasswordSchemna,
  resetAccountPasswordSchema,
  signinAccountSchema,
  updateAccountPasswordSchema,
} from "../validation/account";
import sendMail from "../utils/sendMail";

const options = { abortEarly: false, stripUnknown: true };

export let accountRoute = [
  {
    method: "POST",
    path: "/register",
    options: {
      description: "Register Account",
      plugins: createAccountSwagger,
      tags: ["api", "account"],
      validate: {
        payload: createAccountSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return {
              // message: d.message,
              err: d.message,
              // path: d.path,
            };
          });
          return h.response(details).code(400).takeover();
        },
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        console.log(`POST api/v1/account/register request from ...`);
        const email = request.payload["email"];
        const account = await Account.findOne({ email });
        if (account) {
          return response
            .response({
              err: "Account already exists",
            })
            .code(409);
        }
        // console.log("account register request ---->", request.payload);

        const newAccount = new Account(request.payload);
        const { password } = newAccount;
        const hash = await bcrypt.hash(password, 10);
        newAccount.password = hash;

        // const result = await newAccount.save();
        const token = Jwt.sign({ newAccount: newAccount }, config.jwtSecret, {
          expiresIn: "1day",
        });

        const baseUrl = `${request.server.info.protocol}://${request.info.host}`;
        // console.log(baseUrl);
        // const content =

        // return response
        // .response({
        //   email: result.email,
        //   first_name: result.first_name,
        //   last_name: result.last_name,
        // })
        // .code(201);

        // front-end URL
        // Create a transporter object using the SMTP transport
        // const transporter = nodemailer.createTransport({
        //   service: "Gmail",
        //   auth: {
        //     user: "oliver970315@gmail.com", // replace with your gmail address
        //     pass: "Qwe1234!@#$" // replace with your gmail password or app-specific password if enabled
        //   }
        // });
        // console.log("1");
        // const content = `<div style="background-color: #f2f2f2; padding: 20px; border-radius: 10px;"><h1 style="font-size: 36px; color: #333; margin-bottom: 20px;">Hello</h1><p style="font-size: 18px; color: #666; margin-bottom: 20px;">Welcome To Homepage</p><p style="font-size: 18px; color: #666; margin-bottom: 40px;">This is your email verification link. Please click the button below to verify your email:</p><a href="${baseUrl}/api/v1/user/verify-email/${token}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-size: 18px;">Verify Email</a></div>`;
        const content = `<div style="background-color: #f2f2f2; padding: 20px; border-radius: 10px;">
        <h1 style="font-size: 36px; color: #333; margin-bottom: 20px;">Hello</h1>
        <p style="font-size: 18px; color: #666; margin-bottom: 20px;">
        Welcome To Homepage
        </p>
        <p style="font-size: 18px; color: #666; margin-bottom: 40px;">
        This is your email verification link. Please click the button below to verify your email:
        </p>
        <a href="/account/verify-email/${token}" style="background-color: #4CAF50; 
        color: white; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-size: 18px;">Verify Email</a></div>`;
        // const mailOptions = {
        //   from: "oliver970315@gmail.com", // replace with your email address
        //   to: "yujikoyama485@gmail.com", // replace with recipient's email address
        //   subject: "Email Verification",
        //   html: content
        // };
        // console.log("2");
        // // Send the email
        // try {
        //   console.log("tryign....")
        //   transporter.sendMail(mailOptions, (error, info) => {
        //     console.log("email send try...");
        //     if (error) {
        //       console.log(error);
        //       return response.response(error).code(500);
        //     } else {
        //       console.log("Email sent: " + info.response);
        //       return response
        //         .response({
        //           msg: "register Success! please verify your email."
        //         })
        //         .code(201);
        //     }
        //   });
        // } catch (error) {
        //   console.log("EEEEEEEEERRRRRRRRRR", error);
        // }
        // console.log("3");
        sendMail(newAccount.email, content);
        return response
          .response({
            status: "ok",
            data: "register Sucess! Please verify your email.",
          })
          .code(201);
        // linkUrl: `localhost:3000/verify-email/${token}`,
      } catch (error) {
        console.log("===================================>>>>>>>>>>> ", error);
        return response.response({ status: 'err', err: error }).code(500);
      }
    },
  },
  {
    method: "GET",
    path: "/verify-email/{token}",
    options: {
      // auth: "jwt",
      description: "Verify Email",
      plugins: verifyEmailSwagger,
      tags: ["api", "account"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        console.log(
          `GET api/v1/account/verify-email/${request.params.token} request from ...`
        );

        // console.log(request.params.token);
        // console.log(request.auth.credentials.accountId);
        // const account = await Account.findById(request.auth.credentials.accountId);
        const decoded = Jwt.decode(request.params.token);
        console.log(decoded);
        // console.log(decoded);
        // const account = await Account.findById(decoded.accountId);
        const account = new Account(decoded.newAccount);
        // if (account) {
        account.verified_status = true;
        account.active = true;
        const currentDate = new Date().toUTCString();
        account.created_at = currentDate;
        account.last_logged_in = currentDate;
        await account.save();

        const token = Jwt.sign(
          { accountId: account.id, email: account.email },
          config.jwtSecret,
          {
            expiresIn: "1h",
          }
        );

        return response
          .response({
            msg: "Verify Email Success",
          })
          .code(200);
        // }
        // return response
        //   .response({
        //     err: verifyEmailSwagger["hapi-swagger"].responses[400].description,
        //   })
        //   .code(400);
      } catch (error) {
        console.log(error);
        return response.response({ err: error }).code(400);
      }
    },
  },
  {
    method: "POST",
    path: "/signin",
    options: {
      // auth: "jwt",
      description: "Authenticate account & get token",
      plugins: signinAccountSwagger,
      tags: ["api", "account"],
      validate: {
        payload: signinAccountSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return {
              // message: d.message,
              err: d.message,
              // path: d.path,
            };
          });
          return h.response(details).code(400).takeover();
        },
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        console.log(
          `POST api/v1/account/signin request from ${request.payload["email"]}`
        );

        const email = request.payload["email"];
        const password = request.payload["password"];
        const account = await Account.findOne({ email });
        if (!account) {
          return response.response({ err: "Account not found!" }).code(404);
        } else if (!account.verified_status) {
          return response
            .response({ err: "Email verify is required!" })
            .code(402);
        }

        const isMatch = await bcrypt.compare(password, account.password);
        if (!isMatch) {
          return response.response({ err: "Password incorrect." }).code(405);
        }

        const token = Jwt.sign(
          { accountId: account.id, email: account.email },
          config.jwtSecret,
          {
            expiresIn: "1d",
          }
        );
        const currentDate = new Date().toUTCString();
        account.last_logged_in = currentDate;
        account.active = true;
        await account.save();

        return response.response({ token }).code(200);
      } catch (error) {
        console.log(error);
        return response.response({ err: error }).code(500);
      }
    },
  },
  {
    method: "GET",
    path: "/me",
    options: {
      auth: "jwt",
      description: "Get account by token",
      plugins: currentAccountSwagger,
      tags: ["api", "account"],
    },

    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        console.log(
          `GET api/v1/account/me request from ${request.auth.credentials.email}`
        );
        console.log(request.auth.credentials.email);
        const account = await Account.findOne({
          email: request.auth.credentials.email,
        }).select("-password");
        if (!account) {
          return response.response({ err: "Account not found!" }).code(404);
        }
        const fullName = account.first_name + " " + account.last_name;
        return response
          .response({
            account,
          })
          .code(200);
      } catch (error) {
        console.log(error);
        return response.response({ err: error }).code(500);
      }
    },
  },
  {
    method: "POST",
    path: "/change-password",
    options: {
      auth: "jwt",
      description: "Change password",
      plugins: changeAccountPasswordSwagger,
      tags: ["api", "account"],
      validate: {
        payload: changeAccountPasswordSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return {
              // message: d.message,
              err: d.message,
              // path: d.path,
            };
          });
          return h.response(details).code(400).takeover();
        },
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        console.log(
          `POST api/v1/account/change-password request from ${request.auth.credentials.email}`
        );
        const new_Password = request.payload["new_password"];
        const account = await Account.findById(
          request.auth.credentials.accountId
        );
        // if (!account) {
        //   return response
        //   .response({msg: 'Account not found'}).code(404);
        // }
        const hash = await bcrypt.hash(new_Password, 10);
        account.password = hash;
        await account.save();
        return response
          .response({ msg: "Successfuly changed password" })
          .code(200);
      } catch (error) {
        console.log(error);
        return response.response({ err: error }).code(500);
      }
    },
  },
  {
    method: "POST",
    path: "/forgot-password",
    options: {
      description: "forgot password",
      plugins: forgotAccountPasswordSwagger,
      tags: ["api", "account"],
      validate: {
        payload: forgotAccountPasswordSchemna,
        options,
        failAction: (requeset, h, error) => {
          const details = error.details.map((d) => {
            return {
              // message: d.message,
              err: d.message,
              // path: d.path,
            };
          });
          return h.response(details).code(400).takeover();
        },
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        console.log(`POST api/v1/account/forgot-password request from ...`);
        const account = await Account.findOne({
          email: request.payload["email"],
        });
        if (!account) {
          return response.response({ err: "Account not found" }).code(404);
        }

        const random6Digits = Math.floor(Math.random() * 1000000);

        const newPasscode = new Passcode({
          email: account.email,
          passcode: random6Digits,
        });
        newPasscode.save();

        // const token = Jwt.sign(
        //   { accountId: account.id, email: account.email },
        //   config.jwtSecret,
        //   {
        //     expiresIn: "1day",
        //   }
        // );

        const baseUrl = `${request.server.info.protocol}://${request.info.host}`;
        // linkUrl: `localhost:3000/account/update-password/${token}`,
        const content = `<div style="background-color: #f2f2f2; padding: 20px; border-radius: 10px">
        <h1 style="font-size: 36px; color: #333; margin-bottom: 20px">Hello</h1>
        <p style="font-size: 18px; color: #666; margin-bottom: 20px">
          Welcome To Homepage
        </p>
        <p style="font-size: 18px; color: #666; margin-bottom: 40px">
          This is your email verification link. Please type in this number to
          reset your password
        </p>
        <a
          href="localhost:3000/update-password/"
          style="
            background-color: #4caf50;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 10px;
            font-size: 18px;
          "
          >${random6Digits}</a
        >
      </div>`;
        return response
          .response({
            msg: "reset password!",
            htmlContent: content,
          })
          .code(200);
      } catch (error) {
        console.log(error);
        return response.response({ err: error }).code(500);
      }
    },
  },
  {
    method: "POST",
    path: "/reset-password",
    options: {
      description: "Reset password",
      plugins: resetAccountPasswordSwagger,
      tags: ["api", "account"],
      validate: {
        payload: resetAccountPasswordSchema,
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
      console.log(`POST api/v1/account/reset-password request from ...`);
      const email = request.payload["email"];
      const code = request.payload["passcode"];
      // const {email, code, new_password} = request.payload
      const passcode = await Passcode.findOne({
        email: email,
        passcode: code,
      });

      if (!passcode) {
        return response.response({ err: "Passcode incorrect!" }).code(404);
      }

      return response.response({ msg: "Reset your password" }).code(200);
    },
  },

  {
    method: "POST",
    path: "/update-password",
    options: {
      description: "Update password",
      plugins: updateAccountPasswordSwagger,
      tags: ["api", "account"],
      validate: {
        payload: updateAccountPasswordSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return {
              // message: d.message,
              err: d.message,
              // path: d.path,
            };
          });
          return h.response(details).code(400).takeover();
        },
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        console.log(`POST api/v1/account/update-password request from ...`);
        // const decoded = Jwt.decode(request.params.token);
        console.log(request.payload);
        const email = request.payload["email"];
        const new_Password = request.payload["new_password"];
        const account = await Account.findOne({ email });
        if (!account) {
          return response.response({ err: "Account not found!" }).code(404);
        }
        const hash = await bcrypt.hash(new_Password, 10);
        account.password = hash;
        await account.save();
        // return response.response({ account }).code(200);
        return response.response({ msg: "update Success!" }).code(200);
      } catch (error) {
        console.log(error);
        return response.response({ err: error }).code(500);
      }
    },
  },

  {
    method: "GET",
    path: "/mentors",
    options: {
      auth: "jwt",
      description: "Get mentor list",
      plugins: currentAccountSwagger,
      tags: ["api", "account"],
    },

    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const currentDate = new Date().toUTCString();
        console.log(
          `GET api/v1/account/mentors request from ${request.auth.credentials.email} Time: ${currentDate}`
        );
        console.log(request.auth.credentials.email);
        const account = await Account.find({
          account_type: "mentor",
        }).select({ email: 1, _id: false });
        // if (!account) {
        //   return response.response({ err: "Account not found!" }).code(404);
        // }
        // const fullName = account.first_name + " " + account.last_name;
        return response
          .response({
            account,
          })
          .code(200);
      } catch (error) {
        console.log(error);
        return response.response({ err: error }).code(500);
      }
    },
  },
];
