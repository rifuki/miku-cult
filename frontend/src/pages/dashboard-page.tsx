// src/pages/dashboard-page.tsx
"use client";

import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useNetworkVariable } from "@/networkConfig";
import PlayerDashboard from "@/components/player-dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Swords, Wallet } from "lucide-react";

export default function DashboardPage() {
  const account = useCurrentAccount();
  const packageId = useNetworkVariable("packageId");

  const {
    data: amuletData,
    isLoading,
    refetch,
  } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address!,
      filter: { StructType: `${packageId}::miku_cult::DevotionAmulet` },
      options: { showContent: true, showType: true },
    },
    { enabled: !!account && !!packageId },
  );

  const amulet = amuletData?.data?.[0];

  // FIXED: Handle "Not Connected" state clearly and beautifully
  if (!account) {
    return (
      <div className="w-full flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/80 border-border text-center">
          <CardHeader>
            <div className="mx-auto bg-muted/50 rounded-full p-3 w-fit">
              <Wallet className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle
              style={{ fontFamily: "'Cinzel Decorative', serif" }}
              className="mt-4"
            >
              Wallet Not Connected
            </CardTitle>
            <CardDescription>
              Please connect your wallet to view your Dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <p className="text-muted-foreground animate-pulse text-center">
        Reading the digital omens...
      </p>
    );
  }

  // FIXED: The component now fills the container it's in
  if (amulet) {
    return (
      <PlayerDashboard
        amulet={amulet}
        packageId={packageId}
        refetch={refetch}
      />
    );
  }

  // Welcome message for new, connected users
  return (
    <div className="w-full flex-grow flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 border-border text-center">
        <CardHeader>
          <CardTitle style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            Welcome, Devotee
          </CardTitle>
          <CardDescription>
            Your journey is yet to begin. You have not pledged fealty to any
            Order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Find an Order that speaks to your soul and begin your path of
            devotion.
          </p>
          <Button asChild>
            <Link to="/orders">
              <Swords className="mr-2 h-4 w-4" />
              Browse Orders
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
