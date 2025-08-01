// src/pages/my-amulet-page.tsx
"use client";

import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useNetworkVariable } from "@/networkConfig";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck, ExternalLink, Wallet } from "lucide-react";

function getFields(obj: any) {
  if (obj?.data?.content?.dataType === "moveObject") {
    return obj.data.content.fields;
  }
  return null;
}

export default function MyAmuletPage() {
  const account = useCurrentAccount();
  const packageId = useNetworkVariable("packageId");

  const { data: amuletData, isLoading } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address!,
      filter: { StructType: `${packageId}::miku_cult::DevotionAmulet` },
      options: { showContent: true, showDisplay: true },
    },
    { enabled: !!account && !!packageId },
  );

  const amulet = amuletData?.data?.[0];
  const fields = getFields(amulet);
  const display = amulet?.data?.display?.data;

  // --- Loading and Error states remain the same ---

  if (!account) {
    return (
      <Card className="w-full max-w-md bg-card/80 border-border text-center p-8 mx-auto">
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
          Please connect your wallet to view your Amulet of Devotion.
        </CardDescription>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <p className="text-muted-foreground animate-pulse text-center">
        Summoning your Amulet...
      </p>
    );
  }

  if (!amulet || !amulet.data || !fields) {
    return (
      <Card className="w-full max-w-md bg-card/80 border-border text-center p-8 mx-auto">
        <CardTitle style={{ fontFamily: "'Cinzel Decorative', serif" }}>
          Amulet Not Found
        </CardTitle>
        <CardDescription>
          You do not possess a Devotion Amulet. Join an Order to receive one.
        </CardDescription>
      </Card>
    );
  }

  // --- NEW EPIC REDESIGN STARTS HERE ---

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 text-center animate-fade-in p-4 relative">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl -z-10" />

      {/* Amulet Image Display */}
      <div className="mb-4">
        <img
          src={display?.image_url?.replace("{rank}", fields.rank)}
          alt={display?.name || "Amulet"}
          className="h-64 w-64 rounded-full border-4 border-primary/30 object-cover 
                           drop-shadow-[0_0px_25px_rgba(0,255,255,0.2)]"
        />
      </div>

      {/* Title and Description */}
      <h1
        style={{ fontFamily: "'Cinzel Decorative', serif" }}
        className="text-4xl lg:text-5xl font-bold text-slate-100"
      >
        {display?.name?.replace("{rank}", fields.rank)}
      </h1>
      <p
        className="text-lg text-muted-foreground max-w-md"
        style={{ fontFamily: "'Judson', serif" }}
      >
        {display?.description?.replace(
          "{personal_faith}",
          fields.personal_faith,
        )}
      </p>

      {/* Divider */}
      <div className="h-px w-full max-w-sm bg-border my-6" />

      {/* Stats Section */}
      <div className="flex items-center justify-center gap-12 md:gap-20">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <Sparkles className="h-4 w-4" /> Faith Points
          </div>
          <p className="text-5xl font-bold text-slate-50">
            {fields.personal_faith}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-sm text-primary">
            <ShieldCheck className="h-4 w-4" /> Rank
          </div>
          <p className="text-5xl font-bold text-slate-50">{fields.rank}</p>
        </div>
      </div>

      {/* Action Button */}
      <Button asChild variant="outline" className="mt-10">
        <a
          href={`https://suiscan.xyz/devnet/object/${amulet.data.objectId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </a>
      </Button>
    </div>
  );
}
