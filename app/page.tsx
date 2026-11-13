import Image from "next/image";
import Link from "next/link";

const navItems = [
  { label: "Platform", href: "#platform" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

const modules = [
  {
    number: "01",
    title: "Keep every client close",
    description:
      "A clear home for contacts, conversations, notes, and the full history of your work together.",
    icon: "◎",
    detail: "Client CRM",
    metric: "24 clients",
  },
  {
    number: "02",
    title: "Move projects forward",
    description:
      "See tasks, milestones, due dates, and project progress without chasing updates across tools.",
    icon: "↗",
    detail: "Project workspace",
    metric: "8 active",
  },
  {
    number: "03",
    title: "Get paid with confidence",
    description:
      "Create polished proposals and invoices, track payments, and know exactly what is outstanding.",
    icon: "$",
    detail: "Payments",
    metric: "$3,200 due",
  },
];

const workflow = [
  {
    title: "Bring your clients together",
    description:
      "Add your people and companies, capture important details, and keep every conversation in context.",
    icon: "01",
  },
  {
    title: "Run projects in one place",
    description:
      "Connect each project to a client. Organize deliverables, tasks, milestones, and approvals.",
    icon: "02",
  },
  {
    title: "Send work and get paid",
    description:
      "Share a proposal, turn accepted work into a project, then invoice and track payment.",
    icon: "03",
  },
];

const plans = [
  {
    name: "Solo",
    price: "$0",
    description: "A simpler way to get organized.",
    features: ["Manage up to 3 clients", "Unlimited projects", "Proposals and invoices", "Client portal"],
    featured: false,
  },
  {
    name: "Studio",
    price: "$3",
    description: "For independent pros ready to grow.",
    features: ["Unlimited clients and projects", "Project templates", "Payment tracking", "Business insights"],
    featured: true,
  },
  {
    name: "Agency",
    price: "$9.99",
    description: "Keep your small team in sync.",
    features: ["Everything in Studio", "Team collaboration", "Shared client workspace", "Priority support"],
    featured: false,
  },
];

export function BrandMark({ dark = false }: { dark?: boolean }) {
  return (
    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${dark ? 'bg-white' : 'bg-primary'} text-sm font-bold text-primary-foreground`}>
      <Image alt="" src={require('../public/icon.png')} width={25} height={25} />
    </span>
  );
}

function CheckMark() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
      ✓
    </span>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1180px] px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <header className="sticky top-3 z-10 w-full rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
          <nav aria-label="Main navigation" className="flex items-center justify-between gap-5">
            <a href="#" className="flex items-center gap-2.5" aria-label="Cyclops home">
              <BrandMark />
              <span className="text-lg font-semibold tracking-tight">Cyclops</span>
            </a>

            <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
              {navItems.map((item) => (
                <a key={item.label} href={item.href} className="transition-colors hover:text-foreground">
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Link href={'/auth/signin'} className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline">
                Sign in
              </Link>
              <a
                href="/auth/signup"
                className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Get started <span aria-hidden="true">↗</span>
              </a>
            </div>
          </nav>
        </header>

        <main className="w-full space-y-7 pt-7">
          <section className="flex flex-col items-center relative w-full overflow-hidden px-4 pb-7 sm:px-10">
            {/* <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-secondary opacity-70 blur-3xl" /> */}
            <div className="relative mx-auto max-w-[780px] text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary" />
                The business workspace for independent pros
              </div>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                Do great work.
                <br />
                <span className="text-muted-foreground">We’ll handle the rest.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-[620px] text-base leading-7 text-muted-foreground sm:text-lg">
                Clients, projects, proposals, and payments—finally connected in one calm, clear place.
                Spend less time juggling tools and more time doing the work you love.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  href="/auth/signup"
                  className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/10 transition-transform hover:-translate-y-0.5"
                >
                  Start for free <span aria-hidden="true">→</span>
                </Link>
                <a
                  href="#platform"
                  className="rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Explore the platform
                </a>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Free to start · No credit card required</p>
            </div>
            <Image src={require('../public/hero.svg')} alt="" />
            <p className="relative mt-3 text-center text-[10px] text-muted-foreground">A little more clarity, every day.</p>
          </section>

          <section id="platform" className="w-full scroll-mt-24 py-10 sm:py-14">
            <div className="mx-auto max-w-[680px] text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">One workspace, all connected</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
                Your business, without the busywork.
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                Stop piecing together spreadsheets, docs, and payment updates. Cyclops keeps the important details connected to the work.
              </p>
            </div>

            <div className="mt-9 grid gap-4 lg:grid-cols-3">
              {modules.map((module) => (
                <article key={module.number} className="rounded-[24px] border border-border bg-card p-5 transition-transform hover:-translate-y-3 duration-300">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-lg font-semibold text-secondary-foreground">
                      {module.icon}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">{module.number}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight">{module.title}</h3>
                  <p className="mt-2 min-h-[72px] text-sm leading-6 text-muted-foreground">{module.description}</p>
                  <div className="mt-5 flex items-center justify-between rounded-xl bg-muted px-3 py-2.5">
                    <span className="text-xs text-muted-foreground">{module.detail}</span>
                    <span className="text-xs font-semibold">{module.metric}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex gap-4 rounded-[22px] border border-border bg-card p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-lg text-secondary-foreground">▤</span>
                <div>
                  <h3 className="font-semibold">A client portal they’ll actually use</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">Give clients one easy place to follow progress, review files, approve work, and see invoices.</p>
                </div>
              </div>
              <div className="flex gap-4 rounded-[22px] border border-border bg-card p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-lg text-secondary-foreground">◷</span>
                <div>
                  <h3 className="font-semibold">Know how your business is doing</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">See revenue, overdue invoices, active projects, and client activity at a glance.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="how-it-works" className="w-full scroll-mt-24 py-10 sm:py-14">
            <div className="mx-auto max-w-[680px] text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">A better rhythm for your business</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">From first hello to final payment.</h2>
              <p className="mt-4 text-muted-foreground">A straightforward flow that keeps you and your clients on the same page.</p>
            </div>
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {workflow.map((step, index) => (
                <article key={step.icon} className="relative rounded-[22px] border border-border bg-muted p-5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{step.icon}</span>
                  {index < workflow.length - 1 && <span aria-hidden="true" className="absolute right-5 top-9 hidden text-xl text-muted-foreground md:block">→</span>}
                  <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="w-full rounded-[30px] border border-border bg-secondary px-5 py-10 sm:px-8 sm:py-14">
            <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">Made for your kind of work</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">Built for people who build things.</h2>
                <p className="mt-4 leading-7 text-secondary-foreground">
                  Whether you’re shipping software, shaping a brand, or growing a small digital agency, Cyclops gives your client work a home.
                </p>
                <a href="#pricing" className="mt-6 inline-flex rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground">
                  Find your flow <span className="ml-2" aria-hidden="true">→</span>
                </a>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { title: "Independent developers", detail: "Projects, scopes, milestones, and invoices.", icon: "</>" },
                  { title: "Small software agencies", detail: "Clients, collaborators, and shared visibility.", icon: "↗" },
                  { title: "Designers & creatives", detail: "Proposals, approvals, and polished delivery.", icon: "✳" },
                  { title: "Consultants", detail: "Engagements, retainers, and client history.", icon: "◎" },
                ].map((audience) => (
                  <div key={audience.title} className="rounded-[20px] border border-border bg-card p-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-sm font-semibold text-secondary-foreground">{audience.icon}</span>
                    <h3 className="mt-4 text-sm font-semibold">{audience.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{audience.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="pricing" className="w-full scroll-mt-24 rounded-[30px] border border-border bg-muted px-4 py-10 sm:px-8 sm:py-14">
            <div className="mx-auto text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">Straightforward plans</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">Room to grow, from day one.</h2>
              <p className="mt-4 text-muted-foreground">Start free. Upgrade when your business is ready.</p>
            </div>
            <div className="mt-9 grid gap-4 lg:grid-cols-3">
              {plans.map((plan) => (
                <article key={plan.name} className={`rounded-[24px] border p-5 ${plan.featured ? "border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/15" : "border-border bg-card"}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    {plan.featured && <span className="rounded-full bg-primary-foreground/15 px-2.5 py-1 text-[10px] font-semibold">POPULAR</span>}
                  </div>
                  <p className={`mt-2 text-sm ${plan.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{plan.description}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                    <span className={`text-xs ${plan.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>/ month</span>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        {plan.featured ? (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 text-xs font-bold">✓</span>
                        ) : (
                          <CheckMark />
                        )}
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a href="" className={`mt-6 block rounded-full px-4 py-3 text-center text-sm font-semibold transition-transform hover:-translate-y-0.5 ${plan.featured ? "bg-primary-foreground text-primary" : "border border-border bg-background text-foreground"}`}>
                    Get started
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section className="relative w-full overflow-hidden rounded-[30px] bg-primary px-5 py-10 text-primary-foreground sm:px-10 sm:py-14">
            <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full bg-primary-foreground opacity-10 blur-3xl" />
            <div className="relative mx-auto max-w-[700px] text-center">
              <BrandMark dark />
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">Your clients. Your projects. Your whole business.</h2>
              <p className="mx-auto mt-4 max-w-[530px] leading-7 text-primary-foreground/80">Bring the moving pieces together and make more room for the work that matters.</p>
              <Link href="/auth/signup" className="mt-7 inline-flex rounded-full bg-primary-foreground px-5 py-3 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5">
                Start your free workspace <span className="ml-2" aria-hidden="true">→</span>
              </Link>
            </div>
          </section>
        </main>

      </div>
      <footer className="mt-7 bg-muted px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <a href="#" className="flex items-center gap-2.5" aria-label="Cyclops home">
            <BrandMark />
            <span className="font-semibold tracking-tight">Cyclops</span>
          </a>
          <p className="max-w-md text-sm text-muted-foreground">
            A little less admin. A lot more room to do your best work.
          </p>
          <div className="flex gap-5 text-sm text-muted-foreground">
            <a href="#platform" className="hover:text-foreground">Platform</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="mailto:hello@Cyclops.app" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
