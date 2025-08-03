import { NavLink } from "react-router-dom";
import { Gem, Home, Swords, Trophy, Wrench } from "lucide-react";

import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";

import { useNetworkVariable } from "@/networkConfig";

const formatAddress = (addr: string) =>
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/orders", icon: Swords, label: "Browse Orders" },
  { to: "/my-amulet", icon: Gem, label: "My Amulet" },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
];

interface MobileNavProps {
  onLinkClick: () => void;
}

export default function MobileNav({ onLinkClick }: MobileNavProps) {
  const account = useCurrentAccount();
  const packageId = useNetworkVariable("packageId");

  // 1. Fetch DevotionAmulet data
  const { data: amuletData } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address!,
      filter: { StructType: `${packageId}::miku_cult::DevotionAmulet` },
      options: { showDisplay: true },
    },
    { enabled: !!account && !!packageId },
  );

  // 2. Conditionally determine the image URL
  const amulet = amuletData?.data?.[0];
  const display = amulet?.data?.display?.data;
  const hasAmulet = !!display?.image_url;
  const imageUrl = hasAmulet ? display.image_url : "/unknown.jpg";

  const { data: founderCapData } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address!,
      filter: { StructType: `${packageId}::miku_cult::CultFounderCap` },
    },
    { enabled: !!account && !!packageId },
  );

  const isFounder = (founderCapData?.data?.length || 0) > 0;

  return (
    <div className="dark flex h-full flex-col">
      <div className="flex items-center gap-4 p-6 border-b border-border/50">
        {/* 3. Use the dynamic imageUrl and add an onError fallback */}
        <img
          src={imageUrl}
          alt="User Devotion"
          className="h-16 w-16 rounded-full border-2 border-primary/50 object-cover"
          // If the amulet's URL fails to load, use the default image
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/unknown.jpg";
          }}
        />
        {account ? (
          <div>
            <p className="font-bold text-foreground">
              {formatAddress(account.address)}
            </p>
            <p className="text-xs text-muted-foreground">
              {hasAmulet ? "Devotee" : "Seeker"}
            </p>
          </div>
        ) : (
          <div>
            <p className="font-bold text-muted-foreground">Not Connected</p>
          </div>
        )}
      </div>
      <nav
        className="flex-1 space-y-2 p-4"
        style={{ fontFamily: "'Judson', serif" }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end
            onClick={onLinkClick}
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
        {isFounder && (
          <NavLink
            to="/manage"
            onClick={onLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-lg transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent"
              }`
            }
          >
            <Wrench className="h-5 w-5" />
            Manage My Orders
          </NavLink>
        )}
      </nav>
    </div>
  );
}
