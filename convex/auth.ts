import Google from "@auth/core/providers/google";
import GitHub from "@auth/core/providers/github";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Google,
    GitHub({
      issuer: "https://github.com/login/oauth",
      client: { token_endpoint_auth_method: "client_secret_post" },
    }),
  ],
});
