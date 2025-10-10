import type { ReactNode } from "react";

interface PageHeaderProps {
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-headline">{title}</h1>
                {description && (
                    <div className="text-muted-foreground">{description}</div>
                )}
            </div>
            {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
        </div>
    )
}
