import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
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

          <nav className="ml-auto hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a className="hover:text-slate-900" href="#rentals">Rentals</a>
            <a className="hover:text-slate-900" href="#amenities">Amenities</a>
            <a className="hover:text-slate-900" href="#guide">Guide</a>
            <a className="hover:text-slate-900" href="#contact">Contact</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="text-sm text-slate-500">(808) XXX-XXXX</div>
            <a
              href="#availability"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
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

          {/* overlay */}
          <div className="absolute inset-0 bg-black/20" />

          {/* HERO TEXT (isaka gamay) */}
          <div className="absolute inset-0">
            <div className="mx-auto max-w-6xl px-4">
              <div className="pt-16 sm:pt-20 md:pt-24">
                <h1 className="max-w-xl text-4xl font-semibold leading-tight text-white md:text-6xl">
                  Luxury stays at Turtle Bay
                </h1>
                <p className="mt-4 max-w-lg text-sm text-white/90 md:text-base">
                  Beachfront access, resort amenities, and premium villas — designed for direct booking.
                </p>
              </div>
            </div>
          </div>

          {/* BOOKING BAR (NIPIS + TRANSPARENT + RESPONSIVE SAME AS REFERENCE) */}
          <div
            id="availability"
            className="absolute left-1/2 top-[58%] w-[min(100%,980px)] -translate-x-1/2 px-4 md:top-[55%]"
          >
            <div className="rounded-md bg-white/70 shadow-lg backdrop-blur-md ring-1 ring-black/10">
              {/* Desktop: 1 row. Mobile: 2-col grid like reference */}
              <div className="grid gap-2 p-2 md:gap-0 md:p-0
                              grid-cols-2
                              md:grid-cols-[1fr_1fr_1fr_1fr_1fr_140px]">

                {/* Arrival */}
                <div className="rounded-md bg-white/70 ring-1 ring-black/10 md:rounded-none md:bg-transparent md:ring-0 md:border-r md:border-slate-200">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <input
                      type="date"
                      className="h-9 w-full bg-transparent text-sm outline-none"
                      aria-label="Arrival"
                    />
                  </div>
                </div>

                {/* Departure */}
                <div className="rounded-md bg-white/70 ring-1 ring-black/10 md:rounded-none md:bg-transparent md:ring-0 md:border-r md:border-slate-200">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <input
                      type="date"
                      className="h-9 w-full bg-transparent text-sm outline-none"
                      aria-label="Departure"
                    />
                  </div>
                </div>

                {/* Flexible Stay */}
                <div className="rounded-md bg-white/70 ring-1 ring-black/10 md:rounded-none md:bg-transparent md:ring-0 md:border-r md:border-slate-200">
                  <div className="flex items-center px-3 py-2">
                    <select
                      className="h-9 w-full bg-transparent text-sm outline-none"
                      aria-label="Flexible Stay"
                      defaultValue=""
                    >
                      <option value="" disabled>Flexible Stay</option>
                      <option value="1">1 day</option>
                      <option value="2">2 days</option>
                      <option value="3">3 days</option>
                      <option value="4">4 days</option>
                      <option value="5">5 days</option>
                    </select>
                  </div>
                </div>

                {/* Adults */}
                <div className="rounded-md bg-white/70 ring-1 ring-black/10 md:rounded-none md:bg-transparent md:ring-0 md:border-r md:border-slate-200">
                  <div className="flex items-center px-3 py-2">
                    <select className="h-9 w-full bg-transparent text-sm outline-none" aria-label="Adults" defaultValue="1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <option key={i} value={i + 1}>
                          Adults: {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Children (mobile full width like reference bottom-left) */}
                <div className="col-span-2 rounded-md bg-white/70 ring-1 ring-black/10
                                md:col-span-1 md:rounded-none md:bg-transparent md:ring-0 md:border-r md:border-slate-200">
                  <div className="flex items-center px-3 py-2">
                    <select className="h-9 w-full bg-transparent text-sm outline-none" aria-label="Children" defaultValue="0">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <option key={i} value={i}>
                          Children: {i}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Search (mobile full width bar) */}
                <button
                  className="col-span-2 h-11 rounded-md bg-teal-600 text-sm font-medium text-white hover:bg-teal-700
                             md:col-span-1 md:h-full md:rounded-none"
                >
                  Search
                </button>
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
