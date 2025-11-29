"use client"

import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

export function LegalNav() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 bg-muted text-muted-foreground px-4 py-2 lg:px-6 lg:py-3 brutalist-border brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 font-bold uppercase tracking-wide text-sm lg:text-base touch-target focus:outline-none">
                LEGAL <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 brutalist-border brutalist-shadow bg-card p-0">
                <DropdownMenuItem asChild>
                    <Link
                        href="/privacy"
                        className="block w-full px-4 py-3 text-sm font-bold uppercase hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer focus:bg-accent focus:text-accent-foreground"
                    >
                        PRIVACY POLICY
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        href="/terms"
                        className="block w-full px-4 py-3 text-sm font-bold uppercase hover:bg-secondary hover:text-secondary-foreground transition-colors cursor-pointer focus:bg-secondary focus:text-secondary-foreground border-t-2 border-foreground"
                    >
                        TERMS & CONDITIONS
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        href="/disclaimer"
                        className="block w-full px-4 py-3 text-sm font-bold uppercase hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer focus:bg-primary focus:text-primary-foreground border-t-2 border-foreground"
                    >
                        DISCLAIMER
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        href="/dmca"
                        className="block w-full px-4 py-3 text-sm font-bold uppercase hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer focus:bg-destructive focus:text-destructive-foreground border-t-2 border-foreground"
                    >
                        DMCA POLICY
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
