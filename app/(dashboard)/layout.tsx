import { Sidebar } from "@/components/dashboard/sidebar";
import { CreateFirstStoreGate } from "@/components/dashboard/create-first-store-gate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-screen bg-gray-50 h-screen overflow-hidden px-6 gap-2">
      <Sidebar />
      <div className="p-4 pl-0 w-full h-full">
        <div className="flex-1 bg-white rounded-3xl border overflow-auto h-full">
          <CreateFirstStoreGate>{children}</CreateFirstStoreGate>
        </div>
      </div>
    </div>
  );
}
