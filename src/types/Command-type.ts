import {
  ApplicationCommandOptionAllowedChannelTypes,
  ApplicationCommandOptionType,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
  Guild,
  GuildMember,
} from "discord.js";

export interface CommandContext {
  client: Client;
  interaction: ChatInputCommandInteraction;
  guild: Guild | null;
  member: GuildMember | null;
}

export interface AutocompleteContext {
  client: Client;
  interaction: AutocompleteInteraction;
  guild: Guild | null;
  member: GuildMember | null;
}

export type CommandOptionType = ApplicationCommandOptionType;

export interface CommandOption {
  name: string;
  description: string;
  type: CommandOptionType;
  required?: boolean;
  choices?: Array<{
    name: string;
    value: string | number;
  }>;
  options?: CommandOption[];
  autocomplete?: boolean;
  channel_types?: ApplicationCommandOptionAllowedChannelTypes[];
}

export interface SubCommand {
  name: string;
  description: string;
  options?: CommandOption[];
  type?: CommandOptionType;
}

export enum AuthPermissionLevels {
  EVERYONE = 0,
  ADMIN = 2,
  OWNER = 3,
  DEVELOPER = 4,
}

export interface AuthRequirement {
  level: AuthPermissionLevels;
}

export interface Command {
  name: string;
  description: string;
  permission: AuthRequirement;
  // Context?: InteractionContextType[];
  // integrationTypes?: ApplicationIntegrationType[];
  options?: CommandOption[];
  subcommands?: SubCommand[];
  execute: (context: CommandContext) => Promise<void>;
  autocomplete?: (context: AutocompleteContext) => Promise<void>;
}

export interface CommandHandler {
  register(command: Command): void;
  execute(context: ChatInputCommandInteraction): Promise<void>;
  getCommands(): Command[];
  getCommand(name: string): Command | undefined;
}
