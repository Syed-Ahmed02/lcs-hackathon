"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Play,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={`flex size-9 items-center justify-center rounded-xl bg-zinc-800 ring-1 ring-white/10 ${className ?? ""}`}
    >
      <ShieldCheck className="size-5 text-white" strokeWidth={2} />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark className="size-8 rounded-lg [&_svg]:size-4" />
          <span className="text-sm font-semibold tracking-tight text-white">FocusFlow</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          <a href="#product" className="transition-colors hover:text-white">
            Product
          </a>
          <a href="#analytics" className="transition-colors hover:text-white">
            Analytics
          </a>
          <a href="#extension" className="transition-colors hover:text-white">
            Extension
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Authenticated>
            <Button size="sm" className="bg-white text-zinc-950 hover:bg-zinc-200" render={<Link href="/dashboard" />}>
              Open app
            </Button>
          </Authenticated>
          <Unauthenticated>
            <Button
              size="sm"
              variant="ghost"
              className="text-zinc-300 hover:bg-white/10 hover:text-white"
              render={<Link href="/sign-in" />}
            >
              Sign in
            </Button>
            <Button size="sm" className="bg-white text-zinc-950 hover:bg-zinc-200" render={<Link href="/sign-up" />}>
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
            className="h-12 min-w-[200px] rounded-full bg-zinc-200 px-8 text-base font-medium text-zinc-950 hover:bg-white"
            render={<Link href="/dashboard" />}
          >
            Open dashboard
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
          {user && (
            <p className="flex w-full items-center text-sm text-zinc-500 sm:order-last sm:w-full">
              Signed in as <span className="ml-1 truncate text-zinc-300">{user.email}</span>
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-500 hover:bg-white/5 hover:text-zinc-300 sm:ml-1"
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
            className="h-12 min-w-[220px] rounded-full bg-zinc-200 px-8 text-base font-medium text-zinc-950 hover:bg-white"
            render={<Link href="/sign-up" />}
          >
            Get started free
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 min-w-[160px] rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
            render={<Link href="/sign-in" />}
          >
            Sign in
          </Button>
        </>
      </Unauthenticated>
    </div>
  );
}

function ExtensionMock() {
  return (
    <div className="relative w-full max-w-[340px] rounded-2xl border border-white/10 bg-zinc-900/90 p-5 shadow-2xl shadow-black/50 ring-1 ring-white/[0.04]">
      <div className="mb-4 flex items-center gap-2">
        <LogoMark className="size-8 rounded-lg [&_svg]:size-4" />
        <span className="text-sm font-semibold text-white">FocusFlow</span>
      </div>
      <p className="mb-1 text-[10px] font-medium tracking-widest text-zinc-500 uppercase">Focus goal</p>
      <div className="mb-4 rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-3 text-xs leading-relaxed text-zinc-500">
        e.g. Write unit tests for the auth module
      </div>
      <button
        type="button"
        className="w-full rounded-xl bg-white py-3 text-sm font-medium text-zinc-950"
        tabIndex={-1}
      >
        Start Focus Session
      </button>
      <p className="mt-4 border-t border-white/10 pt-4 text-center text-xs text-zinc-500">Unlink account</p>
    </div>
  );
}

function OverviewMock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-white text-zinc-900 shadow-2xl ring-1 ring-white/6",
        className,
      )}
    >
      <div className="flex gap-0 border-b border-zinc-200">
        <div className="flex w-48 flex-col gap-1 border-r border-zinc-200 bg-zinc-50 p-3">
          <div className="mb-2 flex items-center gap-2 px-1">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[oklch(0.496_0.265_301.924)] text-white">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold">FocusFlow</p>
              <p className="text-[10px] text-zinc-500">Dashboard</p>
            </div>
          </div>
          <div className="rounded-md bg-zinc-200/80 px-2 py-1.5 text-[10px] font-medium">Overview</div>
          <div className="px-2 py-1 text-[10px] text-zinc-500">Session History</div>
          <div className="px-2 py-1 text-[10px] text-zinc-500">Insights</div>
        </div>
        <div className="min-h-[220px] flex-1 p-4">
          <h3 className="text-sm font-semibold">Overview</h3>
          <p className="text-[10px] text-zinc-500">Monitor your focus sessions and tab decisions in real time.</p>
          <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Active Session</span>
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[9px] text-zinc-600">Inactive</span>
            </div>
            <p className="mt-2 text-[10px] text-zinc-500">Start a focus session to track your tab activity.</p>
            <div className="mt-2 rounded-lg border border-zinc-200 bg-white px-2 py-2 text-[10px] text-zinc-400">
              What are you focusing on?
            </div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[oklch(0.496_0.265_301.924)] px-3 py-1.5 text-[10px] font-medium text-white">
              <Play className="size-3 fill-current" />
              Start
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 p-3">
        {[
          { label: "Distraction", value: "9%", icon: ShieldAlert, color: "text-red-500" },
          { label: "Blocked", value: "1", icon: Shield, color: "text-orange-500" },
          { label: "Allowed", value: "10", icon: ShieldCheck, color: "text-emerald-600" },
          { label: "Decisions", value: "11", icon: Sparkles, color: "text-[oklch(0.496_0.265_301.924)]" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-center">
            <m.icon className={`mx-auto mb-1 size-4 ${m.color}`} />
            <p className="text-sm font-semibold">{m.value}</p>
            <p className="text-[9px] text-zinc-500">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WindowChrome({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-950 shadow-[0_32px_100px_-16px_rgba(0,0,0,0.72)] ring-1 ring-white/10">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-zinc-800/90 bg-zinc-900 px-3">
        <div className="flex gap-1.5 pl-0.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
          <span className="size-2.5 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
          <span className="size-2.5 rounded-full bg-[#28c840] ring-1 ring-black/10" />
        </div>
        <span className="flex-1 text-center text-[11px] font-medium tracking-tight text-zinc-500">{title}</span>
        <div className="w-11 shrink-0" aria-hidden />
      </div>
      <div className="bg-zinc-950">{children}</div>
    </div>
  );
}



function HeroShowcase() {
  return (
    <div className="relative mt-14 sm:mt-20">
      <div
        className="relative left-1/2 w-screen max-w-none -translate-x-1/2 border-y border-white/10 px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-14 md:pb-24"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <div id="product" className="relative scroll-mt-28 pb-8 md:pb-28 lg:pb-32">
            <div className="relative mx-auto w-full max-w-5xl">
              <WindowChrome title="FocusFlow">
                <OverviewMock className="rounded-none border-0 shadow-none ring-0" />
              </WindowChrome>
              <div
                id="extension"
                className="relative z-10 mx-auto mt-8 w-full max-w-[340px] scroll-mt-28 md:absolute md:-bottom-8 md:left-0 md:mx-0 md:mt-0 md:max-w-[300px] lg:-bottom-10 lg:max-w-[320px]"
              >
                <ExtensionMock />
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
    <div id="analytics" className="scroll-mt-24 rounded-2xl border border-white/10 bg-zinc-900/50 p-6 ring-1 ring-white/[0.04]">
      <h3 className="text-lg font-semibold text-white">Session history</h3>
      <p className="text-sm text-zinc-500">A visual breakdown of your focus sessions over time.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-zinc-950/50 p-4">
          <p className="text-xs font-medium text-zinc-400">Session duration</p>
          <p className="text-[10px] text-zinc-600">Length of each completed session in minutes.</p>
          <div className="mt-4 flex h-32 items-end justify-around gap-2 border-b border-white/10 pb-1">
            {[40, 65, 55, 180, 70].map((h, i) => (
              <div
                key={i}
                className="w-6 rounded-t-md bg-[oklch(0.496_0.265_301.924)] opacity-90"
                style={{ height: `${(h / 180) * 100}%` }}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-[10px] text-zinc-600">Mar 29</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-950/50 p-4">
          <p className="text-xs font-medium text-zinc-400">Status breakdown</p>
          <p className="text-[10px] text-zinc-600">Distribution of session outcomes.</p>
          <div className="relative mx-auto mt-4 flex size-28 items-center justify-center">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(oklch(0.75 0.12 305) 0deg 340deg, oklch(0.35 0.05 280) 340deg 360deg)",
              }}
            />
            <div className="relative z-10 size-16 rounded-full bg-zinc-950" />
          </div>
          <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-zinc-400">
            <span className="inline-block size-2 rounded-sm bg-[oklch(0.75_0.12_305)]" />
            Completed
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-white/10 bg-zinc-950/50 p-4">
        <p className="text-xs font-medium text-zinc-400">Sessions per day</p>
        <p className="text-[10px] text-zinc-600">How many focus sessions you logged each day.</p>
        <div className="mt-4 flex h-24 items-end justify-around gap-3">
          {[2, 3, 2, 4, 3].map((n, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="w-8 rounded-t-md bg-[oklch(0.55_0.22_302)]"
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
    <footer className="border-t border-white/[0.06] bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <LogoMark className="size-8 rounded-lg [&_svg]:size-4" />
              <span className="font-semibold text-white">FocusFlow</span>
            </div>
            <p className="mt-2 max-w-xs text-sm text-zinc-500">
              Deep work for people who live in the browser. Set a goal, stay on task, see the story in data.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                <li>
                  <Authenticated>
                    <Link href="/dashboard" className="hover:text-white">
                      Dashboard
                    </Link>
                  </Authenticated>
                  <Unauthenticated>
                    <Link href="/sign-up" className="hover:text-white">
                      Dashboard
                    </Link>
                  </Unauthenticated>
                </li>
                <li>
                  <a href="#extension" className="hover:text-white">
                    Extension
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wider text-zinc-500 uppercase">Account</p>
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="/sign-in" className="hover:text-white">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className="hover:text-white">
                    Create account
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} FocusFlow. Built for focused builders.
        </p>
      </div>
    </footer>
  );
}

export function FocusFlowLanding() {
  return (
    <div className="dark min-h-svh bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,oklch(0.42_0.18_303_/_0.22),transparent_55%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_bottom,transparent_0%,oklch(0.09_0_0)_100%)] opacity-80" />
      <div className="relative">
        <Nav />
        <main>
          <section className="pb-0">
            <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-12">
              <div className="max-w-3xl">
                
                <h1 className="mt-5 text-pretty text-4xl font-medium leading-[1.12] tracking-tight sm:text-5xl sm:leading-[1.1]">
                  <span className="block text-white">FocusFlow is the best way to own your attention 
                  </span>
                
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
                  Set a focus goal from the extension, stay on task with smarter tab decisions, and use our insights to improve over time
                </p>
                <HeroAuth />
              </div>
            </div>
            <HeroShowcase />
          </section>

          <section className="border-y py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <p className="text-center font-mono text-xs tracking-widest text-zinc-500 uppercase">
                Trusted by builders who ship
              </p>
              <h2 className="mx-auto mt-3 max-w-2xl text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Your browser is where work happens.{" "}
                <span className="text-zinc-500">We help it stay aligned with intent—not impulse.</span>
              </h2>
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
                ].map((f) => (
                  <div
                    key={f.title}
                    className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 ring-1 ring-white/[0.03]"
                  >
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-[oklch(0.75_0.12_305)]">
                      <f.icon className="size-5" />
                    </div>
                    <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">{f.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="grid items-start gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  History that reads like a story
                </h2>
                <p className="mt-4 text-zinc-400">
                  Session duration bars, outcome breakdowns, and daily rhythm—so you can spot patterns, not just timestamps.
                </p>
                <ul className="mt-8 space-y-4 text-sm text-zinc-500">
                  <li className="flex gap-3">
                    <span className="mt-0.5 text-[oklch(0.65_0.2_302)]">→</span>
                    Compare lengths and intensity across days
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 text-[oklch(0.65_0.2_302)]">→</span>
                    Understand completed vs interrupted sessions at a glance
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 text-[oklch(0.65_0.2_302)]">→</span>
                    Tie tab decisions back to the goal you set
                  </li>
                </ul>
              </div>
              <ChartsMock />
            </div>
          </section>

          <section className="border-t border-white/[0.06] py-20">
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">Try FocusFlow</h2>
              <p className="mt-3 text-zinc-500">
                Create an account, link the extension from your dashboard, and start your first focus session in minutes.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Unauthenticated>
                  <Button
                    size="lg"
                    className="h-11 min-w-[200px] bg-white text-zinc-950 hover:bg-zinc-200"
                    render={<Link href="/sign-up" />}
                  >
                    Get started free
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-11 border-white/20 bg-transparent text-white hover:bg-white/5"
                    render={<Link href="/sign-in" />}
                  >
                    Sign in
                  </Button>
                </Unauthenticated>
                <Authenticated>
                  <Button
                    size="lg"
                    className="h-11 min-w-[200px] bg-white text-zinc-950 hover:bg-zinc-200"
                    render={<Link href="/dashboard" />}
                  >
                    Go to dashboard
                    <ArrowRight className="size-4" data-icon="inline-end" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-11 border-white/20 bg-transparent text-white hover:bg-white/5"
                    render={<Link href="/dashboard/link" />}
                  >
                    Link extension
                  </Button>
                </Authenticated>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
