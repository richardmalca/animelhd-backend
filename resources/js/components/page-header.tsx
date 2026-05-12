import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title: React.ReactNode
    subtitle?: React.ReactNode
    children?: React.ReactNode
    className?: string
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between gap-4", className)}>
            <div className="space-y-0.5">
                <h1 className="text-3xl font-bold tracking-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-muted-foreground">
                        {subtitle}
                    </p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-2">
                    {children}
                </div>
            )}
        </div>
    )
}
