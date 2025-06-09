import { AuthPermissionLevels, Command } from "../types/Command-type";

const ping: Command = {
  name: "ping",
  description: "Check if the bot is online",
  permission: { level: AuthPermissionLevels.EVERYONE },
  execute: async ({ interaction }) => {
    await interaction.reply("Pong!");
  },
};

export default ping;
