import { redirect } from "next/navigation";

import { anyoneHomeUrl } from "@/lib/anyone-redirect";

export default async function HomePage() {
  redirect(anyoneHomeUrl());
}
