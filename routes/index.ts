import { Server } from "@hapi/hapi";

import config from "../config";

import { accountRoute } from "./account";
import { expertRoute } from "./profile/expert";
import { clientRoute } from "./profile/client";
// const prefix = `/api/${config.apiVersion}`;

const setRoutes = async (server: Server) => {
  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/account`;
  server.route(accountRoute);
  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/expert`;
  server.route(expertRoute);
  server.realm.modifiers.route.prefix = `/api/${config.apiVersion}/client`;
  server.route(clientRoute);
};
export default setRoutes;
