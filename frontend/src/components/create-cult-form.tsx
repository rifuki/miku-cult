// src/components/create-cult-form.tsx
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
  const [imageUrl, setImageUrl] = useState("");
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleCreateCult = () => {
    if (!name || !imageUrl) {
      alert("Please provide both a name and an image URL for the Order.");
      return;
    }

    const txb = new Transaction();
    txb.moveCall({
      target: `${packageId}::miku_cult::create_cult`,
      arguments: [
        txb.object(registryId),
        txb.pure.string(name),
        txb.pure.string(imageUrl), // Argument baru untuk URL gambar
      ],
    });
    signAndExecute(
      { transaction: txb },
      {
        onSuccess: (result) => {
          alert(
            `Order "${name}" created successfully! Digest: ${result.digest}.`,
          );
          setName("");
          setImageUrl("");
          refetch(); // Memuat ulang data untuk menampilkan perubahan
        },
        onError: (error) => alert(`Failed to create Order: ${error.message}`),
      },
    );
  };

  return (
    <Card className="bg-card/80 border-border">
      <CardHeader>
        <CardTitle
          className="flex items-center gap-2"
          style={{ fontFamily: "'Cinzel Decorative', serif" }}
        >
          <PlusCircle className="h-5 w-5 text-green-400" />
          Found a New Order
        </CardTitle>
        <CardDescription>
          Create your own legacy within the faith.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Name of your order..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-background"
        />
        <Input
          placeholder="Image URL for your order's banner..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="bg-background"
        />
        <Button
          onClick={handleCreateCult}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Create Order
        </Button>
      </CardContent>
    </Card>
  );
}
