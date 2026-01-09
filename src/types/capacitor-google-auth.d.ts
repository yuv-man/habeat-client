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

  export interface GoogleAuthInitOptions {
    clientId?: string;
    serverClientId?: string;
    scopes?: string[];
    grantOfflineAccess?: boolean;
  }

  export interface GoogleAuthSignInOptions {
    scopes?: string[];
    serverClientId?: string;
  }

  export interface GoogleAuth {
    initialize(options?: GoogleAuthInitOptions): Promise<void>;
    signIn(options?: GoogleAuthSignInOptions): Promise<GoogleAuthUser>;
    signOut(): Promise<void>;
  }

  export const GoogleAuth: GoogleAuth;
}

