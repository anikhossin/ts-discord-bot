import { Component } from "../types/Component.type";


const hi: Component = {
    customId: "hi",
    isPrefixMatch: false,
    type: "BUTTON",
    execute: async ({ interaction }) => {
        await interaction.reply({
            content: "Hello!",
            flags: 64, // Ephemeral message
        });
    }
}

export default hi;