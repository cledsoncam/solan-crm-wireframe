import { Sidebar } from "@/components/shell/Sidebar";
import { GlobalModals } from "@/components/shell/GlobalModals";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full">{children}</div>
      <GlobalModals />
    </div>
  );
}
