"use client";
import { useEffect, useState } from "react";
import { Resource } from "@/models";
import Planner from "@/components/planner/Planner";

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