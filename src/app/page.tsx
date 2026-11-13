/**
 * app/page.tsx — dashboard (/).
 * Server Component (skill nextjs-app-router-patterns): só o Dashboard,
 * que usa hooks, é um Client Component.
 */
import Dashboard from "@/components/dashboard/Dashboard";

export default function Home() {
  return <Dashboard />;
}
