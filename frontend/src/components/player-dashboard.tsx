import { useEffect, useState } from "react";

import {
  Sparkles,
  ShieldCheck,
  Clock,
  Loader2,
  Users,
  FlaskConical,
  Gem,
} from "lucide-react";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const ONE_DAY_MS = 86_400_000;

function getFields(obj: any) {
  if (!obj) return undefined;
  const data = obj.data || obj;
  return data.content?.fields;
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

interface PlayerDashboardProps {
  amulet: any;
  packageId: string;
  refetch: () => void;
}

export default function PlayerDashboard({
  amulet,
  packageId,
  refetch,
}: PlayerDashboardProps) {
  const suiClient = useSuiClient();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [shrineInfo, setShrineInfo] = useState<any>(null);
  const [countdown, setCountdown] = useState("");

  const fields = getFields(amulet);
  const amuletId = amulet.data.objectId;
  const shrineId = fields?.shrine_id;
  const lastChantTimestamp = Number(fields?.last_chant_timestamp_ms || 0);

  const canChant = Date.now() > lastChantTimestamp + ONE_DAY_MS;
  const canRankUp = (fields?.personal_faith || 0) >= 50 && fields?.rank < 2;

  useEffect(() => {
    if (shrineId) {
      suiClient
        .getObject({ id: shrineId, options: { showContent: true } })
        .then((res) => setShrineInfo(res.data));
    }
  }, [shrineId, suiClient]);

  useEffect(() => {
    if (canChant) {
      setCountdown("Ready!");
      return;
    }
    const interval = setInterval(() => {
      const remaining = lastChantTimestamp + ONE_DAY_MS - Date.now();
      if (remaining <= 0) {
        setCountdown("Ready!");
        clearInterval(interval);
        refetch();
      } else {
        setCountdown(formatTime(remaining));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [canChant, lastChantTimestamp, refetch]);

  const handleAction = (functionName: "daily_chant" | "rank_up") => {
    const txb = new Transaction();
    const args =
      functionName === "daily_chant"
        ? [txb.object(amuletId), txb.object(shrineId), txb.object("0x6")]
        : [txb.object(amuletId)];
    txb.moveCall({
      target: `${packageId}::miku_cult::${functionName}`,
      arguments: args,
    });
    signAndExecute({ transaction: txb }, { onSuccess: () => refetch() });
  };

  const shrineFields = getFields(shrineInfo);

  return (
    <div className="w-full flex flex-col gap-8 animate-fade-in">
      {/* Top Section: Symmetrical two-column grid for the main dashboard. */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Column 1: Shrine Information Card (This part is correct) */}
        <div className="lg:col-span-2">
          <Card className="w-full h-full bg-card/80 border-border/50 backdrop-blur-sm shadow-lg flex flex-col p-6">
            <div className="text-center">
              {shrineFields ? (
                <img
                  src={shrineFields.image_url}
                  alt={shrineFields.name}
                  className="w-32 h-32 rounded-2xl border-4 border-primary/20 object-cover shadow-lg shadow-primary/10 mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/unknown.jpg";
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-background/50 animate-pulse mx-auto" />
              )}
              <CardTitle
                className="text-2xl mt-4"
                style={{ fontFamily: "'Cinzel Decorative', serif" }}
              >
                {shrineFields?.name || "Loading Order..."}
              </CardTitle>
              <CardDescription>Your current Order of devotion.</CardDescription>
            </div>
            <div className="flex-grow flex flex-col justify-end space-y-4 mt-6">
              <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                  Order's Total Faith
                </span>
                <span className="font-bold text-lg text-yellow-400">
                  {shrineFields?.total_faith ?? "..."}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Followers
                </span>
                <span className="font-bold text-lg text-primary">
                  {shrineFields?.member_count ?? "..."}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Column 2: Player Actions Card (Completely rebuilt internally) */}
        <div className="lg:col-span-3">
          <Card className="w-full h-full bg-card/80 border-primary/30 backdrop-blur-sm shadow-lg shadow-primary/10 p-6 flex flex-col">
            {/* Header Area */}
            <div>
              <CardTitle
                className="flex items-center gap-2 text-primary text-2xl"
                style={{ fontFamily: "'Cinzel Decorative', serif" }}
              >
                <Gem />
                Your Devotion
              </CardTitle>
              <CardDescription style={{ fontFamily: "'Judson', serif" }}>
                Your personal progress within the Order.
              </CardDescription>
            </div>

            {/* Stats Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-background/50 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-yellow-400" /> Your Faith
                </div>
                <p className="text-3xl font-bold text-yellow-400 mt-1">
                  {fields?.personal_faith}
                </p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg border border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Your Rank
                </div>
                <p className="text-3xl font-bold text-primary mt-1">
                  {fields?.rank}
                </p>
              </div>
            </div>

            {/* This is the magic spacer. It will grow to push the buttons down. */}
            <div className="flex-grow" />

            {/* Actions Area (This will now be at the bottom) */}
            <div className="flex flex-col gap-3 mt-6">
              <Button
                onClick={() => handleAction("daily_chant")}
                variant="outline"
                disabled={!canChant || isPending}
              >
                {isPending && canChant ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {canChant ? (
                  "Perform Daily Chant (+10 Faith)"
                ) : (
                  <div className="flex items-center gap-2 justify-center">
                    <Clock className="h-4 w-4" />
                    <span>{countdown}</span>
                  </div>
                )}
              </Button>
              <Button
                onClick={() => handleAction("rank_up")}
                disabled={!canRankUp || isPending}
              >
                {isPending && canRankUp ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Rank Up (Cost: 50 Faith)
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Full-width card for future updates. */}
      <div className="w-full">
        <Card className="w-full bg-card/80 border-border/50 border-dashed backdrop-blur-sm shadow-lg p-6">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-muted/50 rounded-full w-fit">
              <FlaskConical className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle
              className="text-xl mt-4"
              style={{ fontFamily: "'Cinzel Decorative', serif" }}
            >
              Whispers of the Future
            </CardTitle>
            <CardDescription className="max-w-prose">
              The path of devotion is ever-expanding. More trials, rituals, and
              artifacts are being forged. Stay faithful.
            </CardDescription>
          </div>
        </Card>
      </div>
    </div>
  );
}
