import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const IntegrationCardSkeleton = () => {
  return (
    <Card>
      <CardHeader className="min-h-30 flex-col">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <CardTitle>
          <Skeleton className="h-5 w-32" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-1 h-4 w-3/4" />
        </CardDescription>
      </CardHeader>
      <CardFooter className="gap-2.5">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-10" />
      </CardFooter>
    </Card>
  )
}
