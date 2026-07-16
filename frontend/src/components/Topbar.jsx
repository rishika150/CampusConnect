import { Bell, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const pages = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Your campus, at a glance.",
  },
  "/clubs": {
    title: "Discover Clubs",
    subtitle: "Find your next community.",
  },
  "/events": {
    title: "Events",
    subtitle: "Everything happening on campus.",
  },
  "/profile": {
    title: "Profile",
    subtitle: "Manage your account.",
  },
};

export default function Topbar() {
  const { user } = useAuth();
  const location = useLocation();

  const page = pages[location.pathname] ?? pages["/dashboard"];

  return (
    <header className="sticky top-0 z-30 border-b border-[#efe4f2] bg-[rgba(248,243,250,.78)] backdrop-blur-xl">
      <div className="flex h-20 items-center gap-5 px-7">

        <div>
          <h1 className="text-[34px] font-extrabold tracking-[-0.03em] text-[#23122c]">
            {page.title}
          </h1>

          <p className="text-sm text-[#7d7183]">
            {page.subtitle}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-4">

          <div className="relative hidden lg:block">
            <Search
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9b8ca4]"
            />

            <input
              placeholder="Search clubs and events"
              className="
              h-12
              w-[340px]
              rounded-2xl
              border
              border-[#eddff0]
              bg-white/80
              pl-12
              pr-5
              text-sm
              outline-none
              transition
              focus:border-[#b05994]
              focus:ring-4
              focus:ring-[#e37dac]/15
            "
            />
          </div>

          <button
            className="
            relative
            grid
            h-12
            w-12
            place-items-center
            rounded-2xl
            border
            border-[#eddff0]
            bg-white/80
            shadow-sm
            transition
            hover:scale-[1.03]
          "
          >
            <Bell size={18} />

            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#e37dac]" />
          </button>

          <div
            className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-[#eddff0]
            bg-white/80
            px-3
            py-2
            shadow-sm
          "
          >
            <div
              className="
              grid
              h-11
              w-11
              place-items-center
              rounded-xl
              bg-gradient-to-br
              from-[#7E367A]
              to-[#E37DAC]
              font-bold
              text-white
            "
            >
              {user?.fullName?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <p className="text-sm font-bold text-[#2b1733]">
                {user?.fullName}
              </p>

              <p className="text-xs text-[#8a7d92]">
                Campus member
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}