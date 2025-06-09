import {
  Client,
  Collection,
  REST,
  ApplicationCommandDataResolvable,
  Routes,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";
import {
  AutocompleteContext,
  Command,
  CommandHandler,
} from "../types/Command-type";
import fs from "fs";
import path from "path";
import { authManager } from "../lib/auth";

export class SlashCommandHandler implements CommandHandler {
  private readonly client: Client;
  private readonly commands: Collection<string, Command>;
  private readonly commandsPath: string;
  private readonly rest: REST;

  constructor(client: Client) {
    this.client = client;
    this.commands = new Collection<string, Command>();
    this.commandsPath = path.join(__dirname, "..", "Commands");
    this.rest = new REST({ version: "10" }).setToken(process.env.TOKEN || "");

    this.loadCommands();
    this.setupAutocompleteHandler();
  }

  public register(command: Command): void {
    if (this.commands.has(command.name)) {
      console.warn(
        `Command '${command.name}' is already registered. Overwriting...`
      );
    }
    this.commands.set(command.name, command);
  }

  public getCommands(): Command[] {
    return [...this.commands.values()];
  }

  public getCommand(name: string): Command | undefined {
    return this.commands.get(name);
  }

  private async loadCommands(): Promise<void> {
    try {
      await this.loadCommandsFromDirectory(this.commandsPath);

      console.log(
        `Loaded ${this.commands.size} commands from ${this.commandsPath}`
      );
    } catch (error) {
      console.error(`Failed to load commands: ${error}`);
    }
  }

  private async loadCommandsFromDirectory(directory: string): Promise<void> {
    if (!fs.existsSync(directory)) {
      console.error(`Commands directory does not exist: ${directory}`);
      return;
    }
    const files = fs.readdirSync(directory);

    let success = 0;
    let failed = 0;
    let failedErros: { name: string; error: Error }[] = [];
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        await this.loadCommandsFromDirectory(filePath);
      } else if (file.endsWith(".js") || file.endsWith(".ts")) {
        try {
          if (file === "index.js" || file === "index.ts") {
            continue; // Skip index files
          }
          const commandModule = await import(filePath);
          const command: Command = commandModule.default || commandModule;

          if (
            command &&
            command.name &&
            command.description &&
            typeof command.execute === "function"
          ) {
            this.register(command);
            success++;
          } else {
            failed++;
            failedErros.push({
              name: file,
              error: new Error("Invalid command structure"),
            });
          }
        } catch (error) {
          console.error(`Failed to load command from ${filePath}: ${error}`);
        }
      }
    }
  }

  private setupAutocompleteHandler(): void {
    this.client.on("interactionCreate", async (interaction) => {
      if (interaction.isAutocomplete()) {
        await this.handleAutocomplete(interaction);
      }
    });
  }

  private async handleAutocomplete(interaction: any): Promise<void> {
    const commandName = interaction.commandName;
    const command = this.getCommand(commandName);
    if (!command || !command.autocomplete) {
      console.warn(`No autocomplete handler for command: ${commandName}`);
      return;
    }
    try {
      const context: AutocompleteContext = {
        client: this.client,
        interaction,
        guild: interaction.guild,
        member: interaction.member,
      };
      await command.autocomplete(context);
    } catch (error) {
      console.error(
        `Failed to handle autocomplete for ${commandName}: ${error}`
      );
    }
  }

  public async registerCommandsWithDiscord(): Promise<void> {
    try {
      const commandData: ApplicationCommandDataResolvable[] =
        this.getCommands().map((cmd) => ({
          name: cmd.name,
          description: cmd.description,
          // contexts: cmd.Context || [],
          // integrationTypes: cmd.integrationTypes || [],
          options:
            cmd.options?.map((option) => ({
              name: option.name,
              description: option.description,
              type: option.type as number, // Ensure type matches the expected enum value
              required: option.required,
              choices: option.choices?.map((choice) => ({
                name: choice.name,
                value: choice.value,
              })),
              autocomplete: option.autocomplete,
              channel_types: option.channel_types,
              options: option.options?.map((subOption) => ({
                name: subOption.name,
                description: subOption.description,
                type: subOption.type as number,
                required: subOption.required,
                choices: subOption.choices?.map((choice) => ({
                  name: choice.name,
                  value: choice.value,
                })),
                autocomplete: subOption.autocomplete,
                channel_types: subOption.channel_types,
              })),
            })) || [],
        }));
      console.log(`Registering ${commandData.length} commands with Discord...`);

      try {
        await this.rest.put(
          Routes.applicationCommands(this.client.user?.id || ""),
          { body: commandData }
        );
        console.log(`Successfully registered commands with Discord.`);
      } catch (error) {
        console.error(`Failed to register commands with Discord: ${error}`);
      }
    } catch (error) {
      console.error(`Failed to prepare command registration: ${error}`);
    }
  }

  public async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    const commnandName = interaction.commandName;
    const command = this.getCommand(commnandName);

    if (!command) {
      console.warn(`Command not found: ${commnandName}`);
      await interaction.reply({
        content: `Command not found: ${commnandName}`,
        flags: 64, // Ephemeral
      });
      return;
    }

    const context = {
      client: this.client,
      interaction,
      guild: interaction.guild,
      member:
        interaction.member && "user" in interaction.member
          ? (interaction.member as GuildMember)
          : null,
    };

    if (!context.guild || !context.member) {
      console.warn(`Guild not found for command: ${commnandName}`);
      await interaction.reply({
        content: "This command can only be used in a server.",
        flags: 64, // Ephemeral
      });
      return;
    }

    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        flags: 64, // Ephemeral
      });
      return;
    }

    if (
      !(await authManager.hasPermission(
        interaction.user.id,
        interaction.guild,
        command.permission.level
      ))
    ) {
      await interaction.reply({
        content: "You do not have permission to use this command.",
        flags: 64, // Ephemeral
      });
      return;
    }

    try {
      await command.execute(context);
    } catch (error) {
      console.error(`Failed to execute command ${command.name}: ${error}`);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "An error occurred while executing the command.",
          flags: 64, // Ephemeral
        });
      } else if (interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "An error occurred while executing the command.",
          flags: 64, // Ephemeral
        });
      }
    }
  }
}
