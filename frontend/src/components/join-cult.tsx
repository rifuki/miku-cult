import { LogIn } from "lucide-react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface JoinCultProps {
  shrineId: string;
  packageId: string;
  refetch: () => void;
}

export default function JoinCult({
  shrineId,
  packageId,
  refetch,
}: JoinCultProps) {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleJoinCult = () => {
    if (!shrineId || !packageId) {
      alert("Configuration error: Missing Shrine or Package ID.");
      return;
    }
    const txb = new Transaction();
    txb.moveCall({
      target: `${packageId}::miku_cult::join_cult`,
      arguments: [txb.object(shrineId)],
    });

    signAndExecute(
      { transaction: txb },
      {
        onSuccess: (result) => {
          alert(`Successfully joined the cult! Digest: ${result.digest}`);
          refetch();
        },
        onError: (error) => {
          alert(`Failed to join: ${error.message}`);
        },
      },
    );
  };

  return (
    <Card className="bg-card border-border text-center">
      <CardHeader>
        <CardTitle>You Have Not Joined</CardTitle>
        <CardDescription>
          Pledge your loyalty and become a follower to begin your journey.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          You are about to join the main order.
        </p>
        {/* Note: To display the shrine name dynamically, you'd fetch it here */}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleJoinCult}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
        >
          <LogIn className="mr-2 h-4 w-4" /> Join the Cult
        </Button>
      </CardFooter>
    </Card>
  );
}
