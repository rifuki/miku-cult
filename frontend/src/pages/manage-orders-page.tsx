import { useMemo } from "react";

import { ShieldAlert, Users, Sparkles } from "lucide-react";

import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { useNetworkVariable } from "@/networkConfig";
import { EditCultDialog } from "@/components/edit-cult-dialog";

function getFields(obj: any) {
  if (obj?.data?.content?.dataType === "moveObject")
    return obj.data.content.fields;
  return null;
}

export default function ManageOrdersPage() {
  const account = useCurrentAccount();
  const packageId = useNetworkVariable("packageId");

  // Step 1: Fetch all Founder Caps the user owns. This part was correct.
  const {
    data: founderCapData,
    isLoading: isLoadingCaps,
    refetch: refetchFounderCaps,
  } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address!,
      filter: { StructType: `${packageId}::miku_cult::CultFounderCap` },
      options: { showContent: true },
    },
    { enabled: !!account?.address && !!packageId },
  );

  // Step 2: From the caps, extract the IDs of the shrines they control.
  const shrineIds = useMemo(() => {
    if (!founderCapData?.data) return [];
    return founderCapData.data
      .map((cap) => getFields(cap)?.shrine_id)
      .filter(Boolean); // Filter out any null/undefined IDs
  }, [founderCapData]);

  // Step 3: Fetch the specific CultShrine objects using the extracted IDs.
  const {
    data: shrinesData,
    isLoading: isLoadingShrines,
    refetch: refetchShrines,
  } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids: shrineIds,
      options: { showContent: true },
    },
    { enabled: shrineIds.length > 0 }, // Only run this query if we have IDs
  );

  // Step 4: Create a lookup map for easy access in the render function.
  const shrineMap = useMemo(() => {
    const map = new Map();
    if (shrinesData) {
      for (const shrine of shrinesData) {
        if (shrine.data) {
          map.set(shrine.data.objectId, getFields(shrine));
        }
      }
    }
    return map;
  }, [shrinesData]);

  const founderCaps = founderCapData?.data || [];
  const isLoading = isLoadingCaps || (shrineIds.length > 0 && isLoadingShrines);

  const refetchAll = () => {
    refetchFounderCaps().then(() => {
      refetchShrines();
    });
  };

  if (isLoading) {
    return (
      <p className="text-muted-foreground animate-pulse text-center">
        Verifying credentials and fetching Orders...
      </p>
    );
  }

  if (!founderCaps.length) {
    return (
      <Card className="w-full max-w-2xl bg-card/80 border-destructive text-center">
        <CardHeader>
          <div className="mx-auto bg-destructive/20 rounded-full p-3 w-fit">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
            className="mt-4"
          >
            Access Denied
          </CardTitle>
          <CardDescription>
            Only Founders may access this sanctuary. Create an Order to gain
            access.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in">
      <div className="text-center">
        <h2
          className="text-3xl"
          style={{ fontFamily: "'Cinzel Decorative', serif" }}
        >
          Founder's Sanctuary
        </h2>
        <p className="text-muted-foreground mt-2">
          Manage all Orders you have founded.
        </p>
      </div>
      <div className="space-y-6">
        {founderCaps.map((cap: any) => {
          const capFields = getFields(cap);
          if (!capFields) return null;
          const shrineDetails = shrineMap.get(capFields.shrine_id);

          return (
            <Card key={capFields.id.id} className="bg-card/80 border-border">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {shrineDetails ? (
                    <img
                      src={shrineDetails.image_url}
                      alt={shrineDetails.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-lg bg-muted animate-pulse"></div>
                  )}
                  <div>
                    <h3 className="font-bold text-xl">
                      {shrineDetails?.name || "Loading..."}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />{" "}
                        {shrineDetails?.member_count ?? "..."} Followers
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-yellow-400" />{" "}
                        {shrineDetails?.total_faith ?? "..."} Faith
                      </span>
                    </div>
                  </div>
                </div>
                {shrineDetails && (
                  <EditCultDialog
                    founderCapId={cap.data.objectId}
                    shrineId={capFields.shrine_id}
                    currentName={shrineDetails.name}
                    currentImageUrl={shrineDetails.image_url}
                    packageId={packageId}
                    onUpdate={refetchAll}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
