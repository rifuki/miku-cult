import { useEffect, useState } from "react";

import { Users, LogIn, CheckCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CultListProps {
  registryId: string;
  packageId: string;
  hasAmulet: boolean;
  currentUserShrineId?: string;
}

function getFields(obj: any) {
  if (obj?.data?.content?.dataType === "moveObject")
    return obj.data.content.fields;
  return null;
}

export default function CultList({
  registryId,
  packageId,
  hasAmulet,
  currentUserShrineId,
}: CultListProps) {
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const [cults, setCults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!registryId) return;
    setIsLoading(true);
    suiClient
      .getObject({ id: registryId, options: { showContent: true } })
      .then((registryObject) => {
        const tableId = getFields(registryObject)?.cults.fields.id.id;
        if (!tableId) {
          setCults([]);
          setIsLoading(false);
          return;
        }
        return suiClient.getDynamicFields({ parentId: tableId });
      })
      .then(async (dynamicFields) => {
        if (!dynamicFields || dynamicFields.data.length === 0) {
          setCults([]);
          setIsLoading(false);
          return;
        }
        const cultIds = dynamicFields.data.map(
          (field) => field.name.value as string,
        );
        const cultObjects = await suiClient.multiGetObjects({
          ids: cultIds,
          options: { showContent: true },
        });
        setCults(cultObjects.filter((c) => c.data));
      })
      .catch((error) => {
        console.error("Failed to fetch cults:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [registryId, suiClient]);

  const handleJoin = (shrineId: string) => {
    const txb = new Transaction();
    txb.moveCall({
      target: `${packageId}::miku_cult::join_cult`,
      arguments: [txb.object(shrineId)],
    });

    signAndExecute(
      { transaction: txb },
      {
        onSuccess: () => {
          alert("Successfully joined the Order!");
          queryClient.invalidateQueries();
        },
        onError: (err) => {
          alert(`Failed to join: ${err.message}`);
        },
      },
    );
  };

  return (
    <Card className="w-full bg-card/80 border-border p-6 shadow-lg">
      <h2
        className="text-center text-3xl mb-8"
        style={{ fontFamily: "'Cinzel Decorative', serif" }}
      >
        Choose Your Order
      </h2>

      {isLoading ? (
        <p className="text-muted-foreground animate-pulse text-center py-8">
          Summoning the Orders...
        </p>
      ) : cults.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 min-h-[200px] flex items-center justify-center">
          <p>
            No orders have been founded yet. <br /> Be the first.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cults.map((cult) => {
            const fields = getFields(cult);
            if (!fields) return null;
            const isCurrentMember = cult.data.objectId === currentUserShrineId;

            return (
              <Card
                key={cult.data.objectId}
                className={`p-0 gap-0 bg-background/50 border-border flex flex-col overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 ${
                  isCurrentMember ? "!border-primary" : ""
                }`}
              >
                <div className="relative w-full aspect-square bg-black">
                  <img
                    src={fields.image_url}
                    alt={fields.name}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/unknown.jpg";
                    }}
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg">{fields.name}</h3>
                  <p className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                    <Users className="h-4 w-4" /> {fields.member_count}{" "}
                    Followers
                  </p>
                  <div className="mt-auto pt-4">
                    {isCurrentMember ? (
                      <Button className="w-full" variant="outline" disabled>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Current Order
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleJoin(cult.data.objectId)}
                        className="w-full"
                        disabled={hasAmulet}
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        {hasAmulet ? "Devotion is Singular" : "Pledge Fealty"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Card>
  );
}
