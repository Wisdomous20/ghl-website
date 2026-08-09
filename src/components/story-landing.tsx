"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { MotionValue } from "motion/react";
import { useRef } from "react";
import styles from "./story-landing.module.css";

function WindowChrome({ label, live = false }: { label: string; live?: boolean }) {
  return (
    <div className={styles.windowChrome}>
      <span className={styles.windowDots} aria-hidden="true"><i /><i /><i /></span>
      <span>{label}</span>
      {live ? <b><i /> live</b> : <small>Ops&Code</small>}
    </div>
  );
}

type ThoughtMotion = {
  opacity: MotionValue<number>;
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  y: MotionValue<number>;
};

function FloatingThoughts({
  markOpacity,
  markRotate,
  markScale,
  thoughtOne,
  thoughtTwo,
  thoughtThree,
}: {
  markOpacity: MotionValue<number>;
  markRotate: MotionValue<number>;
  markScale: MotionValue<number>;
  thoughtOne: ThoughtMotion;
  thoughtTwo: ThoughtMotion;
  thoughtThree: ThoughtMotion;
}) {
  return (
    <div className={styles.thoughtField}>
      <motion.div
        className={styles.thoughtMark}
        style={{ opacity: markOpacity, rotate: markRotate, scale: markScale }}
        aria-hidden="true"
      >
        <Image src="/brand/ops-and-code-mark-relay.png" alt="" width={520} height={520} />
      </motion.div>
      <motion.article
        className={`${styles.thoughtCard} ${styles.thoughtCardOne}`}
        style={thoughtOne}
      >
        <span>01 / THE FRICTION</span>
        <strong>There has to be a better way to do this.</strong>
        <small>The first thought is usually the right one to follow.</small>
      </motion.article>
      <motion.article
        className={`${styles.thoughtCard} ${styles.thoughtCardTwo}`}
        style={thoughtTwo}
      >
        <span>02 / THE POSSIBILITY</span>
        <strong>What could the team do with those hours back?</strong>
        <small>Less chasing. More work that moves the business forward.</small>
      </motion.article>
      <motion.article
        className={`${styles.thoughtCard} ${styles.thoughtCardThree}`}
        style={thoughtThree}
      >
        <span>03 / THE FUTURE</span>
        <strong>It should keep getting better as we grow.</strong>
        <small>Not another tool to manage. A better way to operate.</small>
      </motion.article>
    </div>
  );
}

function CodeRoom() {
  return (
    <div className={styles.codeRoom}>
      <WindowChrome label="idea-to-system.ts" />
      <div className={styles.codeBody}>
        <div className={styles.lineNumbers} aria-hidden="true">1<br />2<br />3<br />4<br />5<br />6<br />7</div>
        <code>
          <span className={styles.codeLineOne}><i>const</i> possibility = listenTo(client);</span>
          <span className={styles.codeLineTwo}><i>const</i> workflow = mapWhatMatters();</span>
          <span className={styles.codeLineThree}>system.connect(&#123;</span>
          <span className={styles.codeLineFour}>people, data, decisions,</span>
          <span className={styles.codeLineFive}>&#125;);</span>
          <span className={styles.codeLineSix}>ship(<b>“ready for real work”</b>);</span>
        </code>
        <span className={styles.codeCursor} aria-hidden="true" />
      </div>
    </div>
  );
}

function WorkingPreview() {
  return (
    <div className={styles.previewWindow}>
      <WindowChrome label="your-system.com / workflow" live />
      <div className={styles.previewBody}>
        <div className={styles.previewTopline}>
          <div><span>WORKFLOW / 001</span><strong>The client journey</strong></div>
          <span className={styles.runStatus}><i /> Running normally</span>
        </div>
        <div className={styles.flowCanvas}>
          <article className={styles.flowNode}>
            <span>01</span><strong>New request</strong><small>Captured instantly</small>
          </article>
          <i className={styles.flowConnector} aria-hidden="true" />
          <article className={`${styles.flowNode} ${styles.flowNodeActive}`}>
            <span>02</span><strong>Smart handoff</strong><small>Routed to the right person</small>
          </article>
          <i className={styles.flowConnector} aria-hidden="true" />
          <article className={styles.flowNode}>
            <span>03</span><strong>Follow-through</strong><small>Nothing gets lost</small>
          </article>
        </div>
        <div className={styles.previewFooter}>
          <span><b>24</b> steps handled today</span>
          <span>Last run · just now</span>
        </div>
      </div>
    </div>
  );
}

function ManagedPreview() {
  return (
    <div className={styles.manageWindow}>
      <WindowChrome label="operations / today" live />
      <div className={styles.manageBody}>
        <div className={styles.healthPanel}>
          <span>SYSTEM HEALTH</span>
          <div className={styles.healthRing}>
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="50" />
              <circle className={styles.healthValue} cx="60" cy="60" r="50" />
            </svg>
            <strong>98.7<small>%</small></strong>
          </div>
          <p>Quietly doing its job.</p>
        </div>
        <div className={styles.activityPanel}>
          <div className={styles.activityHeading}><span>LIVE ACTIVITY</span><small>Today</small></div>
          <div className={styles.activityRow}><i /><span><b>Lead handed to sales</b><small>Rule refined last week</small></span><time>now</time></div>
          <div className={styles.activityRow}><i /><span><b>Client follow-up sent</b><small>12 completed</small></span><time>8m</time></div>
          <div className={styles.activityRow}><i /><span><b>Weekly report prepared</b><small>Ready for review</small></span><time>1h</time></div>
        </div>
      </div>
      <div className={styles.manageFooter}><span><i /> Ops&Code is keeping watch</span><span>Version 1.8 · improving</span></div>
    </div>
  );
}

export function StoryLanding() {
  const reduceMotion = useReducedMotion();
  const imagineRef = useRef<HTMLElement>(null);
  const buildRef = useRef<HTMLElement>(null);
  const manageRef = useRef<HTMLElement>(null);

  const { scrollYProgress: pageProgress } = useScroll();
  const smoothProgress = useSpring(pageProgress, { stiffness: 110, damping: 30, restDelta: 0.001 });

  const { scrollYProgress: imagineProgress } = useScroll({
    target: imagineRef,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: buildProgress } = useScroll({
    target: buildRef,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: manageProgress } = useScroll({
    target: manageRef,
    offset: ["start start", "end end"],
  });

  const imagineTitleOpacity = useTransform(imagineProgress, [0, 0.08, 0.15], [1, 1, 0]);
  const imagineTitleY = useTransform(imagineProgress, [0, 0.15], reduceMotion ? [0, 0] : [0, -90]);
  const thoughtMarkOpacity = useTransform(imagineProgress, [0.12, 0.22, 0.78, 0.9], [0, 0.16, 0.16, 0]);
  const thoughtMarkScale = useTransform(imagineProgress, [0.12, 0.35, 0.82], reduceMotion ? [1, 1, 1] : [0.72, 1, 1.08]);
  const thoughtMarkRotate = useTransform(imagineProgress, [0.12, 0.82], reduceMotion ? [0, 0] : [-8, 8]);
  const thoughtOneOpacity = useTransform(imagineProgress, [0.16, 0.25, 0.74, 0.84], [0, 1, 1, 0]);
  const thoughtOneY = useTransform(imagineProgress, [0.16, 0.34, 0.74], reduceMotion ? [0, 0, 0] : [60, 0, -18]);
  const thoughtOneRotate = useTransform(imagineProgress, [0.16, 0.74], reduceMotion ? [-4, -4] : [-9, -3]);
  const thoughtOneScale = useTransform(imagineProgress, [0.16, 0.3], reduceMotion ? [1, 1] : [0.86, 1]);
  const thoughtTwoOpacity = useTransform(imagineProgress, [0.25, 0.34, 0.76, 0.86], [0, 1, 1, 0]);
  const thoughtTwoY = useTransform(imagineProgress, [0.25, 0.43, 0.76], reduceMotion ? [0, 0, 0] : [72, 0, -22]);
  const thoughtTwoRotate = useTransform(imagineProgress, [0.25, 0.76], reduceMotion ? [3, 3] : [9, 2]);
  const thoughtTwoScale = useTransform(imagineProgress, [0.25, 0.39], reduceMotion ? [1, 1] : [0.86, 1]);
  const thoughtThreeOpacity = useTransform(imagineProgress, [0.34, 0.43, 0.78, 0.88], [0, 1, 1, 0]);
  const thoughtThreeY = useTransform(imagineProgress, [0.34, 0.52, 0.78], reduceMotion ? [0, 0, 0] : [84, 0, -16]);
  const thoughtThreeRotate = useTransform(imagineProgress, [0.34, 0.78], reduceMotion ? [-2, -2] : [-7, -2]);
  const thoughtThreeScale = useTransform(imagineProgress, [0.34, 0.48], reduceMotion ? [1, 1] : [0.86, 1]);
  const briefOpacity = useTransform(imagineProgress, [0.8, 0.9, 1], [0, 1, 1]);

  const buildTitleOpacity = useTransform(buildProgress, [0, 0.11, 0.2], [1, 1, 0]);
  const buildTitleY = useTransform(buildProgress, [0, 0.2], reduceMotion ? [0, 0] : [0, -70]);
  const codeOpacity = useTransform(buildProgress, [0.14, 0.25, 0.49, 0.62], [0, 1, 1, 0]);
  const codeScale = useTransform(buildProgress, [0.14, 0.3, 0.6], reduceMotion ? [1, 1, 1] : [0.74, 1, 0.9]);
  const codeRotate = useTransform(buildProgress, [0.14, 0.36, 0.6], reduceMotion ? [0, 0, 0] : [4, 0, -2]);
  const previewOpacity = useTransform(buildProgress, [0.52, 0.65, 0.94, 1], [0, 1, 1, 0.9]);
  const previewScale = useTransform(buildProgress, [0.52, 0.68, 1], reduceMotion ? [1, 1, 1] : [0.76, 1, 0.92]);
  const previewY = useTransform(buildProgress, [0.52, 0.68, 1], reduceMotion ? [0, 0, 0] : [120, 0, -35]);
  const liveBadgeOpacity = useTransform(buildProgress, [0.76, 0.84], [0, 1]);

  const manageTitleOpacity = useTransform(manageProgress, [0, 0.14, 0.24], [1, 1, 0]);
  const manageTitleY = useTransform(manageProgress, [0, 0.24], reduceMotion ? [0, 0] : [0, -70]);
  const manageOpacity = useTransform(manageProgress, [0.18, 0.32, 0.92, 1], [0, 1, 1, 0.9]);
  const manageScale = useTransform(manageProgress, [0.18, 0.38, 1], reduceMotion ? [1, 1, 1] : [0.78, 1, 0.94]);
  const manageY = useTransform(manageProgress, [0.18, 0.4, 1], reduceMotion ? [0, 0, 0] : [120, 0, -35]);
  const careOpacity = useTransform(manageProgress, [0.67, 0.78], [0, 1]);

  return (
    <main className={styles.page}>
      <motion.div className={styles.progress} style={{ scaleX: smoothProgress }} />
      <a className={styles.skipLink} href="#imagine">Skip to the story</a>

      <section className={styles.hero} aria-labelledby="hero-title">
        <motion.header
          className={styles.heroHeader}
          initial={reduceMotion ? false : { opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image src="/brand/ops-and-code-logo-wide.png" alt="Ops&Code" width={230} height={58} priority />
          <span>STORY / 001</span>
        </motion.header>
        <div className={styles.heroStage}>
          <motion.div
            className={styles.heroMarkIntro}
            initial={reduceMotion ? false : { opacity: 0, rotate: -10, scale: 0.72, x: 0 }}
            animate={{ opacity: 0.16, rotate: 5, scale: 1, x: reduceMotion ? 0 : "18vw" }}
            transition={{ duration: reduceMotion ? 0 : 1.35, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          >
            <Image src="/brand/ops-and-code-mark-relay.png" alt="" width={620} height={620} priority />
          </motion.div>
          <motion.div
            className={styles.heroCopy}
            initial={reduceMotion ? false : { opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.42, duration: reduceMotion ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={styles.heroEyebrow}>YOU SEE WHAT COULD BE</span>
            <h1 id="hero-title">You imagine what the business could become.<br /><span>We build what gets it there.</span></h1>
            <p>Then we stay to keep every moving part useful, reliable, and evolving.</p>
          </motion.div>
        </div>
        <div className={styles.scrollCue} aria-hidden="true"><span>SCROLL TO BEGIN</span><i /></div>
      </section>

      <section ref={imagineRef} className={`${styles.act} ${styles.imagineAct}`} id="imagine" aria-labelledby="imagine-title">
        <div className={styles.actSticky}>
          <header className={styles.actHeader}><span>OPS&CODE</span><b>01 · IMAGINATION</b></header>
          <motion.div className={styles.actTitle} style={{ opacity: imagineTitleOpacity, y: imagineTitleY }}>
            <span>Before the brief, there is a feeling that the work could flow better.</span>
            <h2 id="imagine-title">You imagine.</h2>
          </motion.div>
          <FloatingThoughts
            markOpacity={thoughtMarkOpacity}
            markRotate={thoughtMarkRotate}
            markScale={thoughtMarkScale}
            thoughtOne={{ opacity: thoughtOneOpacity, rotate: thoughtOneRotate, scale: thoughtOneScale, y: thoughtOneY }}
            thoughtTwo={{ opacity: thoughtTwoOpacity, rotate: thoughtTwoRotate, scale: thoughtTwoScale, y: thoughtTwoY }}
            thoughtThree={{ opacity: thoughtThreeOpacity, rotate: thoughtThreeRotate, scale: thoughtThreeScale, y: thoughtThreeY }}
          />
          <motion.div className={styles.briefReady} style={{ opacity: briefOpacity }}>
            <i /><span><small>THE IDEA HAS A SHAPE</small><strong>Now it can be built.</strong></span>
          </motion.div>
        </div>
      </section>

      <section ref={buildRef} className={`${styles.act} ${styles.buildAct}`} aria-labelledby="build-title">
        <div className={styles.actSticky}>
          <header className={styles.actHeader}><span>OPS&CODE</span><b>02 · THE BUILD</b></header>
          <motion.div className={styles.actTitle} style={{ opacity: buildTitleOpacity, y: buildTitleY }}>
            <span>We find the order inside the possibility.</span>
            <h2 id="build-title">We build.</h2>
          </motion.div>
          <motion.div className={styles.codeStage} style={{ opacity: codeOpacity, scale: codeScale, rotate: codeRotate }}>
            <CodeRoom />
          </motion.div>
          <motion.div className={styles.previewStage} style={{ opacity: previewOpacity, scale: previewScale, y: previewY }}>
            <WorkingPreview />
          </motion.div>
          <motion.div className={styles.liveBadge} style={{ opacity: liveBadgeOpacity }}><i /><span><small>THE SYSTEM IS LIVE</small><strong>And real work begins.</strong></span></motion.div>
        </div>
      </section>

      <section ref={manageRef} className={`${styles.act} ${styles.manageAct}`} aria-labelledby="manage-title">
        <div className={styles.actSticky}>
          <header className={styles.actHeader}><span>OPS&CODE</span><b>03 · EVERY DAY AFTER</b></header>
          <motion.div className={styles.actTitle} style={{ opacity: manageTitleOpacity, y: manageTitleY }}>
            <span>Launch is the first day, not the last.</span>
            <h2 id="manage-title">We manage.</h2>
          </motion.div>
          <motion.div className={styles.manageStage} style={{ opacity: manageOpacity, scale: manageScale, y: manageY }}>
            <ManagedPreview />
          </motion.div>
          <motion.div className={styles.careNote} style={{ opacity: careOpacity }}>
            <span>IMPROVEMENT / 024</span><strong>The business changed.</strong><p>The system changed with it.</p><small><i /> shipped today</small>
          </motion.div>
        </div>
      </section>

      <section className={styles.recap} aria-label="The Ops&Code story">
        <article className={`${styles.recapPanel} ${styles.recapImagine}`}><span>01</span><h2>You imagine.</h2><p>The first sentence is enough.</p></article>
        <article className={`${styles.recapPanel} ${styles.recapBuild}`}><span>02</span><h2>We build.</h2><p>Clear, connected, ready for work.</p></article>
        <article className={`${styles.recapPanel} ${styles.recapManage}`}><span>03</span><h2>We manage.</h2><p>Your idea gets a working life.</p></article>
      </section>

      <footer className={styles.finale}>
        <Image src="/brand/ops-and-code-mark-relay.png" alt="" width={300} height={300} />
        <p>One continuous line, from possibility to operation.</p>
        <strong>OPS&CODE · STORY FIRST</strong>
      </footer>
    </main>
  );
}
