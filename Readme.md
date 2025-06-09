# TsBotTemplate

A modern, scalable Discord bot template written in TypeScript using [discord.js](https://discord.js.org/).

> **Note:** This is a private repository for my personal use.

---

## Features

- TypeScript-first, with full type safety.
- Slash command handler for easy command management.
- Component handler (buttons, select menus, modals).
- Modular event loading.
- MongoDB integration.
- Type-safe environment variable loader.
- Easy to extend and customize.

---

## Getting Started

1. Install dependencies:
    ```bash
    pnpm install
    ```

2. Copy and edit the environment file:
    ```bash
    cp example.env .env
    # Edit .env with your bot token, client ID, Mongo URI, etc.
    ```

3. Run in development mode:
    ```bash
    pnpm dev
    ```

4. Build and run for production:
    ```bash
    pnpm build
    pnpm start
    ```

---

## Project Structure

```
src/
  Commands/    # Slash commands
  Components/  # Button, select menu, modal handlers
  Events/      # Discord event handlers
  DB/          # Database connection logic
  types/       # TypeScript types/interfaces
  utils/       # Utilities
  index.ts     # Bot entry point
```

---

## Notes

- Add new commands, components, or events by creating files in their respective folders.
- See existing files for examples.

---

## License

MIT

---