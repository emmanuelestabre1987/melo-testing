import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

interface AppLayoutProps {
  children: React.ReactNode;
  pendingCount?: number;
  onRefresh?: () => void;
  filterSlot?: React.ReactNode;
}

const AppLayout = ({ children, pendingCount, onRefresh, filterSlot }: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="h-[100dvh] flex flex-col w-full overflow-hidden">
        <AppHeader pendingCount={pendingCount} onRefresh={onRefresh} filterSlot={filterSlot} />
        <div className="flex flex-1 w-full min-h-0">
          <AppSidebar />
          <main className="flex-1 min-w-0 overflow-y-auto pb-16 sm:pb-0">{children}</main>
        </div>
        <BottomNav pendingCount={pendingCount} />
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
