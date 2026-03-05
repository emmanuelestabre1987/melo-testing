import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";

interface AppLayoutProps {
  children: React.ReactNode;
  pendingCount?: number;
  onRefresh?: () => void;
}

const AppLayout = ({ children, pendingCount, onRefresh }: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader pendingCount={pendingCount} onRefresh={onRefresh} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
