"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountRoute = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const account_1 = __importDefault(require("../models/account"));
const passcode_1 = __importDefault(require("../models/passcode"));
const config_1 = __importDefault(require("../config"));
const account_2 = require("../swagger/account");
const account_3 = require("../validation/account");
const client_1 = __importDefault(require("../models/profile/client"));
const expert_1 = __importDefault(require("../models/profile/expert"));
const mentor_1 = __importDefault(require("../models/profile/mentor"));
const options = { abortEarly: false, stripUnknown: true };
exports.accountRoute = [
    {
        method: "POST",
        path: "/register",
        options: {
            description: "Register Account",
            plugins: account_2.createAccountSwagger,
            tags: ["api", "account"],
            validate: {
                payload: account_3.createAccountSchema,
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
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`POST api/v1/account/register request from ...`);
                const email = request.payload["email"];
                const account = yield account_1.default.findOne({ email });
                if (account) {
                    return response
                        .response({
                        err: "Account already exists",
                    })
                        .code(409);
                }
                // console.log("account register request ---->", request.payload);
                const newAccount = new account_1.default(request.payload);
                const { password } = newAccount;
                const hash = yield bcrypt_1.default.hash(password, 10);
                newAccount.password = hash;
                // const result = await newAccount.save();
                const token = jsonwebtoken_1.default.sign({ newAccount: newAccount }, config_1.default.jwtSecret, {
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
                const ses = new aws_sdk_1.default.SES({
                    region: config_1.default.awsRegion,
                    accessKeyId: config_1.default.awsAccessKeyId,
                    secretAccessKey: config_1.default.awsSecretAccessKey,
                });
                // const content = `Hi ${request.payload["first_name"]} ${request.payload["last_name"]}
                //                 Thanks for your interest in joining Auxilar! To complete your registration, we need you to
                //                 verify your email address."http://136.243.150.17:3000/account/verify-email/${token}"
                //                 Verify Email!
                //                 Please note that not all applications to join Auxilar are accepted.
                //                 We will notify you of our decision by email within 24 hours.
                //                 Thanks for your time,
                //                 The Auxilar Team`;
                const content = `<tr><td style="background-color:rgba(255,255,255,1);padding-top:30px;padding-bottom:30px">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tbody><tr><td align="left" style="padding-top:0;padding-bottom:20px;padding-left:30px">
        <span style="font-size:40px;color:rgb(27,158,197)">Auxilar</span>
        </td></tr>
        <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
        padding:20px"><h2 style="margin-top:0;margin-bottom:0;font-family:Helvetica,sans-serif;
        font-weight:normal;font-size:24px;line-height:30px;color:rgba(0,30,0,1)">
        Verify your email address to complete registration</h2></td></tr>
        <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
        padding-left:20px;padding-right:20px;padding-top:20px">Hi ${request.payload["first_name"]} ${request.payload["last_name"]} , </td></tr>
        <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
        padding-left:20px;padding-right:20px;padding-top:20px">
        Thanks for your interest in joining Auxilar! To complete your registration, we need you to
         verify your email address. </td></tr><tr><td style="font-family:Helvetica,Arial,sans-serif;
         font-size:16px;line-height:24px;padding:40px 20px 20px"><table style="text-align:center"
          width="100%" border="0" cellspacing="0" cellpadding="0"><tbody>
          <tr><td><div style="text-align:center;margin:0 auto"><a style="background-color:rgb(27,158,197);
          border:2px solid rgb(0,123,168);border-radius:100px;min-width:230px;color:rgba(255,255,255,1);
          white-space:nowrap;font-weight:normal;display:block;font-family:Helvetica,Arial,sans-serif;
          font-size:16px;line-height:40px;text-align:center;text-decoration:none"
          href="http://136.243.150.17:3000/account/verify-email/${token}" target="_blank"
          data-saferedirecturl="https://www.google.com/url?q="http://136.243.150.17:3000/account/verify-email/${token}">
          Verify Email</a></div></td></tr></tbody></table></td></tr><tr>
          <td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
          padding-left:20px;padding-right:20px;padding-top:20px">
          Please note that not all applications to join Auxilar are accepted.
          We will notify you of our decision by email within 24 hours. </td></tr>
          <tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:24px;
          padding-left:20px;padding-right:20px;padding-top:30px"><div style="padding-top:10px">
          Thanks for your time,<br>The Auxilar Team</div></td></tr></tbody></table></td></tr>`;
                const emailParams = {
                    Source: "galaxydragon0702@gmail.com",
                    Destination: {
                        ToAddresses: [newAccount.email],
                    },
                    Message: {
                        Subject: {
                            Data: "Verify Email",
                        },
                        Body: {
                            Html: {
                                Data: content,
                            },
                        },
                    },
                };
                ses.sendEmail(emailParams, (err, data) => {
                    if (err) {
                        console.log("Error sending email:", err);
                    }
                    else {
                        console.log("Email sent successfully:", data);
                    }
                });
                // sendMail(newAccount.email, content);
                return response
                    .response({
                    status: "ok",
                    data: "verify Email!",
                })
                    .code(201);
                // linkUrl: `localhost:3000/verify-email/${token}`,
            }
            catch (error) {
                console.log("===================================>>>>>>>>>>> ", error);
                return response.response({ status: "err", err: error }).code(500);
            }
        }),
    },
    {
        method: "GET",
        path: "/verify-email/{token}",
        options: {
            // auth: "jwt",
            description: "Verify Email",
            plugins: account_2.verifyEmailSwagger,
            tags: ["api", "account"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`GET api/v1/account/verify-email/${request.params.token} request from ...`);
                // console.log(request.params.token);
                // console.log(request.auth.credentials.accountId);
                // const account = await Account.findById(request.auth.credentials.accountId);
                const decoded = jsonwebtoken_1.default.decode(request.params.token);
                console.log(decoded);
                // console.log(decoded);
                // const account = await Account.findById(decoded.accountId);
                const account = new account_1.default(decoded.newAccount);
                // if (account) {
                account.verified_status = true;
                account.active = true;
                const currentDate = new Date().toUTCString();
                account.created_at = currentDate;
                account.last_logged_in = currentDate;
                yield account.save();
                const token = jsonwebtoken_1.default.sign({ accountId: account.id, email: account.email }, config_1.default.jwtSecret, {
                    expiresIn: "1h",
                });
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
            }
            catch (error) {
                console.log(error);
                return response.response({ err: error }).code(400);
            }
        }),
    },
    {
        method: "POST",
        path: "/signin",
        options: {
            // auth: "jwt",
            description: "Authenticate account & get token",
            plugins: account_2.signinAccountSwagger,
            tags: ["api", "account"],
            validate: {
                payload: account_3.signinAccountSchema,
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
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`POST api/v1/account/signin request from ${request.payload["email"]}`);
                const email = request.payload["email"];
                const password = request.payload["password"];
                const account = yield account_1.default.findOne({ email });
                if (!account) {
                    return response.response({ err: "Account not found!" }).code(404);
                }
                else if (!account.verified_status) {
                    return response
                        .response({ err: "Email verify is required!" })
                        .code(402);
                }
                const isMatch = yield bcrypt_1.default.compare(password, account.password);
                if (!isMatch) {
                    return response.response({ err: "Password incorrect." }).code(405);
                }
                const token = jsonwebtoken_1.default.sign({ accountId: account.id, email: account.email }, config_1.default.jwtSecret, {
                    expiresIn: "1d",
                });
                const currentDate = new Date().toUTCString();
                account.last_logged_in = currentDate;
                account.active = true;
                yield account.save();
                return response.response({ token }).code(200);
            }
            catch (error) {
                console.log(error);
                return response.response({ err: error }).code(500);
            }
        }),
    },
    {
        method: "GET",
        path: "/me",
        options: {
            auth: "jwt",
            description: "Get account by token",
            plugins: account_2.currentAccountSwagger,
            tags: ["api", "account"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`GET api/v1/account/me request from ${request.auth.credentials.email}`);
                console.log(request.auth.credentials.email);
                const account = yield account_1.default.findOne({
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
            }
            catch (error) {
                console.log(error);
                return response.response({ err: error }).code(500);
            }
        }),
    },
    {
        method: "POST",
        path: "/change-password",
        options: {
            auth: "jwt",
            description: "Change password",
            plugins: account_2.changeAccountPasswordSwagger,
            tags: ["api", "account"],
            validate: {
                payload: account_3.changeAccountPasswordSchema,
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
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`POST api/v1/account/change-password request from ${request.auth.credentials.email}`);
                const new_Password = request.payload["new_password"];
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                // if (!account) {
                //   return response
                //   .response({msg: 'Account not found'}).code(404);
                // }
                const hash = yield bcrypt_1.default.hash(new_Password, 10);
                account.password = hash;
                yield account.save();
                return response
                    .response({ msg: "Successfuly changed password" })
                    .code(200);
            }
            catch (error) {
                console.log(error);
                return response.response({ err: error }).code(500);
            }
        }),
    },
    {
        method: "POST",
        path: "/forgot-password",
        options: {
            description: "forgot password",
            plugins: account_2.forgotAccountPasswordSwagger,
            tags: ["api", "account"],
            validate: {
                payload: account_3.forgotAccountPasswordSchemna,
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
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`POST api/v1/account/forgot-password request from ...`);
                const account = yield account_1.default.findOne({
                    email: request.payload["email"],
                });
                if (!account) {
                    return response.response({ err: "Account not found" }).code(404);
                }
                const random6Digits = Math.floor(Math.random() * 1000000);
                const newPasscode = new passcode_1.default({
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
            }
            catch (error) {
                console.log(error);
                return response.response({ err: error }).code(500);
            }
        }),
    },
    {
        method: "POST",
        path: "/reset-password",
        options: {
            description: "Reset password",
            plugins: account_2.resetAccountPasswordSwagger,
            tags: ["api", "account"],
            validate: {
                payload: account_3.resetAccountPasswordSchema,
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
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`POST api/v1/account/reset-password request from ...`);
            const email = request.payload["email"];
            const code = request.payload["passcode"];
            // const {email, code, new_password} = request.payload
            const passcode = yield passcode_1.default.findOne({
                email: email,
                passcode: code,
            });
            if (!passcode) {
                return response.response({ err: "Passcode incorrect!" }).code(404);
            }
            return response.response({ msg: "Reset your password" }).code(200);
        }),
    },
    {
        method: "POST",
        path: "/update-password",
        options: {
            description: "Update password",
            plugins: account_2.updateAccountPasswordSwagger,
            tags: ["api", "account"],
            validate: {
                payload: account_3.updateAccountPasswordSchema,
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
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`POST api/v1/account/update-password request from ...`);
                // const decoded = Jwt.decode(request.params.token);
                console.log(request.payload);
                const email = request.payload["email"];
                const new_Password = request.payload["new_password"];
                const account = yield account_1.default.findOne({ email });
                if (!account) {
                    return response.response({ err: "Account not found!" }).code(404);
                }
                const hash = yield bcrypt_1.default.hash(new_Password, 10);
                account.password = hash;
                yield account.save();
                // return response.response({ account }).code(200);
                return response.response({ msg: "update Success!" }).code(200);
            }
            catch (error) {
                console.log(error);
                return response.response({ err: error }).code(500);
            }
        }),
    },
    {
        method: "GET",
        path: "/mentors",
        options: {
            auth: "jwt",
            description: "Get mentor list",
            plugins: account_2.currentAccountSwagger,
            tags: ["api", "account"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const currentDate = new Date().toUTCString();
                console.log(`GET api/v1/account/mentors request from ${request.auth.credentials.email} Time: ${currentDate}`);
                console.log(request.auth.credentials.email);
                const account = yield account_1.default.find({
                    account_type: "mentor",
                }).select({ email: 1, first_name: 1, last_name: 1 });
                // if (!account) {
                //   return response.response({ err: "Account not found!" }).code(404);
                // }
                // const fullName = account.first_name + " " + account.last_name;
                return response
                    .response({
                    account,
                })
                    .code(200);
            }
            catch (error) {
                console.log(error);
                return response.response({ err: error }).code(500);
            }
        }),
    },
    {
        method: "GET",
        path: "/profile/{accountId}",
        options: {
            auth: "jwt",
            description: "GET account profile",
            plugins: account_2.getAccountProfileSwagger,
            tags: ["api", "account"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const currentDate = new Date().toUTCString();
                console.log(`GET api/v1/account/profile/${request.params.accountId} request from ${request.auth.credentials.email} Time: ${currentDate}`);
                // Get account info
                const account = yield account_1.default.findById(request.params.accountId);
                if (!account) {
                    return response
                        .response({ status: "err", err: "Account not found!" })
                        .code(404);
                }
                // Get account profile
                let accountProfile = null;
                if (account.account_type === "client") {
                    accountProfile = yield client_1.default.aggregate([
                        { $match: { account: account._id } },
                        {
                            $lookup: {
                                from: "accounts",
                                localField: "account",
                                foreignField: "_id",
                                as: "account_info",
                                pipeline: [
                                    {
                                        $project: {
                                            _id: false,
                                            first_name: 1,
                                            last_name: 1,
                                        },
                                    },
                                ],
                            },
                        },
                    ]);
                }
                else if (account.account_type === "expert") {
                    accountProfile = yield expert_1.default.aggregate([
                        { $match: { account: account._id } },
                        {
                            $lookup: {
                                from: "accounts",
                                localField: "account",
                                foreignField: "_id",
                                as: "account_info",
                                pipeline: [
                                    {
                                        $project: {
                                            _id: false,
                                            first_name: 1,
                                            last_name: 1,
                                        },
                                    },
                                ],
                            },
                        },
                    ]);
                }
                else {
                    accountProfile = yield mentor_1.default.aggregate([
                        { $match: { account: account._id } },
                        {
                            $lookup: {
                                from: "accounts",
                                localField: "account",
                                foreignField: "_id",
                                as: "account_info",
                                pipeline: [
                                    {
                                        $project: {
                                            _id: false,
                                            first_name: 1,
                                            last_name: 1,
                                        },
                                    },
                                ],
                            },
                        },
                    ]);
                }
                if (!accountProfile) {
                    return response
                        .response({ status: "err", err: "Profile not found!" })
                        .code(404);
                }
                return response.response({ status: "ok", data: accountProfile });
            }
            catch (err) {
                return response
                    .response({ status: "err", err: "Not implemented!" })
                    .code(501);
            }
        }),
    },
];
//# sourceMappingURL=account.js.map