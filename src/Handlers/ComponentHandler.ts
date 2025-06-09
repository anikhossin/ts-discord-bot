import {
  ButtonInteraction,
  Client,
  Collection,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
} from "discord.js";
import { Component, ComponentHandler } from "../types/Component.type";
import path from "path";
import fs from "fs";


export class InteractionComponentHandler implements ComponentHandler {
  private readonly client: Client;
  private readonly components: Collection<string, Component>;
  private readonly componentsPath: string;

  constructor(client: Client) {
    this.client = client;
    this.components = new Collection<string, Component>();

    // Use dist directory when running compiled code, src when developing
    this.componentsPath = path.join(__dirname, "..", "Components");

    // Initialize components when handler is created
    this.loadComponents();

    // Set up interaction handling
    this.client.on("interactionCreate", async (interaction) => {
      // Handle button interactions
      if (interaction.isButton()) {
        await this.execute(interaction);
      }

      // Handle select menu interactions - updated to support StringSelectMenu
      else if (interaction.isStringSelectMenu()) {
        await this.execute(interaction as StringSelectMenuInteraction);
      }
      // Legacy support for SelectMenu if needed
      else if (interaction.isStringSelectMenu()) {
        await this.execute(interaction);
      }

      // Handle modal submit interactions
      else if (interaction.isModalSubmit()) {
        await this.execute(interaction);
      }
    });
  }

  /**
   * Register a single component
   */
  public register(component: Component): void {
    if (this.components.has(component.customId)) {
      console.warn(
        `Component with customId '${component.customId}' is already registered. Overwriting.`
      );
    }
    this.components.set(component.customId, component);
  }

  /**
   * Get all registered components
   */
  public getComponents(): Component[] {
    return [...this.components.values()];
  }

  /**
   * Get a component by customId
   */
  public getComponent(customId: string): Component | undefined {
    // First check for exact match
    const exactMatch = this.components.get(customId);
    if (exactMatch) return exactMatch;

    // If no exact match, check for prefix matches
    return this.components.find(
      (component) =>
        component.isPrefixMatch && customId.startsWith(component.customId)
    );
  }

  /**
   * Load all components from the Components directory
   */
  private async loadComponents(): Promise<void> {
    // Create the directory if it doesn't exist
    if (!fs.existsSync(this.componentsPath)) {
      fs.mkdirSync(this.componentsPath, { recursive: true });
      console.log(`Created components directory: ${this.componentsPath}`);
      return;
    }

    try {
      // Recursively find all component files
      await this.loadComponentsFromDirectory(this.componentsPath);
      console.log(`Loaded ${this.components.size} components.`);
    } catch (error) {
      console.error("Error loading components:", error);
    }
  }

  /**
   * Recursively load components from a directory
   */
  private async loadComponentsFromDirectory(
    directoryPath: string
  ): Promise<void> {
    if (!fs.existsSync(directoryPath)) {
      return;
    }

    const files = fs.readdirSync(directoryPath);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let errorFiles: { file: string; error: Error }[] = [];

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Recursively load components from subdirectories
        await this.loadComponentsFromDirectory(filePath);
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

            // Import the component file
            const componentModule = await import(filePath);
            const component: Component =
              componentModule.default || componentModule;

            // Check if the imported module has a valid component structure
            if (component.customId && typeof component.execute === "function") {
              this.register(component);
              successCount++;
            } else {
              console.warn(`Invalid component structure in file: ${filePath}`);
              skippedCount++;
              errorFiles.push({
                file: filePath,
                error: new Error("Invalid component structure"),
              });
            }
          } catch (error) {
            console.error(
              `Error loading component from file ${filePath}: ${error}`
            );
            errorCount++;
            errorFiles.push({ file: filePath, error: error as Error });
          }
        }
      }
    }
  }

  /**
   * Handle an interaction
   */
  public async execute(
    interaction:
      | ButtonInteraction
      | ModalSubmitInteraction
      | StringSelectMenuInteraction
  ): Promise<void> {
    const customId = interaction.customId;
    const component = this.getComponent(customId);

    if (!component) {
      console.warn(
        `No handler found for component with customId: ${customId}`
      );
      return;
    }

    // Check if component is enabled
    if (component.enabled === false) {
      await interaction.reply({
        content: "This component is currently disabled.",
        flags: "Ephemeral",
      });
      return;
    }

    try {
      // Create component context
      const context = {
        client: this.client,
        interaction,
      };

      // Run pre-execution hook if it exists
      if (component.beforeExecute) {
        const shouldContinue = await component.beforeExecute(context);
        if (!shouldContinue) {
          return;
        }
      }

      // Execute the component
      await component.execute(context);

      // Run post-execution hook if it exists
      if (component.afterExecute) {
        await component.afterExecute(context);
      }
    } catch (error) {
      console.error(`Error executing component ${customId}: ${error}`);

      // If the interaction hasn't been replied to yet, send an error message
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "There was an error processing this interaction.",
          flags: "Ephemeral",
        });
      } else if (interaction.deferred && !interaction.replied) {
        await interaction.editReply({
          content: "There was an error processing this interaction.",
        });
      }
    }
  }
}
