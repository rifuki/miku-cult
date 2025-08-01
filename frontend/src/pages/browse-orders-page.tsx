// src/pages/browse-orders-page.tsx
"use client";

import CultList from "@/components/cult-list";
import CreateCultForm from "@/components/create-cult-form";
import FounderDashboard from "@/components/founder-dashboard";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useNetworkVariable } from "@/networkConfig";

function getFields(obj: any) {
  if (obj?.data?.content?.dataType === "moveObject") {
    return obj.data.content.fields;
  }
  return null;
}

export default function BrowseOrdersPage() {
  const account = useCurrentAccount();
  const packageId = useNetworkVariable("packageId");
  const registryId = useNetworkVariable("registryId");

  const { data: founderCapData, refetch: refetchFounderCap } =
    useSuiClientQuery(
      "getOwnedObjects",
      {
        owner: account?.address!,
        filter: { StructType: `${packageId}::miku_cult::CultFounderCap` },
        options: { showContent: true, showType: true },
      },
      { enabled: !!account && !!packageId },
    );

  const founderCaps = founderCapData?.data || [];

  const refetchAll = () => {
    refetchFounderCap();
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="w-full max-w-2xl z-0">
        <CultList
          registryId={registryId}
          packageId={packageId}
          refetch={() => {}}
        />
      </div>

      {account && (
        <div className="w-full max-w-2xl mt-8 space-y-8">
          {founderCaps.map((cap: any) => {
            const fields = getFields(cap);
            if (!fields) return null;
            return (
              <FounderDashboard
                key={fields.id.id}
                founderCap={cap}
                shrineId={fields.shrine_id}
                packageId={packageId}
                refetch={refetchAll}
              />
            );
          })}
          <CreateCultForm
            registryId={registryId}
            packageId={packageId}
            refetch={refetchAll}
          />
        </div>
      )}
    </div>
  );
}
