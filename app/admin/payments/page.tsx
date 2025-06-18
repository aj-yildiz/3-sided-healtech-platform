import { getAllPayments, updatePaymentDistributionStatus } from "@/app/actions/admin-actions"
import { MainNav } from "@/components/main-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DollarSign } from "lucide-react"

export default async function AdminPayments() {
  const payments = await getAllPayments()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const handleUpdatePaymentStatus = async (distributionId: number, status: string) => {
    "use server"
    await updatePaymentDistributionStatus(distributionId, status)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 p-6">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Payment Management</h1>
            <Button>Process New Payment</Button>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Payment Overview</CardTitle>
              <CardDescription>Summary of all payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <DollarSign className="h-10 w-10 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold">
                      {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <DollarSign className="h-10 w-10 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Payments</p>
                    <p className="text-3xl font-bold">
                      {formatCurrency(
                        payments
                          .filter((payment) => payment.status === "pending")
                          .reduce((sum, payment) => sum + payment.amount, 0),
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <DollarSign className="h-10 w-10 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Payments</p>
                    <p className="text-3xl font-bold">
                      {formatCurrency(
                        payments
                          .filter((payment) => payment.status === "completed")
                          .reduce((sum, payment) => sum + payment.amount, 0),
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="all" className="mt-8">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
              <TabsTrigger value="all">All Payments</TabsTrigger>
              <TabsTrigger value="providers">Provider Payments</TabsTrigger>
              <TabsTrigger value="gyms">Gym Payments</TabsTrigger>
              <TabsTrigger value="insurance">Insurance Claims</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Payment Transactions</CardTitle>
                  <CardDescription>Complete history of payment transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Transaction ID</th>
                          <th className="text-left p-2">Appointment</th>
                          <th className="text-left p-2">Amount</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id} className="border-b">
                            <td className="p-2">{formatDate(payment.created_at)}</td>
                            <td className="p-2">{payment.transaction_reference || payment.id}</td>
                            <td className="p-2">
                              {payment.appointments ? (
                                <span>
                                  {payment.appointments.patients?.name} with {payment.appointments.doctors?.name}
                                </span>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td className="p-2">{formatCurrency(payment.amount)}</td>
                            <td className="p-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  payment.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : payment.status === "failed"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </span>
                            </td>
                            <td className="p-2">
                              <form>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  formAction={async () => {
                                    "use server"
                                    // In a real app, you would implement payment processing logic here
                                  }}
                                >
                                  View
                                </Button>
                              </form>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="providers" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Healthcare Provider Payments</CardTitle>
                  <CardDescription>Payments to healthcare providers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="mt-2 text-muted-foreground">Provider payment data will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gyms" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gym Payments</CardTitle>
                  <CardDescription>Payments to fitness locations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="mt-2 text-muted-foreground">Gym payment data will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insurance" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Insurance Claims</CardTitle>
                  <CardDescription>Insurance claim payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="mt-2 text-muted-foreground">Insurance claim data will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
