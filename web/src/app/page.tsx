import { redirect } from "next/navigation";

import { anyoneTestnetHomeUrl } from "@/lib/anyone-testnet";

export default function RootPage() {
  redirect(anyoneTestnetHomeUrl());
}
