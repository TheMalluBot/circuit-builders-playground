
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { useState } from "react";

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminTopbar 
        onMenuToggle={() => setSidebarCollapsed(prev => !prev)} 
        sidebarCollapsed={sidebarCollapsed}
      />
      <div className="flex h-[calc(100vh-4rem)]">
        <AdminSidebar collapsed={sidebarCollapsed} />
        <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="container mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
