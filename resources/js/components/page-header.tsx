import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title: React.ReactNode
    subtitle?: React.ReactNode
    children?: React.ReactNode
    className?: string
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
            <div className="space-y-0.5">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {title}
                </h1>
                {subtitle && (
                    <p className="hidden text-muted-foreground sm:block">
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
