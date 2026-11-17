import { PencilArrow } from "./sketch-controls";
import styles from "./services-overview.module.css";

const services = [
  {
    name: "Enginara Systems",
    description: "Our proven CRM and automation platform, configured for your business. Capture leads, follow up, book appointments, and see what’s moving through your pipeline.",
    details: ["Forms, calls and DMs", "Text, email and AI chat", "Calendars and reminders", "Pipeline reporting"],
    href: "#packages",
    action: "Compare OPERATE packages",
  },
  {
    name: "Custom Build",
    description: "We build websites, software, integrations, and AI agents around your idea. We start with a Systems Blueprint to define scope, cost, and the build plan.",
    details: ["Scope and plan", "Design and build", "Connect your tools", "Test, train and launch", "Monitor and update"],
    href: "#build-paths",
    action: "Explore the build demos",
  },
  {
    name: "Managed Solutions",
    description: "A trained team runs the recurring work. Add Managed Solutions to Enginara Systems or a Custom Build when you need help with marketing, CRM, or admin.",
    details: ["Social posts and Reels", "Google and AI search articles", "CRM support", "Admin help", "Monthly reporting", "Strategy calls"],
    href: "#packages",
    action: "See package options",
  },
] as const;

export function ServicesOverview() {
  return (
    <section className={styles.overview} aria-labelledby="services-overview-title">
      <header className={styles.intro}>
        <h2 id="services-overview-title">One partner for the system, the build, and the people.</h2>
      </header>
      {services.map(service => (
        <article className={styles.service} key={service.name}>
          <div>
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <a className={styles.link} href={service.href}>{service.action}<PencilArrow /></a>
          </div>
          <ul>{service.details.map(detail => <li key={detail}>{detail}</li>)}</ul>
        </article>
      ))}
    </section>
  );
}
