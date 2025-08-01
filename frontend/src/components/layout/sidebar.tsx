// src/components/layout/sidebar.tsx
"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { Gem, Home, Swords } from "lucide-react";
import { NavLink } from "react-router-dom";

const formatAddress = (addr: string) =>
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/orders", icon: Swords, label: "Browse Orders" },
  { to: "/my-amulet", icon: Gem, label: "My Amulet" },
];

export default function Sidebar() {
  const account = useCurrentAccount();

  return (
    <aside className="dark fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border/50 bg-card/30 backdrop-blur-lg md:flex md:flex-col">
      <div className="flex h-full flex-col">
        {/* Profile Section */}
        <div className="flex flex-col items-center justify-center p-6 border-b border-border/50">
          <img
            src="/amulet-icon.png"
            alt="Devotion Amulet"
            className="h-24 w-24 rounded-full border-2 border-primary/50 object-cover animate-pulse-glow"
          />
          {account ? (
            <div className="mt-4 text-center">
              <p className="font-bold text-foreground">
                {formatAddress(account.address)}
              </p>
              <p className="text-xs text-muted-foreground">Devotee</p>
            </div>
          ) : (
            <div className="mt-4 text-center">
              <p className="font-bold text-muted-foreground">Not Connected</p>
              <p className="text-xs text-muted-foreground">
                Connect Wallet to Begin
              </p>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <nav
          className="flex-1 space-y-2 p-4"
          style={{ fontFamily: "'Judson', serif" }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer Section */}
        <div className="mt-auto p-4 border-t border-border/50">
          <p className="text-xs text-center text-muted-foreground">
            Miku Cult Simulator v1.0
          </p>
        </div>
      </div>
    </aside>
  );
}
