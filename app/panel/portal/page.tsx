import { redirect } from "next/navigation";

// The client portal is now its own screen.
export default function Page() {
  redirect("/client");
}
