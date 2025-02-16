"use client";
import { useEffect, useState } from "react";
import { Appointment, Resource } from "@/models";
import Link from "next/link";
import { CircleUser, Menu, Package2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Planner from "@/components/planner/Planner";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { DateRange } from "react-day-picker";

export function Scheduler() {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const initResources: Resource[] = [{
      id: "a47aaada-005d-4db0-8779-7fddb32d291e",
      name: "Victor Campos",
      type: "person",
      details: {
        description: "",
        image: ""
      }
    }]
    setResources(initResources);
  }, []);

  return (
    <div className="flex w-full flex-col">
      <main className="flex flex-col gap-4 md:gap-8">
        <Planner
          initialResources={resources}
        />
      </main>
    </div>
  );
}