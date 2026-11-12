import { redirect } from "next/navigation";

// Proposals sent to you now live on the client screen.
export default function Page() {
  redirect("/client/proposals");
}
