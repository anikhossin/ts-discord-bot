import { Client } from "discord.js";
import Event from "../types/Event.type";
import { getClient } from "../DB/mongo.coon";




const ready: Event<"ready"> = {
  name: "ready",
  once: true,
  execute: async (client: Client) => {
    console.log(`Logged in as ${client.user?.tag}`);

    try {
      const eventHandler = (client as any)._eventHandler;

      if (!eventHandler) {
        throw new Error("EventHandler not found on client");
      }
      const slashCommandHandler = eventHandler.getSlashCommandHandler();
      await slashCommandHandler.registerCommandsWithDiscord();
      await getClient();
      console.log("Bot is ready and commands have been registered!");
    } catch (error) {
      console.error(`Error registering commands: ${error}`);
    }
  },
};

export default ready;
