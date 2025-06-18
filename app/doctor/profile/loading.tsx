import { MainNav } from "@/components/main-nav"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-6">
        <div className="container max-w-3xl">
          <Skeleton className="h-10 w-48 mb-6" />

          <div className="space-y-2 mb-6">
            <Skeleton className="h-10 w-full" />
          </div>

          <Skeleton className="h-[400px] w-full rounded-md" />
        </div>
      </main>
    </div>
  )
}
