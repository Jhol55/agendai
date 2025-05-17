import { cn } from "@/lib/utils"
import { Typography } from "../typography"


export const HorizontalSeparator = ({ label, variant }: { label?: string, variant?: "b" | "h1" | "h2" | "h3" | "h4" | "h5" | "p" | "span" }) => {
    return (
        <div className={cn("flex w-full h-2 items-center", label && "gap-2")}>
            <div className="border-t w-full h-[1px] border-neutral-400" />
            {label && <Typography variant={variant} className="!text-neutral-700">{label}</Typography>}
            <div className="border-t w-full h-[1px] border-neutral-400" />
        </div>
    )
}