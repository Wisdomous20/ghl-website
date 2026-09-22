import styles from "./build-chapter.module.css";

/** The three rails of the identity open into the three parts of a working system. */
export function ServiceSystem() {
  return <svg className={styles.system} viewBox="0 0 720 560" fill="none" aria-hidden="true">
    <g className={styles.systemGuides}><path d="M75 28V530M658 28V530M30 62H692M30 501H692" /><path d="M69 62h12M75 56v12M652 501h12M658 495v12" /></g>
    <g className={styles.connections}><path pathLength="1" d="M133 254H190V148H275" /><path pathLength="1" d="M133 278H224V303H285" /><path pathLength="1" d="M133 301H177V435H262" /></g>
    <g className={styles.systemCore} transform="translate(67 243)"><rect width="48" height="13" rx="3" /><rect x="56" width="13" height="13" rx="3" className={styles.orangeFill} /><rect y="25" width="53" height="13" rx="3" /><rect y="50" width="35" height="13" rx="3" /><text x="0" y="92">ENGINARA</text></g>
    <g className={styles.softwareModule}>
      <rect x="276" y="61" width="324" height="170" rx="5" className={styles.moduleSurface} /><path d="M276 87H600" className={styles.moduleLine} /><circle cx="290" cy="75" r="3" className={styles.orangeFill} /><text x="303" y="79" className={styles.miniLabel}>YOUR DIGITAL FRONT DOOR</text>
      <g className={styles.siteHeadline}><text x="296" y="122" className={styles.moduleTitle}>Made for your business.</text><path d="M296 139H440M296 150H403" className={styles.moduleLine} /></g>
      <g className={styles.siteAction}><rect x="296" y="173" width="80" height="25" rx="2" className={styles.orangeFill} /><text x="309" y="189" className={styles.buttonLabel}>LET’S BEGIN ↗</text></g>
      <path d="M478 114h99v86h-99zM478 114l99 86M577 114l-99 86" className={styles.moduleLine} />
      <g className={styles.siteImage}><rect x="478" y="114" width="99" height="86" className={styles.blueSurface} /><path d="M478 182 509 148 530 170 548 153 577 183V200H478Z" className={styles.sageFill} /><circle cx="553" cy="134" r="9" className={styles.orangeFill} /></g>
      <g className={styles.siteCursor}><path d="m348 188 3 18 5-6 8-1z" fill="currentColor" /><circle cx="348" cy="188" r="13" className={styles.clickRing} /></g>
      <text x="276" y="252" className={styles.moduleLabel}>01 / WEBSITES &amp; CUSTOM SOFTWARE</text>
    </g>
    <g className={styles.automationModule}>
      <path d="M298 316H627" className={styles.moduleLine} /><rect x="285" y="291" width="92" height="49" rx="4" className={styles.blueSurface} /><rect x="413" y="291" width="92" height="49" rx="4" className={styles.blueSurface} /><rect x="541" y="291" width="92" height="49" rx="4" className={styles.blueSurface} /><text x="307" y="320">Enquiry</text><text x="431" y="320">Workflow</text><text x="561" y="320">Follow-up</text><path d="m393 312 5 4-5 4m128-8 5 4-5 4" className={styles.blueLine} />
      <circle cx="379" cy="316" r="3" className={styles.flowDot} /><circle cx="507" cy="316" r="3" className={styles.flowDot} /><path d="m352 278 4 4 7-9" className={styles.flowCheck} /><path d="m479 278 4 4 7-9" className={styles.flowCheck} /><path d="m607 278 4 4 7-9" className={styles.flowCheck} /><text x="285" y="367" className={styles.moduleLabel}>02 / AUTOMATION &amp; AI SYSTEMS</text>
    </g>
    <g className={styles.careModule}>
      <rect x="262" y="413" width="333" height="70" rx="4" className={styles.sageSurface} /><circle cx="283" cy="435" r="4" className={styles.careBeacon} /><text x="299" y="440" className={styles.moduleTitle}>Keep moving forward.</text><text x="282" y="465" className={styles.miniLabel}>MONITOR</text><text x="369" y="465" className={styles.miniLabel}>MAINTAIN</text><text x="461" y="465" className={styles.miniLabel}>IMPROVE</text><path d="M282 473H338M369 473H433M461 473H519" className={styles.careTrack} /><path d="m549 448 8 0 4-10 6 18 5-9 12 0" className={styles.careTrace} pathLength="1" /><rect x="282" y="472" width="56" height="2" className={styles.careProgress} />
      <text x="262" y="507" className={styles.moduleLabel}>03 / MANAGED OPERATIONS</text>
    </g>
  </svg>;
}
