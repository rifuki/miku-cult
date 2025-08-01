// src/components/FounderDashboard.tsx
import { useState } from "react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit } from "lucide-react";

interface FounderDashboardProps {
  founderCap: any;
  shrineId: string;
  packageId: string;
  refetch: () => void;
}

export default function FounderDashboard({
  founderCap,
  shrineId,
  packageId,
  refetch,
}: FounderDashboardProps) {
  const [newName, setNewName] = useState("");
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const founderCapId = founderCap.data.objectId;

  const handleEditName = () => {
    if (!newName) return alert("New name cannot be empty.");

    const txb = new Transaction();
    txb.moveCall({
      target: `${packageId}::miku_cult::edit_cult_name`,
      arguments: [
        txb.object(founderCapId),
        txb.object(shrineId),
        txb.pure.string(newName),
      ],
    });

    signAndExecute(
      { transaction: txb },
      {
        onSuccess: (result) => {
          alert(`Cult name changed successfully! Digest: ${result.digest}`);
          setNewName("");
          refetch();
        },
        onError: (error) => alert(`Failed to change name: ${error.message}`),
      },
    );
  };

  return (
    <Card className="bg-card border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5 text-purple-400" />
          Founder's Panel
        </CardTitle>
        <CardDescription>
          Administrative actions for your cult.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <label htmlFor="cult-name" className="text-sm font-medium text-muted-foreground">
          Change Cult Name
        </label>
        <div className="flex gap-2">
          <Input
            id="cult-name"
            placeholder="Enter new name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bg-background"
          />
          <Button onClick={handleEditName} variant="secondary">
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
