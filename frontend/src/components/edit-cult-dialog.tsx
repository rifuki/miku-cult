import { useState, useCallback } from "react";

import { useDropzone } from "react-dropzone";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {
  Edit,
  UploadCloud,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

interface EditCultDialogProps {
  founderCapId: string;
  shrineId: string;
  currentName: string;
  currentImageUrl: string;
  packageId: string;
  onUpdate: () => void;
}

export function EditCultDialog({
  founderCapId,
  shrineId,
  currentName,
  currentImageUrl,
  packageId,
  onUpdate,
}: EditCultDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setUploadStatus("idle");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".gif"] },
    multiple: false,
  });

  const handleSave = async () => {
    let finalImageUrl = currentImageUrl;
    // Step 1: Upload to Pinata if a new image file exists
    if (imageFile) {
      if (!PINATA_JWT) {
        alert("Pinata JWT is not configured in .env file.");
        setUploadStatus("error");
        return;
      }
      setUploadStatus("uploading");
      const formData = new FormData();
      formData.append("file", imageFile);

      try {
        const res = await fetch(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${PINATA_JWT}`,
            },
            body: formData,
          },
        );
        const data = await res.json();
        if (data.IpfsHash) {
          finalImageUrl = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
          setUploadStatus("success");
        } else {
          throw new Error("Failed to get IPFS hash from Pinata.");
        }
      } catch (error) {
        console.error("Pinata upload error:", error);
        alert("Failed to upload image to Pinata.");
        setUploadStatus("error");
        return;
      }
    }

    // Step 2: Build and execute the Sui transaction
    const txb = new Transaction();
    let hasChanges = false;

    if (name !== currentName) {
      hasChanges = true;
      txb.moveCall({
        target: `${packageId}::miku_cult::edit_cult_name`,
        arguments: [
          txb.object(founderCapId),
          txb.object(shrineId),
          txb.pure.string(name),
        ],
      });
    }

    if (finalImageUrl !== currentImageUrl) {
      hasChanges = true;
      txb.moveCall({
        target: `${packageId}::miku_cult::edit_cult_image`,
        arguments: [
          txb.object(founderCapId),
          txb.object(shrineId),
          txb.pure.string(finalImageUrl),
        ],
      });
    }

    if (!hasChanges) {
      alert("No changes to save.");
      return;
    }

    signAndExecute(
      { transaction: txb },
      {
        onSuccess: () => {
          alert("Order updated successfully!");
          onUpdate();
          setOpen(false);
        },
        onError: (err) => {
          alert(`Failed to update order: ${err.message}`);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Edit className="mr-2 h-4 w-4" /> Edit Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Order</DialogTitle>
          <DialogDescription>
            Update the name and banner of your founded Order. Changes are
            permanent.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Order Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Banner Image</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="h-8 w-8" />
                {isDragActive ? (
                  <p>Drop the image here...</p>
                ) : (
                  <p>Drag 'n' drop an image here, or click to select</p>
                )}
              </div>
            </div>
            {preview && (
              <div className="mt-4 flex items-center justify-center gap-4 p-2 border rounded-lg">
                <img
                  src={preview}
                  alt="Image Preview"
                  className="h-24 w-24 object-cover rounded-md"
                />
                <div className="text-sm">
                  {uploadStatus === "uploading" && (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Uploading to
                      IPFS...
                    </p>
                  )}
                  {uploadStatus === "success" && (
                    <p className="flex items-center gap-2 text-green-500">
                      <CheckCircle className="h-4 w-4" /> Ready to be saved
                    </p>
                  )}
                  {uploadStatus === "error" && (
                    <p className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" /> Upload failed
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={isPending || uploadStatus === "uploading"}
          >
            {(isPending || uploadStatus === "uploading") && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
