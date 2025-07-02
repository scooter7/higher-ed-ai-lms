import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import Logo from "./Logo";

const navItems = [
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, to: "/" },
];

const Sidebar = () => {
  const location = useLocation();
  return (
    <aside className="h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col shadow-lg">
      <Logo />
      <nav className="flex-1 px-4">
        <ul className="space-y-1 mt-4">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2 rounded font-medium transition
                    ${active
                      ? "bg-sidebar-active text-primary"
                      : "hover:bg-sidebar-hover text-white/90"}
                  `}
                  style={active ? { fontWeight: 700 } : {}}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;