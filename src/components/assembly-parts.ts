const cooling = {
  service: "Performance & reliability", title: "Room to keep running.",
  copy: "A cooling system keeps the machine working under pressure. We give your software the same attention, finding slow paths before they become everyday friction.",
  details: ["Measure the journeys people use most.", "Refine loading, queries, and background work."],
};
const memory = {
  service: "Data & application design", title: "The right information, within reach.",
  copy: "Memory gives the machine a working context. In your software, clear data structures help people find what matters and move between tasks without losing their place.",
  details: ["Organise information around real work.", "Keep context consistent across your tools."],
};
const battery = {
  service: "Managed operations", title: "Built for the days after launch.",
  copy: "Power keeps the system useful. Our ongoing care gives your website and software a dependable team for maintenance, fixes, and the next improvement.",
  details: ["Maintain updates, backups, and connections.", "Plan improvements around your priorities."],
};

export const ASSEMBLY_PARTS = [
  { id: "chassis", label: "Chassis & hinges", service: "Discovery & architecture", title: "Give the idea a sound foundation.", copy: "The chassis gives every part a place. We start your project by understanding who it serves, what it must do, and how its pieces should fit together.", details: ["Map the user journey and business constraints.", "Shape a practical architecture and delivery plan."] },
  { id: "board", label: "System board", service: "Integrations & automation", title: "Separate tools. One connected flow.", copy: "The board connects the machine. We connect your forms, CRM, calendars, and software so information reaches the right place with fewer manual handoffs.", details: ["Connect the tools your team already uses.", "Make exceptions and recovery part of the workflow."] },
  { id: "processor", label: "Processor", service: "Custom software", title: "Turn your rules into working software.", copy: "The processor carries out the instructions. We turn the way your business works into clear application logic, from a simple booking rule to a custom operations platform.", details: ["Build around the decisions your team makes.", "Test the important paths and the difficult edge cases."] },
  { id: "cooling", label: "Copper connections", service: "System design", title: "Make the connections deliberate.", copy: "These paths carry heat away from the core. Your software needs equally clear routes for information, with each connection serving a purpose.", details: ["Define what each part owns and shares.", "Keep integrations understandable as the system grows."] },
  { id: "fan-left", label: "Left cooling fan", ...cooling },
  { id: "fan-right", label: "Right cooling fan", ...cooling },
  { id: "memory-left", label: "Left memory module", ...memory },
  { id: "memory-right", label: "Right memory module", ...memory },
  { id: "battery-1", label: "Left battery cell", ...battery },
  { id: "battery-2", label: "Centre battery cell", ...battery },
  { id: "battery-3", label: "Right battery cell", ...battery },
  { id: "keyboard", label: "Keyboard", service: "Interface design", title: "Every interaction should feel considered.", copy: "Many individual keys become one familiar interface. We shape your forms, controls, and workflows with the same care, so complex work feels straightforward to use.", details: ["Design clear actions, feedback, and keyboard access.", "Refine the details through testing and real use."] },
  { id: "trackpad", label: "Trackpad", service: "Interaction design", title: "A clear path from intent to action.", copy: "The trackpad connects a small gesture to a useful result. We make the next step in your software clear, with responsive controls and feedback people can understand.", details: ["Make important actions easy to find.", "Use movement to explain what just changed."] },
  { id: "display", label: "Display & lid", service: "Web design & development", title: "Give the work a clear expression.", copy: "The display makes everything underneath visible. We design and build websites that explain your business, help people explore, and give them a clear next step.", details: ["Bring your identity into a coherent visual system.", "Build useful, accessible pages around your audience."] },
  { id: "fasteners", label: "Fasteners", service: "Testing & quality", title: "Small details hold the whole together.", copy: "Fasteners are easy to overlook until one is missing. We check the less visible parts of your product too, from validation and error states to the final handoff.", details: ["Check the details that make everyday use dependable.", "Verify the complete journey before release."] },
] as const;

export type AssemblyPartId = typeof ASSEMBLY_PARTS[number]["id"];
export function isAssemblyPartId(value: unknown): value is AssemblyPartId {
  return ASSEMBLY_PARTS.some(part => part.id === value);
}
