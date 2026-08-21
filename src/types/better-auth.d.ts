import "@better-auth/prisma-adapter";

declare module "better-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      isAdmin?: boolean;
    };
  }
}
