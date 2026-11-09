import { HomeHero } from "@/components/home/home-hero";
import { HomeLiveCenter } from "@/components/home/home-live-center";
import { HomeTournaments } from "@/components/home/home-tournaments";
import { HomeSoftware } from "@/components/home/home-software";
import { HomeLeaderboard } from "@/components/home/home-leaderboard";
import { HomeNews } from "@/components/home/home-news";
import { SponsorsSection } from "@/components/sponsors-section";
import { HomeCta } from "@/components/home/home-cta";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { HomeMotion } from "@/components/home-motion";
import {
  getAthletes,
  getBanners,
  getEvents,
  getNews,
  getRanking,
  getSchedule,
  isCurrentOrUpcomingMatch,
  sortEvents,
  sortMatches,
} from "@/lib/public-data";

export default async function Home() {
  const [events, matches, news, ranking, banners, athletes] = await Promise.all([
    getEvents(),
    getSchedule(),
    getNews(),
    getRanking(),
    getBanners(),
    getAthletes(),
  ]);

  const nonTestEvents = events.filter(
    (event) => !(event.name.trim().toLowerCase() === "test" && !event.location.trim())
  );
  const orderedEvents = sortEvents(nonTestEvents.length > 0 ? nonTestEvents : events);

  // Exclude matches from ended events and only keep live or upcoming matches
  const endedEventSlugs = new Set(
    events.filter((event) => event.status === "Đã kết thúc").map((event) => event.slug)
  );
  const endedEventNames = new Set(
    events.filter((event) => event.status === "Đã kết thúc").map((event) => event.name)
  );

  // Only show active, ongoing, or upcoming matches (never past or ended matches) in the Live Arena Center
  const liveOrUpcomingMatches = matches.filter((match) => {
    if (match.eventSlug && endedEventSlugs.has(match.eventSlug)) return false;
    if (match.eventName && endedEventNames.has(match.eventName)) return false;
    return isCurrentOrUpcomingMatch(match);
  });

  const sortedMatches = sortMatches(liveOrUpcomingMatches);
  const featuredAthlete = athletes.length > 0 ? athletes[0] : null;

  return (
    <>
      <HomeMotion />
      <SiteHeader />
      <main id="main-content" className="modern-home-main">
        {/* 1. Hero Section: Banner Slider, High-Impact Messaging & Active Tournament Spotlight */}
        <HomeHero events={orderedEvents} banners={banners} />

        {/* 2. Live Tatami Arena: Real-time match filter tabs, Aka vs Ao cards, live score */}
        <HomeLiveCenter matches={sortedMatches} />

        {/* 3. National Tournaments Hub: Featured event spotlight + upcoming tournament calendar */}
        <HomeTournaments events={orderedEvents} />

        {/* 4. K-SPORT Software Suite: 4 Core pillars + Interactive digital Tatami scoreboard console */}
        <HomeSoftware />

        {/* 5. Leaderboard & Spotlight: Top 5 ranking points + Interactive athlete spotlight */}
        <HomeLeaderboard ranking={ranking} athletes={athletes} featuredAthlete={featuredAthlete} />

        {/* 6. Karate News & Professional Media: Editorial lead story + side articles */}
        <HomeNews news={news} />

        {/* 7. Official Partners & Equipment Sponsors */}
        <SponsorsSection />

        {/* 8. Tournament Organizer Call To Action: Partnering with federations & clubs */}
        <HomeCta />
      </main>
      <SiteFooter />
    </>
  );
}
