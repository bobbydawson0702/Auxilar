import { Request, ResponseToolkit } from "@hapi/hapi";


const options = { abortEarly: false, stripUnknown: true};

export let messageRoute = [
  {
    method: 'POST',
    path: '/'

  }
]