import { FileQuestion, Filter, Search, DatabaseZap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  type?: "no-data" | "no-results" | "no-filters" | "error"
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({
  type = "no-results",
  title,
  description,
  action
}: EmptyStateProps) {
  const config = {
    "no-data": {
      icon: DatabaseZap,
      defaultTitle: "No Data Available",
      defaultDescription: "There's no data to display at the moment. Please check back later.",
      iconColor: "text-muted-foreground",
    },
    "no-results": {
      icon: FileQuestion,
      defaultTitle: "No Results Found",
      defaultDescription: "We couldn't find any items matching your current filters. Try adjusting your search criteria.",
      iconColor: "text-primary",
    },
    "no-filters": {
      icon: Filter,
      defaultTitle: "Apply Filters to Get Started",
      defaultDescription: "Select filters from the sidebar to view relevant data and insights.",
      iconColor: "text-accent",
    },
    "error": {
      icon: Search,
      defaultTitle: "Something Went Wrong",
      defaultDescription: "We encountered an error while loading the data. Please try again.",
      iconColor: "text-destructive",
    },
  }

  const { icon: Icon, defaultTitle, defaultDescription, iconColor } = config[type]

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center animate-fade-in">
      <div className={`mb-6 p-6 rounded-full bg-muted/50 ${iconColor}`}>
        <Icon className="h-16 w-16" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {title || defaultTitle}
      </h3>
      <p className="text-muted-foreground max-w-md mb-6">
        {description || defaultDescription}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="default" className="animate-scale-in">
          {action.label}
        </Button>
      )}
    </div>
  )
}
