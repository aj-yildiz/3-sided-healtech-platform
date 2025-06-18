import { MainNav } from "@/components/main-nav"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-6">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>

          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <Tabs defaultValue="upcoming" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming">
                  <div className="grid gap-4">
                    {Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div className="space-y-4 w-full md:w-2/3">
                                <div className="flex items-center gap-2">
                                  <Skeleton className="h-6 w-40" />
                                  <Skeleton className="h-5 w-24" />
                                </div>
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-64" />
                              </div>
                              <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                                <Skeleton className="h-6 w-24" />
                                <div className="flex gap-2 mt-2">
                                  <Skeleton className="h-9 w-24" />
                                  <Skeleton className="h-9 w-20" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="calendar">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-[600px] w-full" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
