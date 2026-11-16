/** Starting prices for the individually scoped build paths. */
export const supportTerms = "The initial response time for diagnosing an issue is 24–72 hours. Resolution timelines depend on the nature and complexity of the issue.";

export const pricingDisclaimer = "Pricing is shared during the discovery call. Bundles require an initial three-month commitment and continue month-to-month thereafter, with 30 days' notice required for cancellation. Unused social media posts and articles do not roll over to the following month. Third-party software, messaging, and AI usage fees are billed separately.";

export const pricingOptions = [
  {
    id: "blueprint",
    name: "Systems Blueprint",
    intent: "Start with clarity",
    title: "Understand the work. Shape the plan.",
    description: "Map your tools, people, information and handoffs for a Custom Build. Get a practical recommendation on what to connect, configure, build, or retain as is.",
    fit: "You are considering a Custom Build and want a clear plan before development.",
    scope: ["Map the current workflow", "Identify bottlenecks and priorities", "Create a step-by-step build plan"],
    prices: [{ label: "For a Custom Build", amount: "$1,000", suffix: "" }],
    priceNote: "Blueprint planning applies only to Custom Build projects. The build is scoped separately.",
    action: "Discuss your Blueprint",
    subject: "Systems Blueprint inquiry",
  },
  {
    id: "proven-system",
    name: "Proven System",
    intent: "Build on what works",
    title: "A proven foundation. Made yours.",
    description: "Start with an established system and shape it around the way your team works. Connect the website, CRM and automation your business needs.",
    fit: "Your process can work well with existing tools, configured and connected.",
    scope: ["Configure the system around your process", "Connect the tools and handoffs", "Test, document and train your team"],
    prices: [{ label: "Activation / setup", amount: "$1,500", suffix: "" }, { label: "Management", amount: "$600", suffix: "/month" }],
    priceNote: "Every pre-built package includes an activation/setup fee. No Blueprint fee applies.",
    action: "Discuss a Proven System",
    subject: "Proven System inquiry",
  },
  {
    id: "custom-build",
    name: "Custom Build",
    intent: "Make what’s missing",
    title: "Your idea. Purpose-built.",
    description: "When off-the-shelf tools fall short, we design and engineer the software your operation needs, then connect it to the rest of your system.",
    fit: "Your workflow needs capabilities that existing tools don’t provide.",
    scope: ["Design around your requirements", "Build and connect in working phases", "Test, document and train your team"],
    prices: [{ label: "Focused builds", amount: "$6,500", suffix: "" }, { label: "Larger systems", amount: "$12,000+", suffix: "" }],
    priceNote: "Each Custom Build is individually scoped to its features and integrations. Blueprint planning is priced separately.",
    action: "Discuss a Custom Build",
    subject: "Custom Build inquiry",
  },
] as const;

export function inquiryHref(subject: string) {
  return `mailto:info@enginara.tech?subject=${encodeURIComponent(subject)}`;
}
