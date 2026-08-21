"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BookingsList,
  type BookingListItem,
} from "@/components/bookings/bookings-list";

export function BookingsTabs({
  upcoming,
  past,
  viewerId,
}: {
  upcoming: BookingListItem[];
  past: BookingListItem[];
  viewerId?: string;
}) {
  return (
    <Tabs defaultValue="upcoming" className="gap-6">
      <TabsList className="grid w-full grid-cols-2 sm:w-auto">
        <TabsTrigger value="upcoming" className="flex-1 sm:flex-none">
          Upcoming
        </TabsTrigger>
        <TabsTrigger value="past" className="flex-1 sm:flex-none">
          Past
        </TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming" className="mt-6">
        <BookingsList bookings={upcoming} viewerId={viewerId} />
      </TabsContent>
      <TabsContent value="past" className="mt-6">
        <BookingsList bookings={past} viewerId={viewerId} />
      </TabsContent>
    </Tabs>
  );
}