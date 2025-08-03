import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  useCurrentAccount,
  useSuiClient,
  useSuiClientQuery,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

import { useNetworkVariable } from "@/networkConfig";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getFields(obj: any) {
  if (obj?.data?.content?.dataType === "moveObject")
    return obj.data.content.fields;
  return null;
}

export default function OrderSettingsPage() {
  const { shrineId } = useParams();
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("packageId");
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const [shrine, setShrine] = useState<any>(null);
  const [newName, setNewName] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (shrineId) {
      suiClient
        .getObject({ id: shrineId, options: { showContent: true } })
        .then((res) => {
          setShrine(res.data);
          const fields = getFields(res.data);
          setNewName(fields?.name || "");
          setNewImageUrl(fields?.image_url || "");
          setIsLoading(false);
        });
    }
  }, [shrineId, suiClient]);

  const { data: founderCapData } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address!,
      filter: { StructType: `${packageId}::miku_cult::CultFounderCap` },
      options: { showContent: true },
    },
    { enabled: !!account && !!packageId },
  );

  const founderCap = founderCapData?.data.find(
    (cap) => getFields(cap)?.shrine_id === shrineId,
  );

  const handleUpdate = (type: "name" | "image") => {
    if (!founderCap || !founderCap.data)
      return alert("Capability object not found.");

    const txb = new Transaction();
    const value = type === "name" ? newName : newImageUrl;

    txb.moveCall({
      target: `${packageId}::miku_cult::edit_cult_${type}`,
      arguments: [
        txb.object(founderCap.data.objectId),
        txb.object(shrineId!),
        txb.pure.string(value),
      ],
    });
    signAndExecute(
      { transaction: txb },
      {
        onSuccess: () => alert(`Order ${type} updated successfully!`),
      },
    );
  };

  if (isLoading)
    return (
      <p className="text-muted-foreground animate-pulse text-center">
        Loading settings...
      </p>
    );

  if (!founderCap) {
    return (
      <Card className="w-full max-w-2xl bg-card/80 border-destructive">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You are not the founder of this Order.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl bg-card/80 border-border">
      <CardHeader>
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 w-fit"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <CardTitle style={{ fontFamily: "'Cinzel Decorative', serif" }}>
          Order Settings: {getFields(shrine)?.name}
        </CardTitle>
        <CardDescription>
          Manage the details of your founded Order.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="order-name">Order Name</Label>
          <div className="flex gap-2">
            <Input
              id="order-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button onClick={() => handleUpdate("name")}>Save Name</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="order-image">Banner Image URL</Label>
          <div className="flex gap-2">
            <Input
              id="order-image"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
            />
            <Button onClick={() => handleUpdate("image")}>Save Image</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
