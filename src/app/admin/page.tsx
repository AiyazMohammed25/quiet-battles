import type { Metadata } from "next";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Content Studio",
  robots: { index: false, follow: false },
};

// Show the admin dashboard at the /admin route.
export default function AdminPage() {
  return <AdminDashboard />;
}
