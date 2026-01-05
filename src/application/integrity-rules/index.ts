/**
 * Integrity Rules Layer
 * 
 * This module enforces critical business rules at the application layer.
 * These rules are the "guardrails" that prevent edge cases and abuse.
 * 
 * Categories:
 * A) Ownership & Self-Dealing
 * B) Listing Visibility & Access
 * C) Stock & Concurrency
 * D) Pricing Integrity
 * E) Digital Delivery Integrity
 * F) Policies & Returns
 * G) Search / Tags / Attributes
 * H) Content & Moderation
 */

export * from "./ownership-rules";
export * from "./visibility-rules";
export * from "./stock-rules";
export * from "./pricing-rules";
export * from "./digital-rules";
export * from "./personalization-rules";
export * from "./tag-rules";
export * from "./review-rules";

