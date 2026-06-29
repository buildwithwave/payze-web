import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-screen bg-[#F2F2F2] h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 bg-white mt-4 rounded-tl-3xl border overflow-auto">
        {children}
      </div>
    </div>
  );
}
