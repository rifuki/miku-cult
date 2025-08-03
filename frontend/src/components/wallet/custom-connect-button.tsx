import {
  useCurrentAccount,
  useCurrentWallet,
  useDisconnectWallet,
  ConnectModal,
} from "@mysten/dapp-kit";
import { Wallet, LogOut, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formatAddress = (addr: string) =>
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;
const formatAddressShort = (addr: string) => `${addr.slice(0, 4)}...`;

export default function CustomConnectButton() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { currentWallet } = useCurrentWallet();

  if (account) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary/10 flex items-center gap-2"
          >
            {currentWallet?.icon && (
              <img
                src={currentWallet.icon}
                alt={currentWallet.name}
                className="h-4 w-4"
              />
            )}
            <span className="hidden sm:inline">
              {formatAddress(account.address)}
            </span>
            <span className="sm:hidden">
              {formatAddressShort(account.address)}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="dark bg-card border-border">
          <DropdownMenuItem
            onClick={() => disconnect()}
            className="cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <ConnectModal
      trigger={
        <Button
          variant="outline"
          className="border-primary/50 text-primary hover:bg-primary/10"
        >
          <Wallet className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Connect Wallet</span>
        </Button>
      }
    />
  );
}
