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
        <div className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
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
          <div className="absolute inset-0 bg-black/18" />

          {/* HERO TEXT (ISAKA para dili matabunan) */}
          <div className="absolute inset-0">
            <div className="mx-auto max-w-6xl px-4">
              {/* KEY: isaka sa taas */}
              <div className="pt-14 md:pt-20">
                <h1 className="max-w-xl text-4xl font-semibold leading-tight text-white md:text-6xl">
                  Luxury stays at <br className="hidden md:block" />
                  Turtle Bay
                </h1>
                <p className="mt-4 max-w-xl text-sm text-white/90 md:text-base">
                  Beachfront access, resort amenities, and premium villas — designed for direct booking.
                </p>
              </div>
            </div>
          </div>

          {/* BOOKING BAR (NIPIS + TRANSPARENT + CENTER) */}
          <div
            id="availability"
            className="absolute left-1/2 -translate-x-1/2 bottom-12 md:bottom-14 w-[min(100%,980px)] px-4"
          >
            <div className="rounded-md bg-white/55 backdrop-blur-md shadow-md ring-1 ring-white/30">
              {/* Desktop row (thin) */}
              <div className="hidden md:grid md:grid-cols-[1fr_1fr_1fr_0.9fr_0.9fr_140px]">
                {/** Arrival */}
                <div className="border-r border-white/35 px-3 py-2">
                  <div className="text-[11px] font-medium text-slate-700">Arrival</div>
                  <input type="date" className="mt-1 h-8 w-full bg-transparent text-sm outline-none" />
                </div>

                {/** Departure */}
                <div className="border-r border-white/35 px-3 py-2">
                  <div className="text-[11px] font-medium text-slate-700">Departure</div>
                  <input type="date" className="mt-1 h-8 w-full bg-transparent text-sm outline-none" />
                </div>

                {/** Flexible Stay */}
                <div className="border-r border-white/35 px-3 py-2">
                  <div className="text-[11px] font-medium text-slate-700">Flexible Stay</div>
                  <select className="mt-1 h-8 w-full bg-transparent text-sm outline-none">
                    <option value="">Flexible Stay</option>
                    <option value="1">1 day</option>
                    <option value="2">2 days</option>
                    <option value="3">3 days</option>
                    <option value="4">4 days</option>
                    <option value="5">5 days</option>
                  </select>
                </div>

                {/** Adults */}
                <div className="border-r border-white/35 px-3 py-2">
                  <div className="text-[11px] font-medium text-slate-700">Adults</div>
                  <select className="mt-1 h-8 w-full bg-transparent text-sm outline-none" defaultValue="1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>

                {/** Children */}
                <div className="border-r border-white/35 px-3 py-2">
                  <div className="text-[11px] font-medium text-slate-700">Children</div>
                  <select className="mt-1 h-8 w-full bg-transparent text-sm outline-none" defaultValue="0">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>

                {/** Search */}
                <button className="h-full bg-teal-600 text-sm font-medium text-white hover:bg-teal-700">
                  Search
                </button>
              </div>

              {/* Mobile (2-col like reference) */}
              <div className="md:hidden p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-white/65 px-3 py-2">
                    <div className="text-[11px] font-medium text-slate-700">Arrival</div>
                    <input type="date" className="mt-1 h-9 w-full bg-transparent text-sm outline-none" />
                  </div>

                  <div className="rounded-md bg-white/65 px-3 py-2">
                    <div className="text-[11px] font-medium text-slate-700">Departure</div>
                    <input type="date" className="mt-1 h-9 w-full bg-transparent text-sm outline-none" />
                  </div>

                  <div className="rounded-md bg-white/65 px-3 py-2">
                    <div className="text-[11px] font-medium text-slate-700">Flexible Stay</div>
                    <select className="mt-1 h-9 w-full bg-transparent text-sm outline-none">
                      <option value="">Flexible Stay</option>
                      <option value="1">1 day</option>
                      <option value="2">2 days</option>
                      <option value="3">3 days</option>
                      <option value="4">4 days</option>
                      <option value="5">5 days</option>
                    </select>
                  </div>

                  <div className="rounded-md bg-white/65 px-3 py-2">
                    <div className="text-[11px] font-medium text-slate-700">Adults</div>
                    <select className="mt-1 h-9 w-full bg-transparent text-sm outline-none" defaultValue="1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 rounded-md bg-white/65 px-3 py-2">
                    <div className="text-[11px] font-medium text-slate-700">Children</div>
                    <select className="mt-1 h-9 w-full bg-transparent text-sm outline-none" defaultValue="0">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>

                  <button className="col-span-2 h-11 rounded-md bg-teal-600 text-sm font-medium text-white hover:bg-teal-700">
                    Search
                  </button>
                </div>
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
