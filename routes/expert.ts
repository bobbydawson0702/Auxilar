import { Request, ResponseToolkit } from "@hapi/hapi";
// import Jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
// import fs from 'fs';
// import { Path } from "mongoose";
// import process from "process";

import Account from '../models/account';
// import config from '../config';
import { ProfileSwagger, deleteProfileSwagger, getProfileSwagger } from "../swagger/expert";
import { ProfileSchema } from "../validation/expert";
import Expert from "../models/expert";
import { getAllSkills } from "../swagger/skill";
import Skill from "../models/skill";
import Major from "../models/major";


const options = { abortEarly: false, stripUnknown: true };

export let expertRoute = [
  {
    method: 'POST',
    path: '/',
    // config: {
    options: {
      auth: 'jwt',
      description: 'Create or Update expert profile',
      plugins: ProfileSwagger,
      tags: ['api', 'expert'],
      validate: {
        payload: ProfileSchema,
        options,
        failAction: (requeset, h, error) => {
          const details = error.details.map((d) => {
            return { err: d.message, path: d.path }
          })
          return h.response(details).code(400).takeover();
        }
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        console.log(`POST api/v1/expert request from ${request.auth.credentials.email}`)
        const account = await Account.findById(request.auth.credentials.accountId);
        if (!account) {
          return response.response({ status: 'err', err: 'Account not found!' }).code(404);
        }
        // if (expert) {
        //   return response.response({ status: 'err', err: 'ExpertProfile already exist!' }).code(409);
        // }
        console.log(account);

        const data = request.payload;
        console.log('data---------------', data);

        const expertField = {
          account: account.id,
          address: data['address'],
          post_number: data['post_number'],
          languages: data['languages'],
          avatar: data['avatar'] ?? null,
          rating: data['rating'],
          summary: data['summary'],
          verified_by: data['verified_by'],
          portfolios: data['portfolios'],
          skills: data['skills'],
          majors: data['majors'],
        }

        const expert = await Expert.findOneAndUpdate(
          { account: account.id },
          { $set: expertField },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        await expert.save();

        const responseData = await expert.populate('account', ['first_name', 'last_name', 'email']);
        console.log(`response data : ${responseData}`);

        return response.response({ status: 'ok', data: responseData }).code(201);
      } catch (error) {
        return response.response({ status: 'err', err: error }).code(400);
      }
    }
  },
  {
    method: 'GET',
    path: '/',
    options: {
      auth: 'jwt',
      description: 'Get expert profile',
      plugins: getProfileSwagger,
      tags: ['api', 'expert'],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        console.log(`GET api/v1/expert/ request from ${request.auth.credentials.email}`)
        const expert = await Expert.findOne({ account: request.auth.credentials.accountId });
        if (!expert) {
          console.log('Profile not found!');
          return response.response({ status: 'err', err: 'Profile not found!' }).code(404);
        }
        const responseData = await expert.populate('account', ['first_name', 'last_name', 'email']);
        console.log('request success')
        console.log(`response data : ${responseData}`);
        return response.response({ status: 'ok', data: responseData }).code(201);
      } catch (error) {
        return response.response({ status: 'err', err: error }).code(500);
      }
    }
  },
  {
    method: 'GET',
    path: '/all-skills',
    options: {
      auth: 'jwt',
      description: 'Get all recorded Skills',
      plugins: getAllSkills,
      tags: ['api', 'expert'],
    },

    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        console.log(`GET api/v1/expert/all-skills request from ${request.auth.credentials.email}`)
        const allSkills = await Skill.find();
        if (!allSkills) {
          return response.response({ status: 'err', err: 'Recorded skill not found!' }).code(404);
        }
        return response.response({ status: 'ok', data: allSkills }).code(201);
      } catch (error) {
        return response.response({ status: 'err', err: error }).code(500);
      }
    }
  },

  {
    method: 'GET',
    path: '/all-majors',
    options: {
      auth: 'jwt',
      description: 'Get all recorded Majors',
      plugins: getAllSkills,
      tags: ['api', 'expert'],
    },

    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        console.log(`GET api/v1/expert/all-majors request from ${request.auth.credentials.email}`)
        const allMajors = await Major.find();
        if (!allMajors) {
          return response.response({ status: 'err', err: 'Recorded major not found!' }).code(404);
        }
        return response.response({ status: 'ok', data: allMajors }).code(201);
      } catch (error) {
        return response.response({ status: 'err', err: error }).code(500);
      }
    }
  },
  {
    method: 'DELETE',
    path: '/',
    options: {
      auth: 'jwt',
      description: 'Delete expert profile',
      plugins: deleteProfileSwagger,
      tags: ['api', 'expert'],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        console.log(`DELETE api/v1/expert request from ${request.auth.credentials.email}`)
        const deleteStatus = await Expert.deleteOne({ account: request.auth.credentials.accountId });
        console.log('delete result ----------->', deleteStatus);
        if (deleteStatus.deletedCount)
          return response.response({ status: 'ok', data: 'Successfuly deleted!' }).code(201);
        else
          return response.response({ status: 'err', err: "Profile not found!" }).code(404);
      } catch (error) {
        return response.response({ status: 'err', err: error }).code(500);
      }
    }
  }
]