import { Server } from "socket.io";
import Account from "../models/account";

const registerSocketServer = async (server) => {
  // const admin = await Account.findOne({ account_type: "admin" });
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", (socket) => {
    console.log(`account connected ${socket.id}`);
    socket.on("login", async (data) => {
      const account = await Account.findOne({ email: data });
      if (account) {
        if (account.account_type === "admin") {
          socket["account_type"] = 0;
          console.log("admin has joined in chat room");
        } else {
          socket["account_type"] = 1;
          console.log(data + "logged in chat room");
        }
        socket["email"] = account.email;
        socket.join(account.email);
      }
    });
    socket.on("newMessage", (data) => {
      console.log(data);
      console.log(socket["account_type"]);
      if (data["to"] !== "admin") 
        io.to(data["to"]).emit("messageFromServer", data);
      else io.to(data["from"]).emit("messageFromServer", data);
    });
    socket.on("currentAccount", (data) => {
      console.log(data);
      socket.leave(socket["currentAccount"]);
      socket["currentAccount"] = data;
      socket.join(data);
    });
    socket.on("disconnect", () => {
      console.log(socket["email"] + " disconnected");
    });
  });
};

export default registerSocketServer;
