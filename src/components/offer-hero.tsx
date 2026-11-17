import styles from "./services-overview.module.css";
import story from "./software-story.module.css";
import { SoftwareChapterNav } from "./software-chapter-nav";

const pipeline = [
  ["New inquiry", ["Sarah M.", "Lip filler consult · Website"], ["Dana R.", "Skin consult · Instagram DM"]],
  ["Contacted", ["Priya K.", "Missed call · Text-back sent"], ["Mel T.", "Follow-up scheduled"]],
  ["Booked", ["Jo L.", "Thu 10:30 am · Reminder set"], ["Amy W.", "Fri 2:00 pm · Reminder set"]],
  ["Client", ["Lena P.", "Treatment plan sent"]],
] as const;

export function OfferHero() {
  return (
    <header className={styles.offerHero}>
      <p className={styles.label}>02 / What we do</p>
      <h2 id="offer-title">You imagine. We build.<br />We manage. <span>You scale.</span></h2>
      <p>The systems your business runs on, built and run for you. CRM, automation and AI, plus the people to run the work.</p>
      <div className={styles.heroActions}>
        <a className={styles.primary} href="#contact">Book a discovery call</a>
        <a className={styles.pill} href="#packages">See packages</a>
      </div>
      <figure className={styles.preview}>
        <figcaption>Leads pipeline · Glow Aesthetics (sample)</figcaption>
        <div className={styles.pipelineColumns}>
          {pipeline.map(([stage, ...leads]) => (
            <div key={stage}>
              <h2>{stage}</h2>
              {leads.map(([name, detail]) => <p key={name}><strong>{name}</strong><span>{detail}</span></p>)}
            </div>
          ))}
        </div>
        <section className={styles.chat} aria-labelledby="sample-chat-title">
          <header className={styles.chatHeader}>
            <span className={styles.chatAvatar} aria-hidden="true">G</span>
            <div>
              <h3 id="sample-chat-title">Glow Aesthetics</h3>
              <p>AI booking assistant</p>
            </div>
          </header>
          <ol className={styles.chatMessages} role="list">
            <li>
              <span className={styles.srOnly}>Visitor: </span>
              Hi, do you have anything this week?
            </li>
            <li className={styles.chatReply}>
              <span className={styles.srOnly}>AI assistant: </span>
              I can book Thursday at 10:30 AM or Friday at 2 PM. Which works for you?
            </li>
            <li>
              <span className={styles.srOnly}>Visitor: </span>
              Thursday please.
            </li>
          </ol>
          <footer className={styles.chatReceipt}>
            <span aria-hidden="true">✓</span>
            <div><strong>Booking confirmed</strong><p>Thu, 10:30 AM · Reminder set</p></div>
          </footer>
        </section>
      </figure>
      <div className={story.openingRail}>
        <SoftwareChapterNav />
      </div>
    </header>
  );
}
