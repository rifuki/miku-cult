// src/components/layout/header.tsx
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import MobileNav from "./mobile-nav";
import CustomConnectButton from "../wallet/custom-connect-button";
import { useState } from "react";

export default function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <header className="dark sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border/50 bg-card/30 px-4 backdrop-blur-lg relative">
      {/* --- Left Group (for Mobile) --- */}
      {/* This group contains the menu and title, and is only a flex container on mobile */}
      <div className="flex items-center gap-2 md:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 border-r-0 bg-card/80">
            <SheetHeader className="sr-only">
              <SheetTitle>Main Menu</SheetTitle>
              <SheetDescription>
                Navigation links for the Miku Cult Simulator application.
              </SheetDescription>
            </SheetHeader>
            <MobileNav onLinkClick={() => setIsSheetOpen(false)} />
          </SheetContent>
        </Sheet>
        <h1
          className="text-lg font-bold text-primary whitespace-nowrap"
          style={{ fontFamily: "'Cinzel Decorative', serif" }}
        >
          Miku Cult Simulator
        </h1>
      </div>

      {/* --- Desktop Title (Centered) --- */}
      {/* This is absolutely positioned and only visible on desktop */}
      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <h1
          className="text-xl font-bold text-primary whitespace-nowrap"
          style={{ fontFamily: "'Cinzel Decorative', serif" }}
        >
          Miku Cult Simulator
        </h1>
      </div>

      {/* --- Right Section (Connect Button) --- */}
      {/* This div is always on the right */}
      <div className="[&>button]:h-9 [&>button]:px-2 sm:[&>button]:px-3 [&>button]:text-sm ml-auto">
        <CustomConnectButton />
      </div>
    </header>
  );
}
