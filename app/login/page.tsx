import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/AuthForms";
export default function LoginPage({ searchParams }: { searchParams?: { created?: string; confirm?: string; verified?: string } }) {
  return <AuthShell variant="login"><LoginForm registered={searchParams?.created === "1"} confirmationRequired={searchParams?.confirm === "1"} verified={searchParams?.verified === "1"} /></AuthShell>;
}
