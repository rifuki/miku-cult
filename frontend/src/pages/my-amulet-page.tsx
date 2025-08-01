// src/pages/my-amulet-page.tsx
"use client";

import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useNetworkVariable } from "@/networkConfig";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  // FIXED: Handle the "Not Connected" state first
  if (!account) {
    return (
      <Card className="w-full max-w-2xl bg-card/80 border-border text-center">
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
            Please connect your wallet to view your Amulet of Devotion.
          </CardDescription>
        </CardHeader>
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
      <Card className="w-full max-w-2xl bg-card/80 border-border text-center">
        <CardHeader>
          <CardTitle style={{ fontFamily: "'Cinzel Decorative', serif" }}>
            Amulet Not Found
          </CardTitle>
          <CardDescription>
            You do not possess a Devotion Amulet. Join an Order to receive one.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    // FIXED: Made the card larger and more prominent
    <div className="w-full max-w-2xl p-2">
      <Card className="w-full bg-card/80 border-border shadow-lg shadow-primary/10">
        <CardHeader className="items-center text-center p-8">
          <img
            src={
              display?.image_url?.replace("{rank}", fields.rank) ||
              "/amulet-icon.png"
            }
            alt={display?.name || "Amulet"}
            className="h-48 w-48 rounded-full border-4 border-primary/30 object-cover mb-4"
          />
          <CardTitle
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
            className="text-3xl"
          >
            {display?.name?.replace("{rank}", fields.rank)}
          </CardTitle>
          <CardDescription
            className="text-base"
            style={{ fontFamily: "'Judson', serif" }}
          >
            {display?.description?.replace(
              "{personal_faith}",
              fields.personal_faith,
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-8">
          <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-yellow-400" /> Faith Points
            </div>
            <span className="font-bold text-xl text-yellow-400">
              {fields.personal_faith}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg border border-border">
            {/* FIXED: Changed color from purple to primary (cyan/turquoise) */}
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" /> Rank
            </div>
            <span className="font-bold text-xl text-primary">
              {fields.rank}
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-8">
          <Button asChild variant="outline" className="w-full">
            <a
              href={`https://suiscan.xyz/devnet/object/${amulet.data.objectId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Explorer
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
