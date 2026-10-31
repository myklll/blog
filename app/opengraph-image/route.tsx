import { profileCard } from "@/app/og";

export const revalidate = 300;

export function GET() {
  return profileCard();
}
