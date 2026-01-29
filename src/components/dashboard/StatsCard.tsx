import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const StatsCard = ({
  title,
  value,
  description,
  icon,
  loading = false,
}: StatsCardProps) => {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-8 w-[80px]" />
          {description && <Skeleton className="h-4 w-[160px]" />}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 bg-card/80 dark:bg-card/60 backdrop-blur-sm border-border hover:border-primary/30">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
          {description && (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
    </Card>
  );
};