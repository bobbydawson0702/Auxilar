import { Request, ResponseToolkit } from '@hapi/hapi';
import { ProfileSwagger, deleteProfileSwagger, getProfileSwagger } from '../../swagger/profile/client';
import { ProfileSchema } from '../../validation/profile/client';
import Account from '../../models/account';
import Client from '../../models/profile/client';

const options = { abortEarly: false, stripUnknown: true };

export let clientRoute = [
	{
		method: 'POST',
		path: '/',
		options: {
			auth: 'jwt',
			description: 'Create or Update client profile',
			plugins: ProfileSwagger,
			tags: ['api', 'client'],
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
				console.log(`POST api/v1/client request from ${request.auth.credentials.email}`);
				const account = await Account.findById(request.auth.credentials.accountId);

				// Check account type 
				if (account.account_type !== 'client') {
					return response.response({ status: 'err', err: 'Not allowed' }).code(403);
				}
				console.log(account);

				const data = request.payload;
				console.log('data---------------------------', data);

				let birthday: Date = new Date("<yyyy-mm-dd>");
				birthday = data['birthday'];

				const clientField = {
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

				const client = await Client.findOneAndUpdate(
					{ account: account.id },
					{ $set: clientField },
					{ new: true, upsert: true, setDefaultOnInsert: true }
				);
				await client.save();

				const responseData = await client.populate('account', ['firt_name', 'last_name']);
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
			description: 'Get client profile',
			plugins: getProfileSwagger,
			tags: ['api', 'client'],
		},
		handler: async (request: Request, response: ResponseToolkit) => {
			try {
				console.log(`GET api/v1/client/ request from ${request.auth.credentials.email}`)
				const client = await Client.findOne({ account: request.auth.credentials.accountId });
				if (!client) {
					console.log('Profile not found!');
					return response.response({ status: 'err', err: 'Profile not found!' }).code(404);
				}
				const responseData = await client.populate('account', ['first_name', 'last_name']);
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
			description: 'Delete client profile',
			plugins: deleteProfileSwagger,
			tags: ['api', 'client'],
		},
		handler: async (request: Request, response: ResponseToolkit) => {
			try {
				console.log(`DELETE api/v1/client request from ${request.auth.credentials.email}`)
				const deleteStatus = await Client.deleteOne({ account: request.auth.credentials.accountId });
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