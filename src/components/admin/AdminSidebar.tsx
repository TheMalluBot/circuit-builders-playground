
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Book, 
  Users, 
  Image, 
  Settings,
  FileText, 
  Layers, 
  PieChart,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { useState } from "react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  collapsed?: boolean;
}

const SidebarItem = ({ icon, label, href, active, collapsed }: SidebarItemProps) => (
  <Link to={href}>
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 mb-1",
        active && "bg-accent text-accent-foreground",
        collapsed ? "justify-center px-2" : "px-3"
      )}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </Button>
  </Link>
);

interface SidebarGroup {
  title: string;
  items: {
    icon: React.ReactNode;
    label: string;
    href: string;
  }[];
}

interface AdminSidebarProps {
  collapsed?: boolean;
}

const AdminSidebar = ({ collapsed = false }: AdminSidebarProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Content": true
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const sidebarGroups: SidebarGroup[] = [
    {
      title: "Overview",
      items: [
        {
          icon: <LayoutDashboard className="h-4 w-4" />,
          label: "Dashboard",
          href: "/admin"
        }
      ]
    },
    {
      title: "Content",
      items: [
        {
          icon: <Book className="h-4 w-4" />,
          label: "Lessons",
          href: "/admin/lessons"
        },
        {
          icon: <Zap className="h-4 w-4" />,
          label: "Simulations",
          href: "/admin/simulations"
        },
        {
          icon: <Layers className="h-4 w-4" />,
          label: "Learning Paths",
          href: "/admin/learning-paths"
        },
        {
          icon: <Image className="h-4 w-4" />,
          label: "Media Library",
          href: "/admin/media"
        }
      ]
    },
    {
      title: "Users",
      items: [
        {
          icon: <Users className="h-4 w-4" />,
          label: "User Management",
          href: "/admin/users"
        }
      ]
    },
    {
      title: "Analytics",
      items: [
        {
          icon: <PieChart className="h-4 w-4" />,
          label: "Reports",
          href: "/admin/reports"
        }
      ]
    },
    {
      title: "Configuration",
      items: [
        {
          icon: <Settings className="h-4 w-4" />,
          label: "Settings",
          href: "/admin/settings"
        },
        {
          icon: <FileText className="h-4 w-4" />,
          label: "Documentation",
          href: "/admin/docs"
        }
      ]
    }
  ];

  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-200 h-full overflow-y-auto transition-all duration-300", 
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4">
        {sidebarGroups.map((group, index) => (
          <div key={group.title} className="mb-6">
            {!collapsed && (
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
                {group.title}
              </h3>
            )}
            
            {group.items.length === 1 ? (
              <SidebarItem
                icon={group.items[0].icon}
                label={group.items[0].label}
                href={group.items[0].href}
                collapsed={collapsed}
              />
            ) : (
              <Collapsible
                open={collapsed ? false : expandedGroups[group.title]}
                onOpenChange={collapsed ? undefined : () => toggleGroup(group.title)}
                className="space-y-1"
              >
                {!collapsed && group.items.length > 1 && (
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between px-3"
                    >
                      <span>{group.title}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-4 w-4 transition-transform ${
                          expandedGroups[group.title] ? "rotate-180" : ""
                        }`}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </Button>
                  </CollapsibleTrigger>
                )}
                <CollapsibleContent className="space-y-1">
                  {group.items.map((item) => (
                    <SidebarItem
                      key={item.label}
                      icon={item.icon}
                      label={item.label}
                      href={item.href}
                      collapsed={collapsed}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default AdminSidebar;
