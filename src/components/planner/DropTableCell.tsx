import { FC, useEffect, useRef, useState } from "react";
import { TableCell } from "../ui/table";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Resource } from "@/models";
import { cn } from "@/lib/utils";
import { useCalendar } from "@/contexts/planner/PlannerContext";

interface DropTableCellProps
  extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  resourceId: string;
  columnIndex: number;
}

const DropTableCell: FC<DropTableCellProps> = ({
  children,
  resourceId,
  columnIndex,
  ...props
}) => {
  const ref = useRef<HTMLTableCellElement>(null);
  const [isOver, setIsOver] = useState(false);
  const { viewMode } = useCalendar()
  useEffect(() => {
    const element = ref.current;

    if (viewMode === "month" || !element) return;

    return dropTargetForElements({
      element,
      getData: () => {
        return { resourceId: resourceId, columnIndex: columnIndex };
      },
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: () => {
        setIsOver(false);
      },
    });
  }, [columnIndex, resourceId, viewMode]);
  
  return (
    <TableCell className={cn("first:border-0 last:border-0 border dark:border-x-neutral-700 border-b-0 bg-background w-[calc(100%/7)]", isOver ? "bg-primary-foreground" : "bg-background"  )} ref={ref} {...props}>
      <div className="grid grid-flow-row grid-cols gap-2 w-full justify-items-center">{children}</div>
    </TableCell>
  );
};

export default DropTableCell;
