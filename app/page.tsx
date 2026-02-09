import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Image
              src="/brand/TTB-Logo.png"
              alt="Ocean Villa at Turtle Bay"
              width={34}
              height={34}
              priority
            />
            <div className="leading-tight">
              <div className="text-sm font-semibold">Ocean Villa at Turtle Bay</div>
              <div className="text-[11px] text-slate-500">North Shore • Oahu</div>
            </div>
          </div>

          {/* Nav (desktop only) */}
          <nav className="ml-auto hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a className="hover:text-slate-900" href="#rentals">Rentals</a>
            <a className="hover:text-slate-900" href="#amenities">Amenities</a>
            <a className="hover:text-slate-900" href="#guide">Guide</a>
            <a className="hover:text-slate-900" href="#contact">Contact</a>
          </nav>

          {/* Right (desktop) */}
          <div className="ml-auto hidden items-center gap-3 md:flex">
            <div className="text-sm text-slate-500">(808) XXX-XXXX</div>
            <a
              href="#availability"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Check Availability
            </a>
          </div>

          {/* Mobile CTA */}
          <div className="ml-auto md:hidden">
            <a
              href="#availability"
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Check Availability
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/media/hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />

          {/* overlays */}
          <div className="absolute inset-0 bg-black/20" />
          {/* IMPORTANT: tabon sa subtitle/quote sa video bottom area */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />

          {/* HERO TEXT */}
          <div className="absolute inset-0">
            <div className="mx-auto max-w-6xl px-4">
              <div className="pt-20 md:pt-28">
                <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white md:text-6xl">
                  Luxury stays at Turtle Bay
                </h1>
                <p className="mt-4 max-w-xl text-sm text-white/90 md:text-base">
                  Beachfront access, resort amenities, and premium villas — designed for direct booking.
                </p>
              </div>
            </div>
          </div>

          {/* BOOKING BAR */}
          <div
            id="availability"
            className="absolute left-1/2 w-[min(100%,980px)] -translate-x-1/2 px-4
                       bottom-6 md:bottom-16"
          >
            <div className="rounded-md bg-white/85 shadow-lg backdrop-blur">
              {/* MOBILE = 2 columns grid (parehas sa oceanfront) */}
              {/* DESKTOP = 1 row */}
              <div className="grid overflow-hidden rounded-md border border-white/30
                              grid-cols-2 gap-0
                              md:grid-cols-[1.1fr_1.1fr_1.1fr_1fr_1fr_160px]">
                {/* Arrival */}
                <div className="col-span-2 border-b border-slate-200 p-3 md:col-span-1 md:border-b-0 md:border-r">
                  <div className="text-[11px] font-medium text-slate-600">Arrival</div>
                  <input
                    type="date"
                    className="mt-1 h-9 w-full bg-transparent text-sm outline-none"
                  />
                </div>

                {/* Departure */}
                <div className="col-span-2 border-b border-slate-200 p-3 md:col-span-1 md:border-b-0 md:border-r">
                  <div className="text-[11px] font-medium text-slate-600">Departure</div>
                  <input
                    type="date"
                    className="mt-1 h-9 w-full bg-transparent text-sm outline-none"
                  />
                </div>

                {/* Flexible Stay */}
                <div className="col-span-2 border-b border-slate-200 p-3 md:col-span-1 md:border-b-0 md:border-r">
                  <div className="text-[11px] font-medium text-slate-600">Flexible Stay</div>
                  <select className="mt-1 h-9 w-full bg-transparent text-sm outline-none">
                    <option value="">Flexible Stay</option>
                    <option value="1">1 day</option>
                    <option value="2">2 days</option>
                    <option value="3">3 days</option>
                    <option value="4">4 days</option>
                    <option value="5">5 days</option>
                  </select>
                </div>

                {/* Adults */}
                <div className="col-span-1 border-b border-slate-200 p-3 md:col-span-1 md:border-b-0 md:border-r">
                  <div className="text-[11px] font-medium text-slate-600">Adults</div>
                  <select className="mt-1 h-9 w-full bg-transparent text-sm outline-none">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>

                {/* Children */}
                <div className="col-span-1 border-b border-slate-200 p-3 md:col-span-1 md:border-b-0 md:border-r">
                  <div className="text-[11px] font-medium text-slate-600">Children</div>
                  <select className="mt-1 h-9 w-full bg-transparent text-sm outline-none">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>

                {/* Search (full width sa mobile) */}
                <button className="col-span-2 h-12 bg-teal-600 text-sm font-medium text-white hover:bg-teal-700 md:col-span-1 md:h-full md:min-h-[54px]">
                  Search
                </button>
              </div>

              <div className="px-3 pb-2 pt-2 text-[11px] text-slate-500">
                Next: we’ll wire this to your Hostaway booking engine link/embed.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section id="rentals" className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-semibold">Rentals</h2>
        <p className="mt-2 text-sm text-slate-600">
          Next: villa cards grid like oceanfrontturtlebay.com (image + title + beds/baths + button).
        </p>
      </section>

      <section id="amenities" className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-semibold">Amenities</h2>
      </section>

      <section id="guide" className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-semibold">Guide</h2>
      </section>

      <section id="contact" className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-2xl font-semibold">Contact</h2>
      </section>
    </main>
  );
}
