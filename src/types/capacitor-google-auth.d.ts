declare module "@southdevs/capacitor-google-auth" {
  export interface GoogleAuthUser {
    id: string;
    email: string;
    name: string;
    imageUrl: string;
    authentication: {
      idToken: string;
      accessToken: string | null;
    };
  }

  export interface GoogleAuth {
    initialize(): void;
    signIn(): Promise<GoogleAuthUser>;
    signOut(): Promise<void>;
  }

  export const GoogleAuth: GoogleAuth;
}

