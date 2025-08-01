// src/pages/browse-orders-page.tsx
"use client";

import CultList from "@/components/cult-list";
import CreateCultForm from "@/components/create-cult-form";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useNetworkVariable } from "@/networkConfig";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, LayoutDashboard } from "lucide-react";

function getFields(obj: any) {
  if (obj?.data?.content?.dataType === "moveObject")
    return obj.data.content.fields;
  return null;
}

export default function BrowseOrdersPage() {
  const account = useCurrentAccount();
  const packageId = useNetworkVariable("packageId");
  const registryId = useNetworkVariable("registryId");

  const { data: amuletData, refetch: refetchAmulet } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address!,
      filter: { StructType: `${packageId}::miku_cult::DevotionAmulet` },
      options: { showContent: true },
    },
    { enabled: !!account && !!packageId },
  );

  const amulet = amuletData?.data?.[0];
  const hasAmulet = !!amulet;
  const currentUserShrineId = getFields(amulet)?.shrine_id;

  const refetchAll = () => {
    refetchAmulet();
  };

  return (
    // The main container uses a single-column flow with no max-width to be consistent with the dashboard page.
    <div className="w-full flex flex-col gap-8 animate-fade-in">
      {/* Section 1: The list of all available Orders. */}
      <CultList
        registryId={registryId}
        packageId={packageId}
        hasAmulet={hasAmulet}
        currentUserShrineId={currentUserShrineId}
        refetch={refetchAll}
      />

      {/* Section 2: The action form or info card, placed below the list. */}
      {account && (
        <>
          {hasAmulet ? (
            <Card className="bg-card/80 border-primary/30 text-center shadow-lg shadow-primary/10">
              <CardHeader>
                <div className="mx-auto bg-primary/20 rounded-full p-3 w-fit">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle
                  className="mt-4 text-primary"
                  style={{ fontFamily: "'Cinzel Decorative', serif" }}
                >
                  Devotion Pledged
                </CardTitle>
                <CardDescription>
                  Your faith already belongs to an Order. You cannot serve two
                  masters.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <Button asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Go to Your Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <CreateCultForm
              registryId={registryId}
              packageId={packageId}
              refetch={refetchAll}
            />
          )}
        </>
      )}
    </div>
  );
}
