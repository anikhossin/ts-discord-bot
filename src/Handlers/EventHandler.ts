import { Client, ClientEvents } from "discord.js";
import Event from "../types/Event.type";
import path from "path";
import fs from "fs";
import { SlashCommandHandler } from "./slashCommandHandler";
import { InteractionComponentHandler } from "./ComponentHandler";

export class EventHandler {
  private readonly client: Client;
  private readonly events: Map<string, Event<keyof ClientEvents>>;
  private readonly eventsPath: string;
  private readonly slashCommandHandler: SlashCommandHandler;
  private readonly componentHandler: InteractionComponentHandler;

  constructor(client: Client) {
    this.client = client;
    this.events = new Map();

    // Use dist directory when running compiled code, src when developing

    this.eventsPath = path.join(__dirname, "..", "Events");

    this.slashCommandHandler = new SlashCommandHandler(client);
    this.componentHandler = new InteractionComponentHandler(client);

    // Initialize events
    this.loadEvents();

    // Set up the interactionCreate event to handle commandsd
    this.client.on("interactionCreate", async (interaction) => {
      if (interaction.isCommand() && interaction.isChatInputCommand()) {
        await this.slashCommandHandler.execute(interaction);
      }
    });
  }

  /**
   * Get the slash command handler
   */
  public getSlashCommandHandler(): SlashCommandHandler {
    return this.slashCommandHandler;
  }
  public getComponentHandler(): InteractionComponentHandler {
    return this.componentHandler;
  }

  /**
   * Load all events from the Events directory
   */
  private async loadEvents(): Promise<void> {
    // Create the directory if it doesn't exist
    if (!fs.existsSync(this.eventsPath)) {
      fs.mkdirSync(this.eventsPath, { recursive: true });
      console.log(`Created events directory: ${this.eventsPath}`);
      return;
    }

    try {
      // Find all event files
      await this.loadEventsFromDirectory(this.eventsPath);
      console.log(`Loaded ${this.events.size} events.`);
    } catch (error) {
      console.error(`Error loading events: ${error}`);
    }
  }

  /**
   * Recursively load events from a directory
   */
  private async loadEventsFromDirectory(directoryPath: string): Promise<void> {
    if (!fs.existsSync(directoryPath)) {
      return;
    }

    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Recursively load events from subdirectories
        await this.loadEventsFromDirectory(filePath);
      } else {
        // Use .js extension when running compiled code
        const validExt =
          process.env.NODE_ENV === "production" ? ".js" : [".js", ".ts"];
        const isValidFile = Array.isArray(validExt)
          ? validExt.some((ext) => file.endsWith(ext))
          : file.endsWith(validExt);

        if (isValidFile) {
          try {
            // Skip index files
            if (file === "index.js" || file === "index.ts") continue;

            // Import the event file
            const eventModule = await import(filePath);
            const event: Event<keyof ClientEvents> =
              eventModule.default || eventModule;

            // Check if the imported module has a valid event structure
            if (event.name && typeof event.execute === "function") {
              this.registerEvent(event);
              console.log(`Loaded event: ${event.name}`);
            } else {
              console.warn(`Invalid event structure in file: ${filePath}`);
            }
          } catch (error) {
            console.error(
              `Error loading event from file ${filePath}: ${error}`
            );
          }
        }
      }
    }
  }

  /**
   * Register an event with the client
   */
  private registerEvent<K extends keyof ClientEvents>(event: Event<K>): void {
    if (this.events.has(event.name)) {
      console.warn(
        `Event '${event.name}' is already registered. Overwriting...`
      );
    }

    this.events.set(event.name, event as unknown as Event<keyof ClientEvents>);

    // Register the event with Discord.js
    if (event.once) {
      this.client.once(event.name, (...args) => {
        try {
          event.execute(this.client, ...args);
        } catch (error) {
          console.error(`Error in event '${event.name}': ${error}`);
        }
      });
    } else {
      this.client.on(event.name, (...args) => {
        try {
          event.execute(this.client, ...args);
        } catch (error) {
          console.error(`Error in event '${event.name}': ${error}`);
        }
      });
    }
  }
}
