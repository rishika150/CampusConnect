import { useEffect, useState } from "react";
import DashboardHero from "../components/dashboard/DashboardHero";
import DashboardStats from "../components/dashboard/DashboardStats";
import UpcomingEvents from "../components/dashboard/UpcomingEvents";
import FeaturedClubs from "../components/dashboard/FeaturedClubs";
import { useAuth } from "../context/AuthContext";
import {
  fetchClubs,
  fetchMyClubs,
} from "../services/clubService";
import { fetchUpcomingEvents } from "../services/eventService";

export default function Dashboard() {
  const { user } = useAuth();

  const [clubs, setClubs] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setWarning("");

      const results = await Promise.allSettled([
        fetchClubs({ size: 3 }),
        fetchMyClubs(),
        fetchUpcomingEvents({ size: 4 }),
      ]);

      if (!active) return;

      const [clubsResult, membershipsResult, eventsResult] = results;

      if (clubsResult.status === "fulfilled") {
        setClubs(clubsResult.value?.content ?? []);
      }

      if (membershipsResult.status === "fulfilled") {
        setMyClubs(membershipsResult.value ?? []);
      }

      if (eventsResult.status === "fulfilled") {
        setEvents(eventsResult.value?.content ?? []);
      }

      if (results.some((result) => result.status === "rejected")) {
        setWarning(
          "Some dashboard information could not be refreshed.",
        );
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-[1500px]">
      {warning && (
        <div className="mb-6 rounded-[16px] border border-[#efcbdc] bg-[#fff3f8] px-5 py-4 text-sm font-semibold text-[#7e367a]">
          {warning}
        </div>
      )}

      <DashboardHero
        user={user}
        event={events[0] ?? null}
      />

      <DashboardStats
        joinedClubs={myClubs.length}
        upcomingEvents={events.length}
      />

      <section className="mt-8 grid gap-7 xl:grid-cols-[1.3fr_0.7fr]">
        <UpcomingEvents
          events={events}
          loading={loading}
        />

        <FeaturedClubs
          clubs={clubs}
          loading={loading}
        />
      </section>
    </div>
  );
}