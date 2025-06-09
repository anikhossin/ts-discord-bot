# Discord.js TypeScript Bot Template

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

A modern, scalable Discord bot template written in TypeScript using [discord.js](https://discord.js.org/). This template provides a solid foundation for building feature-rich Discord bots with best practices and modern development tools.

## ✨ Features

- 🚀 **TypeScript-first** - Full type safety and modern JavaScript features
- ⚡ **Slash Commands** - Built-in command handler with support for slash commands
- 🎮 **Component System** - Handle buttons, select menus, and modals with ease
- 📦 **Modular Events** - Easy to manage and extend event system
- 🗄️ **MongoDB Integration** - Ready-to-use database connection
- 🔒 **Type-safe Environment** - Secure configuration management
- 📝 **ESLint & Prettier** - Consistent code style
- 🧪 **Testing Setup** - Ready for unit and integration tests

## 🚀 Getting Started

### Prerequisites

- Node.js 16.9.0 or higher
- pnpm (recommended) or npm
- MongoDB instance
- Discord Bot Token

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/discord-ts-bot-template.git
   cd discord-ts-bot-template
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp example.env .env
   ```
   Edit `.env` with your configuration:
   - `TOKEN`: Your Discord bot token
   - `MONGODB_URI`: Your mongodb Uri (Optional)

4. Start development server:
   ```bash
   pnpm dev
   ```

### Production Deployment

1. Build the project:
   ```bash
   pnpm build
   ```

2. Start the production server:
   ```bash
   pnpm start
   ```

## 📁 Project Structure

```
src/
├── Commands/     # Slash command handlers
├── Components/   # Button, select menu, modal handlers
├── Events/       # Discord event handlers
├── DB/          # Database models and connection
├── types/       # TypeScript type definitions
├── utils/       # Utility functions
└── index.ts     # Application entry point
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Write tests for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [discord.js](https://discord.js.org/) - The Discord API library
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [MongoDB](https://www.mongodb.com/) - The database for modern applications

## 📫 Contact

If you have any questions or suggestions, feel free to:
- Open an issue
- Create a pull request
- Contact the maintainers

---

⭐ Star this repository if you find it helpful!