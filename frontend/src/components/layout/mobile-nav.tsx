// src/components/layout/mobile-nav.tsx
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

// Define props for the component
interface MobileNavProps {
  onLinkClick: () => void;
}

export default function MobileNav({ onLinkClick }: MobileNavProps) {
  const account = useCurrentAccount();

  return (
    <div className="dark flex h-full flex-col">
      {/* Profile Section */}
      <div className="flex items-center gap-4 p-6 border-b border-border/50">
        <img
          src="/amulet-icon.png"
          alt="Devotion Amulet"
          className="h-16 w-16 rounded-full border-2 border-primary/50 object-cover"
        />
        {account ? (
          <div>
            <p className="font-bold text-foreground">
              {formatAddress(account.address)}
            </p>
            <p className="text-xs text-muted-foreground">Devotee</p>
          </div>
        ) : (
          <div>
            <p className="font-bold text-muted-foreground">Not Connected</p>
          </div>
        )}
      </div>

      {/* Navigation Section */}
      <nav
        className="flex-1 space-y-2 p-4"
        style={{ fontFamily: "'Judson', serif" }}
      >
        {navItems.map((item) => (
          // Add onClick handler to each link
          <NavLink
            key={item.label}
            to={item.to}
            end
            onClick={onLinkClick} // This will close the sheet
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-lg transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
