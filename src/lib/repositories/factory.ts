import { DbGameRepository } from "./db-repository";
import { InMemoryGameRepository } from "./in-memory-repository";
import { IGameDataRepository, IRepositoryFactory } from "./interfaces";

/**
 * Repository factory that creates the appropriate repository implementation
 * based on the environment. Uses in-memory for development (localhost)
 * and database for production.
 */
class RepositoryFactory implements IRepositoryFactory {
  private static instance: RepositoryFactory;
  private repository: IGameDataRepository | null = null;

  private constructor() {}

  static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }

  createRepository(): IGameDataRepository {
    // Singleton pattern to ensure we use the same repository instance
    if (this.repository) {
      return this.repository;
    }

    // Environment detection logic
    const isLocalhost = this.isLocalDevelopment();

    if (isLocalhost) {
      console.log("🏠 Using InMemoryGameRepository for localhost development");
      this.repository = new InMemoryGameRepository();
    } else {
      console.log("🗄️  Using DbGameRepository for production");
      this.repository = new DbGameRepository();
    }

    return this.repository;
  }

  /**
   * Force a specific repository type (useful for testing)
   */
  forceRepository(type: "memory" | "database"): IGameDataRepository {
    if (type === "memory") {
      this.repository = new InMemoryGameRepository();
    } else {
      this.repository = new DbGameRepository();
    }
    return this.repository;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  reset(): void {
    this.repository = null;
  }

  /**
   * Detect if we're running in local development environment
   */
  private isLocalDevelopment(): boolean {
    // Server-side detection
    if (typeof window === "undefined") {
      // Check environment variables
      if (process.env.NODE_ENV === "development") {
        return true;
      }

      // Check hostname patterns
      const hostname = process.env.HOSTNAME || "";
      if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
        return true;
      }

      // Check if DATABASE_URL suggests local development
      const dbUrl = process.env.DATABASE_URL || "";
      if (dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1")) {
        return true;
      }

      // Check for Vercel preview deployments (treat as production)
      if (
        process.env.VERCEL_ENV === "preview" ||
        process.env.VERCEL_ENV === "production"
      ) {
        return false;
      }

      // Default to database for server-side if unsure
      return false;
    }

    // Client-side detection
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      return (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.startsWith("192.168.") ||
        hostname.endsWith(".local")
      );
    }

    return false;
  }
}

/**
 * Get the game repository instance based on environment
 */
export function getGameRepository(): IGameDataRepository {
  return RepositoryFactory.getInstance().createRepository();
}

/**
 * Force a specific repository type (useful for testing)
 */
export function forceRepository(
  type: "memory" | "database",
): IGameDataRepository {
  return RepositoryFactory.getInstance().forceRepository(type);
}

/**
 * Reset the repository factory (useful for testing)
 */
export function resetRepositoryFactory(): void {
  RepositoryFactory.getInstance().reset();
}

/**
 * Check if we're currently using in-memory storage
 */
export function isUsingMemoryRepository(): boolean {
  const repo = RepositoryFactory.getInstance();
  // Access the private repository property via a type assertion
  const currentRepo = (repo as any).repository;
  return currentRepo instanceof InMemoryGameRepository;
}

// Export the factory class for advanced use cases
export { RepositoryFactory };
