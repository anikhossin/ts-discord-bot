import { Client } from "discord.js";
import { EventHandler } from "./Handlers/EventHandler";
import { config } from "dotenv";


config();

const client = new Client({
  intents: [
    "Guilds",
    "GuildMembers",
    "GuildMessages",
    "MessageContent",
    "DirectMessages",
  ],
});

let eventHandler: EventHandler;

eventHandler = new EventHandler(client);

(client as any)._eventHandler = eventHandler;

client.login(process.env.TOKEN).catch((error) => {
  console.error("Failed to login to Discord:", error);
  process.exit(1);
});

// Handle process errors
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

// Handle graceful shutdown
const shutdown = () => {
  console.log("Shutting down...");
  client.destroy();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
