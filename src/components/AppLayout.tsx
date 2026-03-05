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
      <div className="min-h-screen flex flex-col w-full">
        {/* Header spans full width, always on top */}
        <AppHeader pendingCount={pendingCount} onRefresh={onRefresh} />
        
        {/* Sidebar + content below the header */}
        <div className="flex flex-1 w-full">
          <AppSidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
