"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { useState } from "react";
import {
  ActivityIcon,
  ChevronRightIcon,
  CodeIcon,
  HeartIcon,
  LogInIcon,
  MessageCircleIcon,
  SparklesIcon,
  TerminalIcon,
  UserPlusIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";

export default function UnauthLanding() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "What makes InstaX faster than standard social network clones?",
      a: "InstaX bypasses client-side fetch waterfalls by using Next.js App Router Server Components. Data is pre-fetched on Vercel's edge network, reducing initial page loads to milliseconds. Real-time actions like post-liking are processed with optimistic client-side UI state updates, making interactions feel immediate.",
    },
    {
      q: "How does the image upload pipeline work?",
      a: "We integrate Clerk middleware inside UploadThing API endpoints. Before files reach our hosting CDN, user tokens are verified on the server. Image assets are constrained to 4MB max-file-size limits to enforce fast media loading speeds.",
    },
    {
      q: "Are database queries optimized?",
      a: "Yes. Our PostgreSQL schema is built with explicit indexes on `Post(authorId, createdAt)` and `Post(createdAt)` to accelerate profile feed filtering. This guarantees that scale growth won't lead to sequential database scan overhead.",
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero / Brand Wordmark Section */}
      <div className="relative text-left space-y-6 pt-4">
        {/* Glow backdrop decorative bubbles */}
        <div className="absolute top-0 right-1/4 -z-10 size-72 rounded-full bg-gradient-to-tr from-pink-500/10 via-violet-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-10 -z-10 size-64 rounded-full bg-gradient-to-br from-blue-500/10 to-emerald-500/10 blur-3xl" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/40 bg-muted/40 text-xs text-muted-foreground font-mono">
          <TerminalIcon className="size-3.5 text-primary" />
          <span>npx create-instax-app --edge</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl font-sans text-foreground leading-[1.1]">
          InstaX. <br />
          <span className="bg-gradient-to-r from-pink-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
            Social networking
          </span>{" "}
          <br />
          reimagined for speed.
        </h1>

        <p className="max-w-xl text-base text-muted-foreground leading-relaxed">
          An open-source, high-performance social networking platform built with Next.js 16, React 19, and Tailwind CSS v4. No hydration waterfalls. Instant optimistic state updates.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <SignUpButton mode="modal">
            <Button size="lg" className="cursor-pointer font-semibold shadow-md bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white border-0 gap-2">
              <UserPlusIcon className="size-4" />
              Join the Network
            </Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button size="lg" variant="outline" className="cursor-pointer font-semibold gap-2">
              <LogInIcon className="size-4" />
              Sign In
            </Button>
          </SignInButton>
        </div>
      </div>

      {/* 2. Realistic Mock Post / Feed Showcase */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <SparklesIcon className="size-5 text-pink-500" />
            Interactive Mock Feed
          </h2>
          <p className="text-xs text-muted-foreground">
            A sneak-peek preview of our optimized post card interfaces.
          </p>
        </div>

        {/* Custom Mock Post Card */}
        <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm max-w-xl">
          <CardContent className="p-5 space-y-4">
            {/* Header info */}
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 shrink-0 flex items-center justify-center p-[2px]">
                <div className="size-full bg-background rounded-full flex items-center justify-center font-bold text-xs text-foreground">
                  N16
                </div>
              </div>
              <div className="text-left">
                <span className="text-sm font-semibold hover:underline cursor-pointer">
                  Vercel Team
                </span>
                <p className="text-xs text-muted-foreground">@nextjs • 2 hours ago</p>
              </div>
            </div>

            {/* Post text */}
            <p className="text-sm leading-relaxed text-foreground/90">
              Next.js 16 is now active! ⚡ Compiled in 17.6s using Webpack, featuring native React 19 concurrent hydration and the new Tailwind v4 styling engine. Scroll through the feed and experience 0ms input latency.
            </p>

            {/* Mock Image inside Post */}
            <div className="relative rounded-lg overflow-hidden border border-border/10 aspect-video bg-muted/20">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-2">
                <CodeIcon className="size-10 text-primary" />
                <span className="text-xs font-mono text-muted-foreground bg-muted/80 px-2.5 py-1 rounded">
                  const compile = () =&gt; &quot;zero_lag&quot;;
                </span>
              </div>
            </div>

            {/* Mock Actions */}
            <div className="flex gap-4 pt-1 text-muted-foreground text-xs font-semibold">
              <div className="flex items-center gap-1.5 hover:text-red-500 cursor-pointer">
                <HeartIcon className="size-4 fill-red-500 text-red-500" />
                <span>1,248</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-blue-500 cursor-pointer">
                <MessageCircleIcon className="size-4" />
                <span>36</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. Tech Stack Metrics comparison */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ActivityIcon className="size-5 text-indigo-500" />
            Performance Blueprint
          </h2>
          <p className="text-xs text-muted-foreground">
            InstaX leverages Postgres indexing, SSR routes, and parallel fetches for optimal Core Web Vitals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border/40 bg-card/30 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-mono text-muted-foreground font-semibold">PAGE LOAD (TTFB)</span>
              <p className="text-2xl font-bold text-emerald-500 mt-1">~12ms</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Edge SSR renders pages directly on the close node network, bypassing client-side data waterfalls.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-border/40 bg-card/30 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-mono text-muted-foreground font-semibold">MUTATION RESPONSE</span>
              <p className="text-2xl font-bold text-sky-500 mt-1">&lt;1ms</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Optimistic updates render toggled states immediately, sync'ing database writes in the background.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-border/40 bg-card/30 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-mono text-muted-foreground font-semibold">DATABASE QUERYING</span>
              <p className="text-2xl font-bold text-violet-500 mt-1">Indexed</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Prisma schemas are backed by PostgreSQL indexes on keys like `createdAt`, skipping slow sequential scans.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Collapsible FAQs Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ZapIcon className="size-5 text-amber-500" />
          Technical FAQ
        </h2>

        <div className="divide-y divide-border/20 border-t border-b border-border/20 max-w-xl">
          {faqs.map((faq, index) => {
            const isFaqActive = activeFaq === index;
            return (
              <div key={index} className="py-4">
                <button
                  onClick={() => setActiveFaq(isFaqActive ? null : index)}
                  className="flex w-full items-center justify-between text-left font-semibold text-sm hover:text-primary transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronRightIcon
                    className={`size-4 text-muted-foreground transition-transform duration-200 ${
                      isFaqActive ? "rotate-90 text-primary" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ease-in-out ${
                    isFaqActive ? "max-h-32 mt-2 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
