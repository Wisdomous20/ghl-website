import Link from "next/link";
import { PencilArrow } from "./sketch-controls";
import { pricingOptions } from "./pricing-options";
import styles from "./pricing-page.module.css";

export function PricingTeaser() {
  return <section className={styles.teaser} id="pricing" aria-labelledby="pricing-teaser-title">
    <div><p className={styles.kicker}>A clear place to begin</p><h2 id="pricing-teaser-title">Find your<br /><span>starting point.</span></h2></div>
    <div className={styles.teaserCopy}>
      <p className={styles.startingPrice}><span>Systems Blueprint from</span><strong>{pricingOptions[0].prices[0].amount}</strong></p>
      <p>A clear plan for your Proven System. Build and ongoing management are priced separately.</p>
      <Link className={styles.textLink} href="/pricing">See all pricing & build paths <PencilArrow /></Link>
    </div>
  </section>;
}
