declare module "@capgo/capacitor-social-login" {
  export interface SocialLoginResult {
    provider: string;
    result: {
      idToken: string;
      accessToken?: string;
      email?: string;
      name?: string;
      imageUrl?: string;
      serverAuthCode?: string;
      responseType?: "online" | "offline";
    };
  }

  export interface SocialLoginOptions {
    scopes?: string[];
    [key: string]: any;
  }

  export interface GoogleInitConfig {
    iOSClientId: string;
    iOSServerClientId: string;
    mode?: "online" | "offline";
  }

  export interface SocialLoginInitParams {
    google?: GoogleInitConfig;
    facebook?: any;
    apple?: any;
  }

  export interface SocialLoginLoginParams {
    provider: "google" | "facebook" | "apple";
    options?: SocialLoginOptions;
  }

  export interface SocialLoginLogoutParams {
    provider: "google" | "facebook" | "apple";
  }

  export interface SocialLogin {
    initialize(params: SocialLoginInitParams): Promise<void>;
    login(params: SocialLoginLoginParams): Promise<SocialLoginResult>;
    logout(params: SocialLoginLogoutParams): Promise<void>;
  }

  export const SocialLogin: SocialLogin;
}
