"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { VideoPlayer } from "@/components/ui/video-thumbnail-player";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { FocusFlowLogo } from "@/components/brand/FocusFlowLogo";

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl transition-[background-color,backdrop-filter] duration-300">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg outline-offset-2 transition-opacity duration-200 hover:opacity-90"
        >
          <FocusFlowLogo size={32} alt="" className="size-8 rounded-xl" />
          <span className="text-sm font-semibold tracking-tight text-foreground">FocusFlow</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a
            href="#product"
            className="rounded-md transition-colors duration-200 ease-out hover:text-foreground"
          >
            Product
          </a>
          <a
            href="#analytics"
            className="rounded-md transition-colors duration-200 ease-out hover:text-foreground"
          >
            Analytics
          </a>
          <a
            href="#extension"
            className="rounded-md transition-colors duration-200 ease-out hover:text-foreground"
          >
            Extension
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Authenticated>
            <Button size="sm" render={<Link href="/dashboard" />}>
              Open app
            </Button>
          </Authenticated>
          <Unauthenticated>
            <Button size="sm" variant="ghost" render={<Link href="/sign-in" />}>
              Sign in
            </Button>
            <Button size="sm" render={<Link href="/sign-up" />}>
              Get started
            </Button>
          </Unauthenticated>
        </div>
      </div>
    </header>
  );
}

function HeroAuth() {
  const { user, signOut } = useAuth();

  return (
    <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Authenticated>
        <>
          <Button
            size="lg"
            className="h-12 min-w-[200px] rounded-full px-8 text-base font-medium transition-[transform,background-color,box-shadow] duration-200 ease-out motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]"
            render={<Link href="/dashboard" />}
          >
            Open dashboard
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
          {user && (
            <p className="flex w-full items-center text-sm text-muted-foreground sm:order-last sm:w-full">
              Signed in as <span className="ml-1 truncate text-foreground">{user.email}</span>
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground sm:ml-1"
            onClick={() => void signOut()}
          >
            <LogOut className="size-3.5" />
            Sign out
          </Button>
        </>
      </Authenticated>
      <Unauthenticated>
        <>
          <Button
            size="lg"
            className="h-12 min-w-[220px] rounded-full px-8 text-base font-medium transition-[transform,background-color] duration-200 ease-out motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]"
            render={<Link href="/sign-up" />}
          >
            Get started free
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 min-w-[160px] rounded-full transition-[transform,background-color,border-color] duration-200 ease-out motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]"
            render={<Link href="/sign-in" />}
          >
            Sign in
          </Button>
        </>
      </Unauthenticated>
    </div>
  );
}

function HeroShowcase() {
  return (
    <div className="relative mt-14 sm:mt-20">
      <div className="relative left-1/2 w-screen max-w-none -translate-x-1/2 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16">
        <div className="relative mx-auto max-w-6xl">
          <div id="product" className="relative scroll-mt-28 pb-4">
            <div id="extension" className="w-full px-2 sm:px-4">
              <div className="animate-landing-fade-scale">
                <VideoPlayer
                  thumbnailUrl="https://images.unsplash.com/photo-1593642532454-e138e28a63f4?q=80&w=2069&auto=format&fit=crop"
                  videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="See FocusFlow in action"
                  description="Dashboard, focus sessions, and tab intelligence."
                  className="rounded-xl border border-border bg-card shadow-lg ring-1 ring-border/60 transition-shadow duration-300 motion-safe:hover:shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartsMock() {
  return (
    <div id="analytics" className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm ring-1 ring-border/60">
      <h3 className="text-lg font-semibold">Session history</h3>
      <p className="text-sm text-muted-foreground">A visual breakdown of your focus sessions over time.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-xs font-medium text-muted-foreground">Session duration</p>
          <p className="text-[10px] text-muted-foreground/80">Length of each completed session in minutes.</p>
          <div className="mt-4 flex h-32 items-end justify-around gap-2 border-b border-border pb-1">
            {[40, 65, 55, 180, 70].map((h, i) => (
              <div
                key={i}
                className="w-6 rounded-t-md bg-primary opacity-90"
                style={{ height: `${(h / 180) * 100}%` }}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">Mar 29</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-xs font-medium text-muted-foreground">Status breakdown</p>
          <p className="text-[10px] text-muted-foreground/80">Distribution of session outcomes.</p>
          <div className="relative mx-auto mt-4 flex size-28 items-center justify-center">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(var(--primary) 0deg 340deg, color-mix(in oklch, var(--primary) 35%, transparent) 340deg 360deg)",
              }}
            />
            <div className="relative z-10 size-16 rounded-full bg-card" />
          </div>
          <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
            <span className="inline-block size-2 rounded-sm bg-primary" />
            Completed
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
        <p className="text-xs font-medium text-muted-foreground">Sessions per day</p>
        <p className="text-[10px] text-muted-foreground/80">How many focus sessions you logged each day.</p>
        <div className="mt-4 flex h-24 items-end justify-around gap-3">
          {[2, 3, 2, 4, 3].map((n, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="w-8 rounded-t-md bg-primary opacity-90"
                style={{ height: `${n * 18}px` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FocusFlowLogo size={32} alt="" className="size-8 rounded-xl" />
              <span className="font-semibold text-foreground">FocusFlow</span>
            </div>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Deep work for people who live in the browser. Set a goal, stay on task, see the story in data.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Authenticated>
                    <Link href="/dashboard" className="transition-colors duration-200 hover:text-foreground">
                      Dashboard
                    </Link>
                  </Authenticated>
                  <Unauthenticated>
                    <Link href="/sign-up" className="transition-colors duration-200 hover:text-foreground">
                      Dashboard
                    </Link>
                  </Unauthenticated>
                </li>
                <li>
                  <a href="#extension" className="transition-colors duration-200 hover:text-foreground">
                    Extension
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Account</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/sign-in" className="transition-colors duration-200 hover:text-foreground">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className="transition-colors duration-200 hover:text-foreground">
                    Create account
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} FocusFlow. Built for focused builders.
        </p>
      </div>
    </footer>
  );
}

export function FocusFlowLanding() {
  return (
    <div className="relative min-h-svh bg-background text-foreground">
      <div
        className="pointer-events-none fixed inset-0 bg-linear-to-b from-primary/9 via-transparent to-transparent dark:from-primary/14"
        aria-hidden
      />
      <div className="relative">
        <Nav />
        <main>
          <section className="pb-0">
            <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-12">
              <div className="max-w-3xl">
                <h1 className="mt-5 text-pretty text-4xl font-medium leading-[1.12] tracking-tight sm:text-5xl sm:leading-[1.1]">
                  <span className="block text-foreground animate-landing-fade-up">
                    FocusFlow is the best way to own your attention
                  </span>
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground animate-landing-fade-up-delay-1">
                  Set a focus goal from the extension, stay on task with smarter tab decisions, and use our insights to
                  improve over time
                </p>
                <div className="animate-landing-fade-up-delay-2">
                  <HeroAuth />
                </div>
              </div>
            </div>
            <HeroShowcase />
          </section>

          <section className="border-y border-border bg-muted/30 py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <ScrollReveal>
                <p className="text-center font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  Trusted by builders who ship
                </p>
                <h2 className="mx-auto mt-3 max-w-2xl text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Your browser is where work happens.{" "}
                  <span className="text-muted-foreground">We help it stay aligned with intent—not impulse.</span>
                </h2>
              </ScrollReveal>
              <div className="mt-14 grid gap-6 md:grid-cols-3">
                {[
                  {
                    icon: LayoutDashboard,
                    title: "Live overview",
                    body: "See active sessions, quick starts, and the pulse of your last run—without leaving the dashboard.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Goal-first guardrails",
                    body: "Name what you are doing. We structure decisions around that goal so context never drifts.",
                  },
                  {
                    icon: BarChart3,
                    title: "Honest analytics",
                    body: "Distraction rate, top domains, and per-session charts that reward consistency over vibes.",
                  },
                ].map((f, i) => (
                  <ScrollReveal key={f.title} delayMs={i * 70}>
                    <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50 transition-[transform,box-shadow,border-color] duration-300 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-border motion-safe:hover:shadow-md">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 motion-safe:group-hover:scale-105">
                        <f.icon className="size-5" />
                      </div>
                      <h3 className="mt-4 font-semibold text-card-foreground">{f.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="grid items-start gap-12 lg:grid-cols-2">
              <ScrollReveal>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    History that reads like a story
                  </h2>
                  <p className="mt-4 text-muted-foreground">
                    Session duration bars, outcome breakdowns, and daily rhythm—so you can spot patterns, not just
                    timestamps.
                  </p>
                  <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="mt-0.5 text-primary">→</span>
                      Compare lengths and intensity across days
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-0.5 text-primary">→</span>
                      Understand completed vs interrupted sessions at a glance
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-0.5 text-primary">→</span>
                      Tie tab decisions back to the goal you set
                    </li>
                  </ul>
                </div>
              </ScrollReveal>
              <ScrollReveal delayMs={80}>
                <ChartsMock />
              </ScrollReveal>
            </div>
          </section>

          <section className="border-t border-border py-20">
            <ScrollReveal className="mx-auto max-w-3xl px-4 text-center sm:px-6">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Try FocusFlow</h2>
              <p className="mt-3 text-muted-foreground">
                Create an account, link the extension from your dashboard, and start your first focus session in minutes.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Unauthenticated>
                  <Button size="lg" className="h-11 min-w-[200px]" render={<Link href="/sign-up" />}>
                    Get started free
                  </Button>
                  <Button size="lg" variant="outline" className="h-11" render={<Link href="/sign-in" />}>
                    Sign in
                  </Button>
                </Unauthenticated>
                <Authenticated>
                  <Button size="lg" className="h-11 min-w-[200px]" render={<Link href="/dashboard" />}>
                    Go to dashboard
                    <ArrowRight className="size-4" data-icon="inline-end" />
                  </Button>
                  <Button size="lg" variant="outline" className="h-11" render={<Link href="/dashboard/link" />}>
                    Link extension
                  </Button>
                </Authenticated>
              </div>
            </ScrollReveal>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
