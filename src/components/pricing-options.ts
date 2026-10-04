/** Starting prices confirmed from the edit notes and the user's clarification. */
export const pricingOptions = [
  {
    id: "blueprint",
    name: "Systems Blueprint",
    intent: "Start with clarity",
    title: "Understand the work. Shape the plan.",
    description: "Map your tools, people, information and handoffs. Get a practical recommendation on what to connect, configure, build, or retain as is.",
    fit: "You know something needs to work better, but want a clear starting point.",
    scope: ["Map the current workflow", "Identify bottlenecks and priorities", "Create a step-by-step build plan"],
    prices: [{ label: "For a Proven System", amount: "$500", suffix: "" }, { label: "For a Custom Build", amount: "$1,000", suffix: "" }],
    priceNote: "Blueprint planning fee. The build is scoped separately.",
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
    prices: [{ label: "Activation", amount: "$1,500", suffix: "" }, { label: "Management", amount: "$600", suffix: "/month" }],
    priceNote: "Initial activation plus ongoing system management.",
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
    priceNote: "Scoped to the features and integrations involved.",
    action: "Discuss a Custom Build",
    subject: "Custom Build inquiry",
  },
] as const;

export function inquiryHref(subject: string) {
  return `mailto:info@enginara.tech?subject=${encodeURIComponent(subject)}`;
}
