import { ButtonInteraction, ModalSubmitInteraction, SelectMenuInteraction, StringSelectMenuInteraction, Client } from 'discord.js';

// Context interface for component execution
export interface ComponentContext {
  client: Client;
  interaction: ButtonInteraction | ModalSubmitInteraction | SelectMenuInteraction | StringSelectMenuInteraction;
}

// Base component interface
export interface Component {
  // The custom ID or prefix for the component
  customId: string;
  
  // Optional: if true, will match any customId that starts with the specified customId (for dynamic IDs)
  isPrefixMatch?: boolean;
  
  // Optional: component type (button, modal, select)
  type?: 'BUTTON' | 'MODAL' | 'SELECT_MENU';
  
  // Whether the component is enabled
  enabled?: boolean;
  
  // Component execution function
  execute: (context: ComponentContext) => Promise<void> | void;
  
  // Optional hooks
  beforeExecute?: (context: ComponentContext) => Promise<boolean> | boolean;
  afterExecute?: (context: ComponentContext) => Promise<void> | void;
}

// Component handler interface
export interface ComponentHandler {
  register(component: Component): void;
  getComponent(customId: string): Component | undefined;
  execute(interaction: ButtonInteraction | ModalSubmitInteraction | SelectMenuInteraction | StringSelectMenuInteraction): Promise<void>;
}