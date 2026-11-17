"use client";

import { useState } from "react";
import { operatePackages } from "./operate-packages";
import { inquiryHref } from "./pricing-options";
import styles from "./services-overview.module.css";

const modes = [
  { id: "system", label: "System only" },
  { id: "managed", label: "System + Managed Solutions" },
] as const;

export function PackageComparison({ customBuildHref, startingPricesHref }: { customBuildHref: string; startingPricesHref: string }) {
  const [mode, setMode] = useState<keyof typeof operatePackages>("managed");

  return (
    <section id="packages" tabIndex={-1} className={styles.packages} aria-labelledby="packages-title">
      <header className={styles.intro}>
        <p className={styles.label}>Packages</p>
        <h2 id="packages-title">Pick the system. Add the people.</h2>
        <p>{mode === "managed" ? "Your system plus a team that runs the work: content, search articles, support and reporting." : "Our proven CRM and automation system, configured for your business."}</p>
      </header>
      <fieldset className={styles.selector}>
        <legend className={styles.srOnly}>Package type</legend>
        {modes.map(option => (
          <label key={option.id}>
            <input className={styles.srOnly} type="radio" name="package-type" checked={mode === option.id} onChange={() => setMode(option.id)} />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>
      <div className={styles.plans}>
        {operatePackages[mode].map((plan, index) => (
          <article className={styles.plan} key={plan.name} data-recommended={index === 1}>
            <div className={styles.planTop}>
              <p className={styles.fit}>{plan.fit}</p>
              {index === 1 && <p className={styles.recommended}>Recommended</p>}
            </div>
            <h3>{plan.name}</h3>
            <p className={styles.summary}>{plan.summary}</p>
            <ul>{plan.includes.map(item => <li key={item}>{item}</li>)}</ul>
            <a className={styles.planAction} href={inquiryHref(`${plan.name} package inquiry`)} aria-label={`Discuss ${plan.name}`}>Discuss this package</a>
          </article>
        ))}
      </div>
      <p className={styles.packageNote}>Pricing is shared during the discovery call. Need something custom? <a href={customBuildHref}>Explore Custom Build</a>. Managed Solutions can be added to a Custom Build too.</p>
      <a className={styles.link} href={startingPricesHref}>See starting prices <span aria-hidden="true">↗</span></a>
    </section>
  );
}
