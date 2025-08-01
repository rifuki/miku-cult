// src/components/CreateCultForm.tsx
import { useState } from "react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";

// FIXED: Added registryId and refetch to props
interface CreateCultFormProps {
  registryId: string;
  packageId: string;
  refetch: () => void;
}

export default function CreateCultForm({
  registryId,
  packageId,
  refetch,
}: CreateCultFormProps) {
  const [name, setName] = useState("");
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleCreateCult = () => {
    if (!name) return alert("Please enter a name for the cult.");

    const txb = new Transaction();
    txb.moveCall({
      target: `${packageId}::miku_cult::create_cult`,
      // FIXED: Pass the registryId as the first argument
      arguments: [txb.object(registryId), txb.pure.string(name)],
    });
    signAndExecute(
      { transaction: txb },
      {
        onSuccess: (result) => {
          alert(
            `Cult "${name}" created successfully! Digest: ${result.digest}.`,
          );
          setName("");
          refetch(); // Refetch to update the UI
        },
        onError: (error) => alert(`Failed to create cult: ${error.message}`),
      },
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-green-400" />
          Found a New Order
        </CardTitle>
        <CardDescription>
          Can't find a cult you like? Create your own.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Input
          type="text"
          placeholder="Name of your new order..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-background"
        />
        <Button
          onClick={handleCreateCult}
          variant="secondary"
          className="bg-green-600 hover:bg-green-700"
        >
          Create
        </Button>
      </CardContent>
    </Card>
  );
}
