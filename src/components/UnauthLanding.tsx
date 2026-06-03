import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  Code2Icon,
  CpuIcon,
  FlameIcon,
  GlobeIcon,
  InfoIcon,
  LayersIcon,
  LockIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ZapIcon,
} from "lucide-react";

export default function UnauthLanding() {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Welcome Card */}
      <Card className="relative overflow-hidden border-border/40 bg-card/65 backdrop-blur-md">
        <div className="absolute -right-16 -top-16 size-48 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 opacity-20 blur-2xl" />
        <div className="absolute -left-16 -bottom-16 size-48 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-500 opacity-15 blur-2xl" />
        
        <CardContent className="pt-8 text-center sm:px-8">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <SparklesIcon className="size-6 text-primary animate-pulse" />
          </div>
          <h1 className="bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
            Welcome to InstaX
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            InstaX is a modern, high-performance open-source social media platform built using Next.js 16, React 19, and Tailwind CSS v4. Connect, share, and experience visual flow.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <SignUpButton mode="modal">
              <Button size="lg" className="cursor-pointer font-semibold shadow-md">
                Get Started Free
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button size="lg" variant="outline" className="cursor-pointer font-semibold">
                Login Account
              </Button>
            </SignInButton>
          </div>
        </CardContent>
      </Card>

      {/* Why InstaX & Benefits Section */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Why Choose InstaX?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
            Built as a next-generation React social media application to resolve feed lag, waterfalled loading states, and media bloating.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-card/40 border-border/20">
            <CardContent className="pt-6">
              <ZapIcon className="size-8 text-amber-500 mb-3" />
              <h3 className="font-semibold text-base mb-1">Optimistic Likes & Feeds</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Experience instant feedback. InstaX updates like counters and follow statuses optimistically on the client first.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-border/20">
            <CardContent className="pt-6">
              <LayersIcon className="size-8 text-sky-500 mb-3" />
              <h3 className="font-semibold text-base mb-1">Server Component SSR</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Fast Time-to-First-Byte (TTFB). Entire pages are compiled on the Vercel Edge Server to eliminate client hydration waterfalls.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-border/20">
            <CardContent className="pt-6">
              <CpuIcon className="size-8 text-emerald-500 mb-3" />
              <h3 className="font-semibold text-base mb-1">Prisma DB Index Tuning</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Database queries are optimized at the PostgreSQL engine level using composite indexes on Post tables.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feature Showcases */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center tracking-tight">Key Features Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex gap-3 items-start p-4 rounded-lg bg-card/25 border border-border/10">
            <div className="p-2 rounded-md bg-violet-500/10 text-violet-500 mt-1">
              <LockIcon className="size-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Clerk Managed Identity</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Multi-session identity management, sign-ups, and Google SSO authentication.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start p-4 rounded-lg bg-card/25 border border-border/10">
            <div className="p-2 rounded-md bg-pink-500/10 text-pink-500 mt-1">
              <FlameIcon className="size-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">UploadThing Media CDN</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Drag-and-drop file uploading up to 4MB with edge CDN image transformations.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start p-4 rounded-lg bg-card/25 border border-border/10">
            <div className="p-2 rounded-md bg-blue-500/10 text-blue-500 mt-1">
              <MessageCircleIcon className="size-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Real-time Profile Validation</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Username updates feature debounced server-side availability checks with inline feedback.
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start p-4 rounded-lg bg-card/25 border border-border/10">
            <div className="p-2 rounded-md bg-amber-500/10 text-amber-500 mt-1">
              <GlobeIcon className="size-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Structured SEO &amp; Sitemap</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Dynamically generated XML sitemap crawling Neon DB profiles to keep search rankings fresh.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Details */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center tracking-tight">Enterprise Stack Architecture</h2>
        <Card className="bg-card/30 border-border/10">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
              <div className="space-y-1">
                <p className="text-2xl font-extrabold text-primary">Next.js 16</p>
                <p className="text-xs text-muted-foreground">App Router &amp; Server Actions</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-extrabold text-sky-500">React 19</p>
                <p className="text-xs text-muted-foreground">Concurrent &amp; SSR Rendering</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-extrabold text-emerald-500">Neon PG</p>
                <p className="text-xs text-muted-foreground">Serverless SQL Engine</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-extrabold text-violet-500">Clerk Auth</p>
                <p className="text-xs text-muted-foreground">Identity Lifecycle Manager</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Semantic FAQs Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-center sm:text-3xl">Frequently Asked Questions</h2>
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="border-b border-border/30 pb-4">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <InfoIcon className="size-4 text-primary shrink-0" />
              What makes InstaX faster than typical social media apps?
            </h4>
            <p className="text-xs text-muted-foreground mt-1.5 pl-6 leading-relaxed">
              InstaX leverages Next.js 16 Server Components to complete database queries directly on the server. There are no client-side API waterfall requests for the feed and notifications, providing instantaneous rendering.
            </p>
          </div>
          <div className="border-b border-border/30 pb-4">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <InfoIcon className="size-4 text-primary shrink-0" />
              How is image uploading handled securely?
            </h4>
            <p className="text-xs text-muted-foreground mt-1.5 pl-6 leading-relaxed">
              We integrate Clerk authentication middleware inside UploadThing's edge route handler. Only verified, logged-in user tokens can generate upload URLs, keeping file hosting safe and secure.
            </p>
          </div>
          <div className="border-b border-border/30 pb-4">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <InfoIcon className="size-4 text-primary shrink-0" />
              Can I customize my username?
            </h4>
            <p className="text-xs text-muted-foreground mt-1.5 pl-6 leading-relaxed">
              Yes, in the Edit Profile dialog, you can change your username. Our backend checks database availability in real time and automatically redirects you to your new dynamic path while keeping your likes, comments, and followers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
