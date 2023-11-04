import { Request, ResponseToolkit } from '@hapi/hapi';
import { ProfileSwagger, deleteProfileSwagger, getProfileSwagger } from '../../swagger/profile/mentor';
import { ProfileSchema } from '../../validation/profile/mentor';
import Account from '../../models/account';
import Mentor from '../../models/profile/mentor';

const options = { abortEarly: false, stripUnknown: true };

export let mentorRoute = [
	{
		method: 'POST',
		path: '/',
		options: {
			auth: 'jwt',
			description: 'Create or Update mentor profile',
			plugins: ProfileSwagger,
			tags: ['api', 'mentor'],
			validate: {
				payload: ProfileSchema,
				options,
				failAction: (request, h, error) => {
					const details = error.details.map((d) => {
						return { err: d.message, path: d.path }
					})
					return h.response(details).code(400).takeover();
				}
			}
		},
		handler: async (request: Request, response: ResponseToolkit) => {
			try {
				console.log(`POST api/v1/mentor request from ${request.auth.credentials.email}`);
				const account = await Account.findById(request.auth.credentials.accountId);

				// Check account type 
				if (account.account_type !== 'mentor') {
					return response.response({ status: 'err', err: 'Not allowed' }).code(403);
				}
				console.log(account);

				const data = request.payload;
				console.log('data---------------------------', data);

				let birthday: Date = new Date("<yyyy-mm-dd>");
				birthday = data['birthday'];

				const mentorField = {
					email: account.email,
					avatar: data['avatar'] ?? null,
					birthday: birthday,
					country: data['country'],
					state: data['state'],
					city: data['city'],
					address: data['address'],
					languages: data['languages'],
					soial_media: data['social_media'] ?? null,
					payment_verify: data['payment_verify'] ?? null
				}

				const mentor = await Mentor.findOneAndUpdate(
					{ account: account.id },
					{ $set: mentorField },
					{ new: true, upsert: true, setDefaultOnInsert: true }
				);
				await mentor.save();

				const responseData = await mentor.populate('account', ['firt_name', 'last_name']);
				console.log(`response data: ${responseData}`);

				// return response.response({ status: 'ok', data: 'Profile created successfully' }).code(201);
				return response.response({ status: 'ok', data: responseData }).code(201);

			} catch (error) {
				return response.response({ status: 'err', err: error }).code(501);
			}
		}
	},
	{
		method: 'GET',
		path: '/',
		options: {
			auth: 'jwt',
			description: 'Get mentor profile',
			plugins: getProfileSwagger,
			tags: ['api', 'mentor'],
		},
		handler: async (request: Request, response: ResponseToolkit) => {
			try {
				console.log(`GET api/v1/mentor/ request from ${request.auth.credentials.email}`)
				const mentor = await Mentor.findOne({ account: request.auth.credentials.accountId });
				if (!mentor) {
					console.log('Profile not found!');
					return response.response({ status: 'err', err: 'Profile not found!' }).code(404);
				}
				const responseData = await mentor.populate('account', ['first_name', 'last_name']);
				console.log('request success')
				console.log(`response data : ${responseData}`);
				return response.response({ status: 'ok', data: responseData }).code(200);
			} catch (error) {
				return response.response({ status: 'err', err: error }).code(501);
			}
		}
	},

	{
		method: 'DELETE',
		path: '/',
		options: {
			auth: 'jwt',
			description: 'Delete mentor profile',
			plugins: deleteProfileSwagger,
			tags: ['api', 'mentor'],
		},
		handler: async (request: Request, response: ResponseToolkit) => {
			try {
				console.log(`DELETE api/v1/mentor request from ${request.auth.credentials.email}`)
				const deleteStatus = await Mentor.deleteOne({ account: request.auth.credentials.accountId });
				console.log('delete result ----------->', deleteStatus);
				if (deleteStatus.deletedCount)
					return response.response({ status: 'ok', data: 'Successfuly deleted!' }).code(200);
				else
					return response.response({ status: 'err', err: "Profile not found!" }).code(404);
			} catch (error) {
				return response.response({ status: 'err', err: error }).code(501);
			}
		}
	},

]