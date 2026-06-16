import { redirect } from "next/navigation";

import { anyoneTestnetHomeUrl } from "@/lib/anyone-testnet";

export default async function HomePage() {
  redirect(anyoneTestnetHomeUrl());
}
