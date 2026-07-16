import {
  CalendarDays,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

export default function EventHero({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  totalEvents,
}) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#eaddea] bg-white/78 px-7 py-8 shadow-[0_20px_55px_rgba(80,18,96,0.09)] backdrop-blur-xl sm:px-9">
      <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#ffb1c4]/35 blur-[75px]" />
      <div className="absolute -bottom-28 left-[30%] h-64 w-64 rounded-full bg-[#b05994]/16 blur-[90px]" />

      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#ead5e5] bg-white/75 px-4 py-2 text-sm font-bold text-[#7e367a]">
          <Sparkles size={16} />
          Campus experiences
        </span>

        <div className="mt-5 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-[-0.04em] text-[#28162f] sm:text-5xl">
              Find something worth showing up for.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[#817487]">
              Discover workshops, hackathons, talks, cultural activities, and
              student-led experiences happening across campus.
            </p>

            <p className="mt-3 text-sm font-semibold text-[#b05994]">
              {totalEvents} upcoming{" "}
              {totalEvents === 1 ? "event" : "events"} available
            </p>
          </div>

          <div className="grid h-24 w-24 place-items-center rounded-[24px] bg-[linear-gradient(135deg,#501260,#7e367a,#e37dac)] text-white shadow-[0_20px_40px_rgba(80,18,96,0.25)]">
            <CalendarDays size={34} />
          </div>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_220px_200px]">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b8ca4]"
            />

            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search events by title, club, or venue"
              className="h-12 w-full rounded-[15px] border border-[#eaddea] bg-white/88 pl-12 pr-4 text-sm text-[#28162f] outline-none transition placeholder:text-[#a397a8] focus:border-[#b05994] focus:ring-4 focus:ring-[#e37dac]/15"
            />
          </div>

          <div className="relative">
            <SlidersHorizontal
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7e367a]"
            />

            <select
              value={category}
              onChange={(event) => onCategoryChange(event.target.value)}
              className="h-12 w-full appearance-none rounded-[15px] border border-[#eaddea] bg-white/88 pl-11 pr-4 text-sm font-bold text-[#501260] outline-none focus:border-[#b05994] focus:ring-4 focus:ring-[#e37dac]/15"
            >
              <option value="ALL">All categories</option>
              <option value="WORKSHOP">Workshop</option>
              <option value="SEMINAR">Seminar</option>
              <option value="HACKATHON">Hackathon</option>
              <option value="CULTURAL">Cultural</option>
              <option value="SPORTS">Sports</option>
              <option value="NETWORKING">Networking</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="h-12 w-full rounded-[15px] border border-[#eaddea] bg-white/88 px-4 text-sm font-bold text-[#501260] outline-none focus:border-[#b05994] focus:ring-4 focus:ring-[#e37dac]/15"
          >
            <option value="ALL">All statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>
    </section>
  );
}