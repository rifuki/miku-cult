// src/components/CultList.tsx
import { useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, LogIn } from "lucide-react";

interface CultListProps {
  registryId: string;
  packageId: string;
  refetch: () => void;
}

// Helper function
function getFields(obj: any) {
  if (obj?.data?.content?.dataType === "moveObject") {
    return obj.data.content.fields;
  }
  return null;
}

export default function CultList({
  registryId,
  packageId,
  refetch,
}: CultListProps) {
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [cults, setCults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!registryId) return;
    setIsLoading(true);

    // FIXED: Two-step fetch process
    // Step 1: Get the Registry object to find the Table ID
    suiClient
      .getObject({ id: registryId, options: { showContent: true } })
      .then((registryObject) => {
        const registryFields = getFields(registryObject);
        if (!registryFields) return;

        const tableId = registryFields.cults.fields.id.id;

        // Step 2: Get dynamic fields from the Table ID
        return suiClient.getDynamicFields({ parentId: tableId });
      })
      .then(async (dynamicFields) => {
        if (!dynamicFields) {
          setCults([]);
          setIsLoading(false);
          return;
        }

        const cultIds = dynamicFields.data.map(
          (field) => field.name.value as string,
        );
        if (cultIds.length === 0) {
          setCults([]);
          setIsLoading(false);
          return;
        }

        const cultObjects = await suiClient.multiGetObjects({
          ids: cultIds,
          options: { showContent: true },
        });
        setCults(cultObjects.filter((c) => c.data));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch cults:", error);
        setIsLoading(false);
      });
  }, [registryId, suiClient]);

  const handleJoin = (shrineId: string) => {
    const txb = new Transaction();
    txb.moveCall({
      target: `${packageId}::miku_cult::join_cult`,
      arguments: [txb.object(shrineId)],
    });
    signAndExecute({ transaction: txb }, { onSuccess: () => refetch() });
  };

  if (isLoading)
    return (
      <p className="text-muted-foreground animate-pulse text-center">
        Summoning the Orders...
      </p>
    );

  return (
    <div className="space-y-6 backdrop-blur-sm bg-card/50 p-8 rounded-lg border border-border">
      <h2
        className="text-center text-2xl text-slate-300"
        style={{ fontFamily: "'Cinzel Decorative', serif" }}
      >
        Choose Your Order
      </h2>
      {cults.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No orders have been founded yet. Be the first.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cults.map((cult) => {
            const fields = getFields(cult);
            if (!fields) return null;
            return (
              <Card
                key={cult.data.objectId}
                className="bg-background/50 border-border hover:border-primary/50 transition-colors"
              >
                <CardHeader>
                  <CardTitle>{fields.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Users className="h-4 w-4" /> {fields.member_count}{" "}
                    Followers
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    onClick={() => handleJoin(cult.data.objectId)}
                    className="w-full"
                  >
                    <LogIn className="mr-2 h-4 w-4" /> Pledge Fealty
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
