import { useEffect, useState } from "react";

import { useSuiClient } from "@mysten/dapp-kit";
import { Trophy, Users, Sparkles, ShieldX, Construction } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { cn } from "@/lib/utils";

import { useNetworkVariable } from "@/networkConfig";

// --- HELPER COMPONENTS & FUNCTIONS ---

function getFields(obj: any) {
  if (obj?.data?.content?.dataType === "moveObject")
    return obj.data.content.fields;
  return null;
}

// A new Skeleton Loader component for a better loading experience.
function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-muted rounded-md" />
            <div className="h-12 w-12 bg-muted rounded-md" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded-md" />
              <div className="h-3 w-24 bg-muted rounded-md" />
            </div>
          </div>
          <div className="h-6 w-16 bg-muted rounded-md" />
        </div>
      ))}
    </div>
  );
}

// A new Empty State component.
function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center p-8 bg-background/50 rounded-lg border border-border min-h-[200px] flex flex-col items-center justify-center">
      <ShieldX className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="font-bold">No Rankings Yet</h3>
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

function TopOrders() {
  const suiClient = useSuiClient();
  const registryId = useNetworkVariable("registryId");
  const [cults, setCults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!registryId) return;
    setIsLoading(true);
    // A small delay to make the skeleton loader visible for demo purposes
    setTimeout(() => {
      suiClient
        .getObject({ id: registryId, options: { showContent: true } })
        .then((registryObject) => {
          const tableId = getFields(registryObject)?.cults.fields.id.id;
          if (!tableId) return Promise.resolve(null);
          return suiClient.getDynamicFields({ parentId: tableId });
        })
        .then(async (dynamicFields) => {
          if (!dynamicFields || dynamicFields.data.length === 0) {
            setCults([]);
            return;
          }
          const cultIds = dynamicFields.data.map(
            (field) => field.name.value as string,
          );
          const cultObjects = await suiClient.multiGetObjects({
            ids: cultIds,
            options: { showContent: true },
          });

          const sortedCults = cultObjects
            .filter((c) => c.data)
            .sort(
              (a, b) =>
                Number(getFields(b)?.total_faith || 0) -
                Number(getFields(a)?.total_faith || 0),
            );

          setCults(sortedCults);
        })
        .catch((error) => console.error("Failed to fetch cults:", error))
        .finally(() => setIsLoading(false));
    }, 500);
  }, [registryId, suiClient]);

  if (isLoading) return <LeaderboardSkeleton />;
  if (cults.length === 0)
    return <EmptyState message="No Orders have been founded yet." />;

  return (
    <div className="space-y-4">
      {cults.map((cult, index) => {
        const fields = getFields(cult);
        if (!fields) return null;
        const rank = index + 1;
        const rankColor =
          rank === 1
            ? "text-yellow-400"
            : rank === 2
              ? "text-slate-400"
              : rank === 3
                ? "text-orange-400"
                : "text-muted-foreground";

        return (
          <div
            key={cult.data.objectId}
            className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border"
          >
            <div className="flex items-center gap-4">
              <span
                className={cn("font-bold text-xl w-8 text-center", rankColor)}
              >
                {rank}
              </span>
              <img
                src={fields.image_url}
                alt={fields.name}
                className="h-12 w-12 rounded-md object-cover"
              />
              <div>
                <p className="font-bold">{fields.name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" /> {fields.member_count} Followers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-bold text-yellow-400">
              <Sparkles className="h-4 w-4" />
              {fields.total_faith}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TopDevotees() {
  // NOTE: A true on-chain leaderboard for all players is very complex and requires
  // a different smart contract design (e.g., a central registry for all amulets).
  // The previous attempt caused errors because the query method is not available in this SDK version.
  return (
    <div className="text-center p-8 bg-background/50 rounded-lg border border-border min-h-[200px] flex flex-col items-center justify-center">
      <Construction className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="font-bold">Feature Under Construction</h3>
      <p className="text-muted-foreground text-sm max-w-xs">
        A global ranking of devotees requires a smart contract upgrade for
        efficiency. Stay tuned!
      </p>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <Card className="w-full bg-card/80 border-border">
        <CardHeader className="items-center text-center">
          <Trophy className="h-12 w-12 text-yellow-400 mx-auto" />
          <CardTitle
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
            className="text-3xl"
          >
            Hall of Devotion
          </CardTitle>
          <CardDescription>
            The most revered Orders and Devotees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="orders">Top Orders</TabsTrigger>
              <TabsTrigger value="devotees">Top Devotees</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="mt-6">
              <TopOrders />
            </TabsContent>
            <TabsContent value="devotees" className="mt-6">
              <TopDevotees />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
