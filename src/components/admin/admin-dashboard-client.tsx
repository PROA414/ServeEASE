"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginationControls, type PaginationData } from "@/components/ui/pagination";
import { Loader2, Users, CalendarDays, Wallet, Shield } from "lucide-react";
import { refundBooking, adjustUserCredits } from "@/app/actions/admin";
import { ResolveDisputeButton } from "@/components/admin/resolve-dispute-button";
import { formatCredits, formatDate } from "@/lib/format";
import type { BookingListItem } from "@/components/bookings/bookings-list";

type AdminStats = {
  users: number;
  providers: number;
  bookings: number;
  revenue: number;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  providerProfile: { id: string; category: string } | null;
};

type AdminDispute = {
  id: string;
  reason: string;
  status: string;
  resolution: string | null;
  adminNote: string | null;
  createdAt: Date;
  filedBy: { id: string; name: string; email: string };
  booking: {
    id: string;
    totalCredits: number;
    date: Date;
    buyer: { id: string; name: string; email: string };
    provider: {
      user: { id: string; name: string; email: string };
    };
  };
};

type AdminDashboardClientProps = {
  initialStats: AdminStats | null;
  initialBookings: BookingListItem[];
  initialUsers: AdminUser[];
  initialDisputes: AdminDispute[];
  bookingsPagination: PaginationData;
  usersPagination: PaginationData;
  disputesPagination: PaginationData;
  activeTab: "bookings" | "disputes" | "users";
};

export function AdminDashboardClient({
  initialStats,
  initialBookings,
  initialUsers,
  initialDisputes,
  bookingsPagination,
  usersPagination,
  disputesPagination,
  activeTab,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingListItem[]>(initialBookings);
  const [disputes, setDisputes] = useState<AdminDispute[]>(initialDisputes);
  const [adjustingUser, setAdjustingUser] = useState<AdminUser | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditDescription, setCreditDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const stats = initialStats;
  const users = initialUsers;

  const buildPageHref = (tab: string, page: number) => {
    const params = new URLSearchParams();
    if (tab !== "bookings") params.set("tab", tab);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };

  const handleDisputeResolved = (disputeId: string) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId ? { ...d, status: "resolved" } : d
      )
    );
  };

  const handleRefund = async (bookingId: string) => {
    const result = await refundBooking(bookingId);
    if (result.success) {
      toast.success("Booking refunded.");
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "refunded" } : b))
      );
    } else {
      toast.error(result.error);
    }
  };

  const handleAdjustCredits = async () => {
    if (!adjustingUser) return;
    const amount = Number(creditAmount);
    if (!Number.isFinite(amount) || amount === 0) {
      toast.error("Enter a valid credit amount.");
      return;
    }

    setSubmitting(true);
    const result = await adjustUserCredits(
      adjustingUser.id,
      amount,
      creditDescription || "Admin credit adjustment"
    );

    if (result.success) {
      toast.success("Credits adjusted.");
      setAdjustingUser(null);
      setCreditAmount("");
      setCreditDescription("");
    } else {
      toast.error(result.error);
    }
    setSubmitting(false);
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total users
            </CardTitle>
            <Users className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.users ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Providers
            </CardTitle>
            <Shield className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.providers ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bookings
            </CardTitle>
            <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.bookings ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Credit purchases
            </CardTitle>
            <Wallet className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCredits(stats?.revenue ?? 0)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => router.push(buildPageHref(value, 1))}>
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Credits</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-xs">
                          {booking.id}
                        </TableCell>
                        <TableCell className="text-sm">
                          {booking.buyer?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {booking.provider.user.name}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(booking.date)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{booking.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatCredits(booking.totalCredits)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRefund(booking.id)}
                            disabled={["refunded", "cancelled"].includes(booking.status)}
                          >
                            Refund
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <PaginationControls
                pagination={bookingsPagination}
                buildHref={(page) => buildPageHref("bookings", page)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              {disputes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No disputes yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking</TableHead>
                      <TableHead>Filed by</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disputes.map((dispute) => (
                      <TableRow key={dispute.id}>
                        <TableCell className="font-mono text-xs">
                          {dispute.booking.id}
                        </TableCell>
                        <TableCell className="text-sm">
                          {dispute.filedBy.name}
                        </TableCell>
                        <TableCell className="text-sm">
                          {dispute.booking.buyer.name}
                        </TableCell>
                        <TableCell className="text-sm">
                          {dispute.booking.provider.user.name}
                        </TableCell>
                        <TableCell className="max-w-xs text-sm">
                          <span className="line-clamp-2" title={dispute.reason}>
                            {dispute.reason}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={dispute.status === "open" ? "destructive" : "secondary"}
                          >
                            {dispute.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {dispute.status === "open" ? (
                            <ResolveDisputeButton
                              disputeId={dispute.id}
                              buyerName={dispute.booking.buyer.name}
                              providerName={dispute.booking.provider.user.name}
                              onResolved={() => handleDisputeResolved(dispute.id)}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {dispute.resolution === "refund_buyer"
                                ? "Buyer refunded"
                                : "Provider paid"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <PaginationControls
                pagination={disputesPagination}
                buildHref={(page) => buildPageHref("disputes", page)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-sm font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-sm">{user.email}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.providerProfile
                            ? `${user.providerProfile.category}`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAdjustingUser(user)}
                          >
                            Adjust credits
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <PaginationControls
                pagination={usersPagination}
                buildHref={(page) => buildPageHref("users", page)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(adjustingUser)} onOpenChange={(open) => !open && setAdjustingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust credits</DialogTitle>
            <DialogDescription>
              Add or remove credits for {adjustingUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              type="number"
              placeholder="Amount (positive or negative)"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
            />
            <Input
              placeholder="Description (optional)"
              value={creditDescription}
              onChange={(e) => setCreditDescription(e.target.value)}
            />
            <Button
              onClick={handleAdjustCredits}
              disabled={submitting}
              className="w-full"
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Save adjustment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
