import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";

interface AppLayoutProps {
  children: React.ReactNode;
  pendingCount?: number;
  onRefresh?: () => void;
  filterSlot?: React.ReactNode;
}

const AppLayout = ({ children, pendingCount, onRefresh, filterSlot }: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <AppHeader pendingCount={pendingCount} onRefresh={onRefresh} filterSlot={filterSlot} />
        <div className="flex flex-1 w-full">
          <AppSidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
