import Image from "next/image";
import { AmbientStoryFilm } from "./ambient-story-film";
import { EnginaraMark } from "./enginara-mark";
import { ScrollJourney } from "./scroll-journey";
import styles from "./enginara-landing.module.css";

const operatingPrinciples = [
  ["01", "Understand the operation", "We map the real work before deciding what technology belongs in it."],
  ["02", "Build for adoption", "The system fits the people, decisions, and constraints already in motion."],
  ["03", "Stay accountable", "Launch becomes support, measurement, and deliberate improvement."],
];

export function EnginaraLanding() {
  return (
    <div className={styles.site}>
      <a className={styles.skipLink} href="#main-content">Skip to content</a>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a aria-label="Enginara home" className={styles.logo} href="#story">
            <EnginaraMark className={styles.logoMark} />
            <span>enginara</span>
          </a>
          <nav aria-label="Primary navigation" className={styles.nav}>
            <a href="#story">Story</a>
            <a href="#services">Services</a>
            <a href="#approach">Approach</a>
          </nav>
          <a className={styles.headerCta} href="#contact">
            Discuss a project <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <main id="main-content">
        <ScrollJourney />

        <section aria-labelledby="manifesto-title" className={styles.manifesto}>
          <p className={styles.sectionLabel}>One accountable partner</p>
          <h2 id="manifesto-title">
            Not a software handoff.
            <span>A working part of your business.</span>
          </h2>
          <div className={styles.manifestoFoot}>
            <p>
              Enginara joins development, automation, and ongoing support so momentum
              does not disappear between vendors.
            </p>
            <span aria-hidden="true">E / 01—03</span>
          </div>
        </section>

        <section aria-labelledby="services-title" className={styles.services} id="services">
          <header className={styles.servicesHeader}>
            <p className={styles.sectionLabel}>The disciplines</p>
            <h2 id="services-title">Three worlds. One system.</h2>
          </header>

          <article className={`${styles.serviceWorld} ${styles.developWorld}`}>
            <div className={styles.worldCopy}>
              <p className={styles.worldIndex}>01 / Build software</p>
              <h3>Software shaped around the operation.</h3>
              <p>
                Purpose-built systems that replace workarounds, connect teams, and give
                the business room to evolve.
              </p>
              <ul>
                <li>Custom business systems</li>
                <li>Web and mobile applications</li>
                <li>Cloud infrastructure</li>
              </ul>
            </div>
            <div className={styles.developmentStage}>
              <Image
                alt=""
                fill
                sizes="(max-width: 68rem) 100vw, 56vw"
                src="/media/enginara-story-start.webp"
              />
              <AmbientStoryFilm />
              <p>From the first line to a working environment.</p>
            </div>
          </article>

          <article className={`${styles.serviceWorld} ${styles.automateWorld}`}>
            <div className={styles.automateTitle} aria-hidden="true">AUTOMATE</div>
            <div className={styles.worldCopy}>
              <p className={styles.worldIndex}>02 / Build automation</p>
              <h3>Make the work move without chasing it.</h3>
              <p>
                Connected tools and intelligent workflows move information, decisions,
                and routine actions where they need to go.
              </p>
              <ul>
                <li>Workflow integration</li>
                <li>AI systems and assistants</li>
                <li>Custom APIs</li>
              </ul>
            </div>
            <div aria-hidden="true" className={styles.automationRoute}>
              <span>Work enters</span><i />
              <span>Decisions connect</span><i />
              <span>Work moves</span>
            </div>
          </article>

          <article className={`${styles.serviceWorld} ${styles.operateWorld}`}>
            <div className={styles.operationPlane} aria-hidden="true">
              <Image
                alt=""
                fill
                sizes="(max-width: 68rem) 100vw, 52vw"
                src="/media/enginara-story-end.webp"
              />
              <div className={styles.operationProof}>
                <i />
                <span>Managed / monitored / improving</span>
              </div>
            </div>
            <div className={styles.worldCopy}>
              <p className={styles.worldIndex}>03 / Manage operations</p>
              <h3>Technical ownership after launch.</h3>
              <p>
                A dependable team that supports the people, monitors the system, and
                improves what sits behind the day-to-day work.
              </p>
              <ul>
                <li>Managed technical support</li>
                <li>Quality assurance</li>
                <li>Ongoing optimization</li>
              </ul>
            </div>
          </article>
        </section>

        <section aria-labelledby="approach-title" className={styles.approach} id="approach">
          <div className={styles.approachHeading}>
            <p className={styles.sectionLabel}>How we work</p>
            <h2 id="approach-title">Technology that earns its place.</h2>
          </div>
          <div className={styles.approachSteps}>
            {operatingPrinciples.map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="contact-title" className={styles.contact} id="contact">
          <EnginaraMark className={styles.contactMark} />
          <div className={styles.contactCopy}>
            <p className={styles.sectionLabel}>Your move</p>
            <h2 id="contact-title">What should work better?</h2>
            <p>
              Tell us what you are trying to build, automate, or finally get under
              control. We will help you find the clearest next step.
            </p>
            <a className={styles.contactCta} href="mailto:hello@enginara.com?subject=New%20Enginara%20project">
              Start a project <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <a aria-label="Enginara home" className={styles.footerLogo} href="#story">
          <EnginaraMark className={styles.footerMark} />
          <span>enginara</span>
        </a>
        <p>Software development / Automation / Technical support</p>
        <p>© {new Date().getFullYear()} Enginara</p>
      </footer>
    </div>
  );
}
