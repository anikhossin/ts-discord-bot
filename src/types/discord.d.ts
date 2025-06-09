import { EventHandler } from "../Handlers/EventHandler";

declare module "discord.js" {
    interface Client {
        _eventHandlers: EventHandler
    }
}