import type { Metadata } from "next";
import { PricingPage } from "@/components/pricing-page";

export const metadata: Metadata = {
  title: "Pricing & Build Paths | Enginara",
  description: "Find your starting point with a Systems Blueprint, Proven System or Custom Build. Explore project scope and ongoing system care with Enginara.",
};

export default function Pricing() {
  return <PricingPage />;
}
