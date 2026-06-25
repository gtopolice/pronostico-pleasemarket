import { redirect } from "next/navigation";

import { anyoneHomeUrl } from "@/lib/anyone-redirect";

export default function RootPage() {
  redirect(anyoneHomeUrl());
}
