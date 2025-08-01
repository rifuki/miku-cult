// src/components/player-dashboard.tsx
"use client";

import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles, ShieldCheck, Gem } from "lucide-react";

function getFields(obj: any) {
  if (!obj) return undefined;
  const data = obj.data || obj;
  return data.content?.fields;
}

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
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [shrineInfo, setShrineInfo] = useState<any>(null);

  const amuletId = amulet.data.objectId;
  const shrineId = getFields(amulet)?.shrine_id;

  useEffect(() => {
    if (shrineId) {
      suiClient
        .getObject({ id: shrineId, options: { showContent: true } })
        .then((res) => setShrineInfo(res));
    }
  }, [shrineId, suiClient]);

  const handleAction = (functionName: "daily_chant" | "rank_up") => {
    const txb = new Transaction();
    txb.moveCall({
      target: `${packageId}::miku_cult::${functionName}`,
      arguments: [txb.object(amuletId)],
    });
    signAndExecute({ transaction: txb }, { onSuccess: () => refetch() });
  };

  return (
    // FIXED: w-full makes the card take the full width of its container
    <div className="w-full">
      <Card className="w-full bg-card/80 border-primary/30 backdrop-blur-sm shadow-lg shadow-primary/10">
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2 text-primary"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            <Gem className="h-6 w-6" />
            Devotion Dashboard
          </CardTitle>
          <CardDescription style={{ fontFamily: "'Judson', serif" }}>
            Order: {getFields(shrineInfo)?.name || "Loading..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg border border-border">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 cursor-help">
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                    <span className="text-muted-foreground">Faith Points</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Earned from daily rituals. Used to rank up.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="font-bold text-xl text-yellow-400">
              {getFields(amulet)?.personal_faith}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              {/* FIXED: Changed icon color to primary (turquoise) */}
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Rank</span>
            </div>
            {/* FIXED: Changed text color to primary (turquoise) */}
            <span className="font-bold text-xl text-primary">
              {getFields(amulet)?.rank}
            </span>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => handleAction("daily_chant")}
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10"
            >
              Perform Daily Chant (+10 Faith)
            </Button>
            {/* FIXED: Changed button color to primary (turquoise) */}
            <Button
              onClick={() => handleAction("rank_up")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Rank Up (Cost: 50 Faith)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
