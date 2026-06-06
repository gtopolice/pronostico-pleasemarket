import { PrivyClient } from "@privy-io/node";

import { twitterOAuthAccount } from "@/lib/twitter-account";

let client: PrivyClient | null = null;

function getPrivyClient(): PrivyClient {
  if (client) return client;
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("privy-not-configured");
  }
  client = new PrivyClient({ appId, appSecret });
  return client;
}

export async function verifiedTwitterFromIdentityToken(identityToken: string) {
  const privy = getPrivyClient();
  const user = await privy.users().get({ id_token: identityToken });
  return twitterOAuthAccount(user.linked_accounts);
}
