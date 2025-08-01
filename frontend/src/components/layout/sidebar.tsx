// src/components/layout/sidebar.tsx
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { Gem, Home, Swords, Trophy, Wrench } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useNetworkVariable } from "@/networkConfig";

const formatAddress = (addr: string) =>
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/orders", icon: Swords, label: "Browse Orders" },
  { to: "/my-amulet", icon: Gem, label: "My Amulet" },
  { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
];

export default function Sidebar() {
  const account = useCurrentAccount();
  const packageId = useNetworkVariable("packageId");

  // --- CHANGES START HERE ---

  // 1. Fetch DevotionAmulet data to get the profile picture
  const { data: amuletData } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address!,
      filter: { StructType: `${packageId}::miku_cult::DevotionAmulet` },
      // Request display data to get the image_url
      options: { showDisplay: true },
    },
    { enabled: !!account && !!packageId },
  );

  // 2. Conditionally determine the image URL
  const amulet = amuletData?.data?.[0];
  const display = amulet?.data?.display?.data;
  const hasAmulet = !!display?.image_url;
  const imageUrl = hasAmulet ? display.image_url : "/unknown.jpg";

  // --- CHANGES END HERE ---

  // Fetch founder caps to conditionally show the "Manage" link
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
    <aside className="dark fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border/50 bg-card/30 backdrop-blur-lg md:flex md:flex-col">
      <div className="flex h-full flex-col">
        <div className="flex flex-col items-center justify-center p-6 border-b border-border/50">
          {/* 3. Use the dynamic imageUrl and add an onError fallback */}
          <img
            src={imageUrl}
            alt="User Devotion"
            className={`h-24 w-24 rounded-full border-2 border-primary/50 object-cover ${
              hasAmulet ? "animate-pulse-glow" : ""
            }`}
            // If the amulet's URL fails to load, use the default image
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/unknown.jpg";
            }}
          />
          {account ? (
            <div className="mt-4 text-center">
              <p className="font-bold text-foreground">
                {formatAddress(account.address)}
              </p>
              <p className="text-xs text-muted-foreground">
                {hasAmulet ? "Devotee" : "Seeker"}
              </p>
            </div>
          ) : (
            <div className="mt-4 text-center">
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
          {/* Conditional link for founders */}
          {isFounder && (
            <NavLink
              to="/manage"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent"
                }`
              }
            >
              <Wrench className="h-4 w-4" />
              Manage My Orders
            </NavLink>
          )}
        </nav>
        <div className="mt-auto p-4 border-t border-border/50">
          <p className="text-xs text-center text-muted-foreground">
            Miku Cult Simulator v3.0
          </p>
        </div>
      </div>
    </aside>
  );
}
