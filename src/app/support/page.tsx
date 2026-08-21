import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MessageSquare, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Customer Care",
  description: "Get help and support from the SearveEASE team.",
};

export default function SupportPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Customer Care</h1>
        <p className="mt-2 text-muted-foreground">
          We&apos;re here to help. Reach out through any of the channels below.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-4" aria-hidden />
              Email Support
            </CardTitle>
            <CardDescription>We typically respond within 24 hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="mailto:support@searveease.com"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              support@searveease.com
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="size-4" aria-hidden />
              Phone Support
            </CardTitle>
            <CardDescription>Available Monday to Friday, 9am - 6pm.</CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="tel:+2348000000000"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              +234 800 000 0000
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="size-4" aria-hidden />
              Live Chat
            </CardTitle>
            <CardDescription>Chat with our support team in real time.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Live chat is available from your dashboard after logging in.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-4" aria-hidden />
              Response Time
            </CardTitle>
            <CardDescription>Average first response time.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">Under 2 hours during business hours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
