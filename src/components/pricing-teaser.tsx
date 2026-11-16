import Link from "next/link";
import { PencilArrow } from "./sketch-controls";
import { pricingOptions } from "./pricing-options";
import styles from "./pricing-page.module.css";

export function PricingTeaser() {
  return <section className={styles.teaser} id="pricing" aria-labelledby="pricing-teaser-title">
    <div><p className={styles.kicker}>A clear place to begin</p><h2 id="pricing-teaser-title">Find your<br /><span>starting point.</span></h2></div>
    <div className={styles.teaserCopy}>
      <p className={styles.startingPrice}><span>Custom Build Blueprint from</span><strong>{pricingOptions[0].prices[0].amount}</strong></p>
      <p>Plan an individually scoped Custom Build, or start with a pre-built system and its activation/setup fee. Explore build pricing and ongoing management.</p>
      <Link className={styles.textLink} href="/pricing">See all pricing & build paths <PencilArrow /></Link>
    </div>
  </section>;
}
