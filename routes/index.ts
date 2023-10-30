import { Server } from "@hapi/hapi";

import config from "../config";

import { accountRoute } from "./account";
import { expertRoute } from "./expert";
// const prefix = `/api/${config.apiVersion}`;

const setRoutes = async (server: Server) => {
  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/account`;
  server.route(accountRoute);
  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/expert`;
  server.route(expertRoute);
};
export default setRoutes;
