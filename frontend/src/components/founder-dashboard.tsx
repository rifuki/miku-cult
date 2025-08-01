// src/components/founder-dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { useSuiClient } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wrench, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface FounderDashboardProps {
  founderCap: any;
  shrineId: string;
  packageId: string;
  refetch: () => void;
}

// Helper function to safely get fields from a Sui object
function getFields(obj: any) {
  // This function now expects the full SuiObjectResponse
  if (obj?.data?.content?.dataType === "moveObject") {
    return obj.data.content.fields;
  }
  return null;
}

export default function FounderDashboard({ shrineId }: FounderDashboardProps) {
  const suiClient = useSuiClient();
  const [shrineInfo, setShrineInfo] = useState<any>(null);

  // Fetch the specific details of the shrine this cap belongs to
  useEffect(() => {
    if (shrineId) {
      suiClient
        .getObject({ id: shrineId, options: { showContent: true } })
        .then((res) => {
          setShrineInfo(res);
        });
    }
  }, [shrineId, suiClient]);

  // Get the fields from the full response object
  const shrineFields = getFields(shrineInfo);

  return (
    <Card className="bg-card/80 border-purple-500/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-purple-400" />
              <span style={{ fontFamily: "'Cinzel Decorative', serif" }}>
                Founder's Panel
              </span>
            </CardTitle>
            <CardDescription className="mt-1">
              You have administrative rights over this Order.
            </CardDescription>
          </div>
          <Button asChild variant="secondary">
            <Link to={`/orders/${shrineId}/settings`}>Go to Settings</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {shrineInfo && shrineFields ? (
          <div className="p-4 bg-background/50 rounded-lg border border-border flex items-center gap-4">
            <img
              src={shrineFields.image_url}
              alt={shrineFields.name}
              className="h-16 w-16 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "unknown.jpg";
              }}
            />
            <div>
              <h3 className="font-bold text-lg">{shrineFields.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                {shrineFields.member_count} Followers
              </p>
            </div>
          </div>
        ) : (
          <p className="p-6 pt-0 text-muted-foreground animate-pulse">
            Loading Order details...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
