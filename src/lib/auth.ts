import { Guild } from "discord.js";
import { AuthPermissionLevels } from "../types/Command-type";

class AuthManager {
  public async isAdmin(userId: string, guild: Guild): Promise<boolean> {
    const member = await guild.members.fetch(userId);
    return member && member.permissions.has("Administrator");
  }

  public async isOwner(userId: string, guild: Guild): Promise<boolean> {
    return guild.ownerId === userId;
  }
  public async isDeveloper(userId: string): Promise<boolean> {
    const developers = ["123456789012345678", "987654321098765432"]; // Replace with actual developer IDs
    return developers.includes(userId);
  }

  public async getUserPermissionLevel(
    userId: string,
    guild: Guild
  ): Promise<number> {
    if (await this.isOwner(userId, guild)) {
      return AuthPermissionLevels.OWNER;
    }
    if (await this.isAdmin(userId, guild)) {
      return AuthPermissionLevels.ADMIN;
    }
    if (await this.isDeveloper(userId)) {
      return AuthPermissionLevels.DEVELOPER;
    }
    return AuthPermissionLevels.EVERYONE;
  }

  public async hasPermission(
    userId: string,
    guild: Guild,
    requiredLevel: AuthPermissionLevels
  ): Promise<boolean> {
    const userLevel = await this.getUserPermissionLevel(userId, guild);
    return userLevel >= requiredLevel;
  }
}

export const authManager = new AuthManager();