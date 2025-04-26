
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { useState } from "react";

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AdminTopbar 
        onMenuToggle={() => setSidebarCollapsed(prev => !prev)} 
        sidebarCollapsed={sidebarCollapsed}
      />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar collapsed={sidebarCollapsed} />
        <main className={`flex-1 overflow-auto transition-all duration-300 p-6`}>
          <div className="w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
