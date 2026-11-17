"use client";

import { useId, useState } from "react";
import styles from "./services-overview.module.css";

const industries = [
  ["Med spas", "Reply to website inquiries and Instagram DMs, book consultations, and send reminders."],
  ["Aesthetic clinics", "Follow up after consultations and remind patients about treatment plans."],
  ["Real estate teams", "Bring leads from multiple portals into one pipeline and follow up with buyers."],
  ["HVAC and plumbing", "Send an automatic text after a missed call and take bookings while your team is on site."],
  ["Dental practices", "Respond to new patient inquiries, confirm appointments, and send reminders."],
] as const;

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function ServiceExamples() {
  return (
    <div className={styles.supporting}>
      <section id="who" aria-labelledby="who-title">
        <header className={styles.intro}>
          <p className={styles.label}>Who we help</p>
          <h2 id="who-title">For businesses that run on leads and bookings.</h2>
          <p>When inquiries come in across separate tools and your team is stretched thin, a connected system helps people respond and follow through.</p>
        </header>
        <dl className={styles.examples}>
          {industries.map(([name, detail]) => <div key={name}><dt>{name}</dt><dd>{detail}</dd></div>)}
        </dl>
        <p className={styles.packageNote}>Work in another industry? <a href="#contact">Tell us how your business works.</a></p>
      </section>
    </div>
  );
}

export function RevenueCalculator() {
  const id = useId();
  const [inquiries, setInquiries] = useState(10);
  const [bookingValue, setBookingValue] = useState(350);
  const [bookingRate, setBookingRate] = useState(30);
  const annualEstimate = inquiries * bookingValue * (bookingRate / 100) * 52;
  const inputs = [
    { key: "inquiries", label: "Missed calls or inquiries per week", value: inquiries, display: inquiries, min: 0, max: 100, step: 1, set: setInquiries },
    { key: "value", label: "Average value of a booking", value: bookingValue, display: money.format(bookingValue), min: 0, max: 5000, step: 50, set: setBookingValue },
    { key: "rate", label: "Share that would book with a fast reply", value: bookingRate, display: `${bookingRate}%`, min: 0, max: 100, step: 1, set: setBookingRate },
  ];

  return (
    <div className={styles.calculatorWrap}>
      <section className={styles.calculator} id="calculator" aria-labelledby="calculator-title">
        <div>
          <header className={styles.intro}>
            <p className={styles.label}>Missed revenue calculator</p>
            <h2 id="calculator-title">What do missed calls cost you?</h2>
          </header>
          {inputs.map(input => (
            <div className={styles.range} key={input.key}>
              <label htmlFor={`${id}-${input.key}`}>{input.label}</label>
              <span aria-hidden="true">{input.display}</span>
              <input id={`${id}-${input.key}`} type="range" min={input.min} max={input.max} step={input.step} value={input.value} aria-valuetext={String(input.display)} onChange={event => input.set(event.currentTarget.valueAsNumber)} />
            </div>
          ))}
        </div>
        <div className={styles.estimate}>
          <p>Estimated missed booking revenue</p>
          <output htmlFor={inputs.map(input => `${id}-${input.key}`).join(" ")}>
            <strong>{money.format(annualEstimate / 12)}</strong>
            <span>Per month · about {money.format(annualEstimate)} a year</span>
          </output>
          <p>Estimate based on your inputs and 52 weeks a year. Actual bookings may vary.</p>
          <a className={styles.resultAction} href="#contact">Talk through your numbers</a>
        </div>
      </section>
    </div>
  );
}
