import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-screen bg-[#f1f1f1] h-screen overflow-hidden">
      <Sidebar />
      <div className="p-4 w-full h-full">
        <div className="flex-1 bg-white rounded-3xl border overflow-auto h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
