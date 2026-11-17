export const operatePackages = {
  system: [
    {
      name: "OPERATE Core",
      fit: "Solo operators or teams of 2–4",
      summary: "Your lead system, set up and running.",
      includes: ["Up to 5 users and 1 location", "2 pipelines and up to 15 workflows", "2 calendars with reminders", "1 AI chat and FAQ assistant"],
    },
    {
      name: "OPERATE Growth",
      fit: "5–15 staff at one location",
      summary: "More pipelines and more flexible booking.",
      includes: ["Up to 20 users and 1 location", "5 pipelines and up to 40 workflows", "Unlimited calendars with round-robin booking", "No-show recovery", "AI chat and appointment assistant"],
    },
    {
      name: "OPERATE Pro",
      fit: "2+ locations or 15+ staff",
      summary: "Built for multi-location teams.",
      includes: ["Up to 50 users and 3 locations", "10 pipelines and up to 90 workflows", "Everything in Growth", "Multi-location routing"],
    },
  ],
  managed: [
    {
      name: "OPERATE Core+",
      fit: "Small teams that want to post consistently",
      summary: "Your system runs and your social channels stay active.",
      includes: ["Everything in OPERATE Core", "12 social posts a month", "3 Google and AI search articles a month", "Fixes for anything broken", "Monthly snapshot and quarterly strategy call"],
    },
    {
      name: "OPERATE Growth+",
      fit: "Businesses that want more leads",
      summary: "Everything in Core+, plus video and more posts.",
      includes: ["Everything in OPERATE Growth", "20 social posts a month, including 4 Reels", "5 Google and AI search articles a month", "1 new time-saving workflow a month", "Faster support"],
    },
    {
      name: "OPERATE Pro+",
      fit: "Multi-location, high-volume teams",
      summary: "The full team behind your system.",
      includes: ["Everything in OPERATE Pro", "30 social posts a month, including 8 Reels", "8 Google and AI search articles a month", "2 new automations a month", "Biweekly strategy calls"],
    },
  ],
} as const;
