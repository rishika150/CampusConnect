import {
  ArrowUpRight,
  CalendarDays,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

const cards = [
  {
    key: "clubs",
    title: "Joined Clubs",
    color: "#FDE8F2",
    iconBg: "#E37DAC",
    icon: Users,
  },
  {
    key: "events",
    title: "Upcoming Events",
    color: "#F5EAFE",
    iconBg: "#7E367A",
    icon: CalendarDays,
  },
  {
    key: "activity",
    title: "Activity",
    color: "#FFF1F6",
    iconBg: "#B05994",
    icon: Sparkles,
  },
];

export default function DashboardStats({
  joinedClubs,
  upcomingEvents,
}) {
  const values = {
    clubs: joinedClubs,
    events: upcomingEvents,
    activity: joinedClubs + upcomingEvents,
  };

  const subtitles = {
    clubs: "Communities you've joined",
    events: "Scheduled ahead",
    activity: "Campus engagement",
  };

  return (
    <section className="mt-8 grid gap-5 md:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.article
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.08,
            }}
            whileHover={{
              y: -5,
            }}
            className="
              group
              relative
              overflow-hidden
              rounded-[24px]
              border
              border-[#efe3f0]
              bg-white/82
              p-6
              shadow-[0_18px_40px_rgba(80,18,96,.08)]
              backdrop-blur-xl
            "
          >
            <div
              className="absolute right-[-45px] top-[-45px] h-32 w-32 rounded-full opacity-25 blur-2xl"
              style={{
                background: card.iconBg,
              }}
            />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-[#8a7c91]">
                  {card.title}
                </p>

                <h2 className="mt-3 text-5xl font-extrabold tracking-tight text-[#2B1733]">
                  {values[card.key]}
                </h2>

                <p className="mt-2 text-sm text-[#8b7f93]">
                  {subtitles[card.key]}
                </p>
              </div>

              <div
                className="grid h-14 w-14 place-items-center rounded-2xl text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${card.iconBg}, #501260)`,
                }}
              >
                <Icon size={24} />
              </div>
            </div>

            <div className="relative mt-6 flex items-center justify-between border-t border-[#f1e6f2] pt-4">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#B05994]">
                Live
              </span>

              <ArrowUpRight
                size={18}
                className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </div>
          </motion.article>
        );
      })}
    </section>
  );
}