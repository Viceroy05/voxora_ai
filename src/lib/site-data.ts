import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Globe2,
  Home,
  LineChart,
  MessageSquareMore,
  PhoneCall,
  Sparkles,
  Stethoscope,
  UsersRound,
  Waves,
  Zap,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
};

export type StatItem = {
  label: string;
  value: string;
};

export type FeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
};

export type PricingPlan = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  cta: string;
  href: string;
  featured?: boolean;
  badge?: string;
  features: string[];
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

export type Industry = {
  title: string;
  description: string;
  icon: LucideIcon;
  outcomes: string[];
};

export const navigation: NavItem[] = [
  { href: "/features", label: "Features" },
  { href: "/industries", label: "Industries" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
  { href: "/dashboard", label: "Dashboard" },
];

export const trustedBrands = [
  "Aster Clinic Group",
  "Manipal Hospitals",
  "Studio Vale",
  "Pulse House",
  "Atlas Realty",
  "Brightline Dental",
  "Clarion Hotels",
  "ITC Spa & Wellness",
  "Max Healthcare",
  "Godrej Interio",
  "Decathlon",
  "Urban Company",
];

export const heroStats: StatItem[] = [
  { label: "calls answered instantly", value: "99.2%" },
  { label: "appointments booked automatically", value: "150k+" },
  { label: "businesses powered", value: "2800+" },
];

export const workflowSteps = [
  {
    step: "01",
    title: "Never miss a call—24/7 instant pickup",
    description:
      "Your AI receptionist answers in Hindi, English, or any language. No caller waits. No missed opportunity. Configured and live in hours, not weeks.",
  },
  {
    step: "02",
    title: "Qualify leads and book appointments in one call",
    description:
      "AI captures intent, confirms availability, syncs to Google Calendar or your CRM instantly, and escalates VIPs or complex cases to your team.",
  },
  {
    step: "03",
    title: "Convert missed calls into revenue—automatically",
    description:
      "Callback sequences, SMS follow-ups, and smart routing ensure no lead falls through cracks. Your team handles only qualified, ready-to-convert prospects.",
  },
];

export const features: FeatureItem[] = [
  {
    title: "Answer every call—even after hours",
    description:
      "24/7 AI receptionist in Hindi or English. Never miss a lead. Calls answered in 1 second. Your team sleeps, revenue keeps rolling.",
    icon: PhoneCall,
    accent: "from-blue-500/25 to-cyan-400/10",
  },
  {
    title: "Instant appointment booking",
    description:
      "AI confirms availability on the call, sends instant WhatsApp confirmation, and syncs to Google Calendar or your practice management system.",
    icon: CalendarClock,
    accent: "from-sky-500/25 to-blue-400/10",
  },
  {
    title: "Real-time call analytics",
    description:
      "See how many calls book, qualify, or need follow-up. Track call patterns by hour, day, and season to staff smarter and forecast revenue.",
    icon: BarChart3,
    accent: "from-cyan-500/25 to-blue-400/10",
  },
  {
    title: "One-click CRM sync",
    description:
      "Call transcripts, lead intent, and booking details auto-sync to HubSpot, Salesforce, or GoHighLevel. Your data flows seamlessly.",
    icon: LineChart,
    accent: "from-blue-500/20 to-indigo-400/10",
  },
  {
    title: "Hindi, English & 26+ languages",
    description:
      "Serve Delhi, Mumbai, Bangalore, and beyond. Language switches mid-call. Callers feel at home. Perfect for multilingual cities.",
    icon: Globe2,
    accent: "from-indigo-500/20 to-cyan-400/10",
  },
  {
    title: "Missed call recovery—automatic",
    description:
      "If your team is busy, instant WhatsApp or voice callback. Turns missed calls into booked revenue. No lead forgotten.",
    icon: MessageSquareMore,
    accent: "from-cyan-500/20 to-emerald-400/10",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "₹0",
    cadence: "14 days free",
    description: "Perfect to test-drive with your actual calls. No credit card. See live results immediately.",
    cta: "Start Free Trial",
    href: "/contact",
    features: [
      "500 AI-answered calls/month",
      "Booking and rescheduling",
      "WhatsApp & email notifications",
      "Basic call analytics",
      "1 user seat",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "₹7,999",
    cadence: "/month",
    description: "For 2-5 staff clinics, salons, gyms. Multi-user dashboard, advanced integrations, priority support.",
    cta: "Start Now",
    href: "/contact",
    featured: true,
    badge: "Best for Growing Teams",
    features: [
      "2,000 AI-answered calls/month",
      "Advanced qualification flows",
      "Google Calendar & CRM sync",
      "WhatsApp business integration",
      "Team performance dashboards",
      "5 user seats",
      "Priority onboarding",
      "Phone + email support",
    ],
  },
  {
    name: "Scale",
    price: "₹24,999",
    cadence: "/month",
    description: "For multi-location chains, franchises, high-volume operations. Custom integrations, dedicated support.",
    cta: "Book Demo",
    href: "/contact",
    features: [
      "8,000+ AI-answered calls/month",
      "Unlimited locations & users",
      "Custom integrations & webhooks",
      "Dedicated account manager",
      "Custom voice & scripts",
      "Advanced compliance & security",
      "SLA-backed support",
      "Monthly strategy reviews",
    ],
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "Used to lose 15-20 calls daily during peak hours. Now every call is answered professionally. Bookings increased by 34% in the first month.",
    name: "Mia Chen",
    role: "Founder",
    company: "Studio Vale",
  },
  {
    quote:
      "Patients think they're talking to a full reception team, even at 11 PM. Call handling cost dropped 60%, appointment no-shows cut by 19%.",
    name: "Dr. Karan Patel",
    role: "Medical Director",
    company: "Aster Clinic Group",
  },
  {
    quote:
      "Lead response time went from 2 hours to instant. Qualified leads tripled. My sales team only gets hot prospects now—no more junk callbacks.",
    name: "Jordan Blake",
    role: "Managing Broker",
    company: "Atlas Realty",
  },
  {
    quote:
      "We're a 7-clinic network spread across Delhi-NCR. Voxora unified our call handling—now all branches sound equally professional. ROI in 60 days.",
    name: "Priya Menon",
    role: "Operations Head",
    company: "Brightline Dental",
  },
  {
    quote:
      "Fitness class bookings jumped 28%. The AI captures intent brilliantly—trial prospects are pre-qualified before our sales team calls them back.",
    name: "Arjun Sharma",
    role: "Owner",
    company: "Pulse House",
  },
  {
    quote:
      "For a home services startup, missing calls was killing us. Revenue per booking improved 22% because leads get instant confirmation. Game-changer.",
    name: "Neha Kapoor",
    role: "Founder",
    company: "UrbanFlow Services",
  },
];

export const faqItems = [
  {
    question: "Does it work in Hindi, Tamil, Telugu, and other Indian languages?",
    answer:
      "Yes. Voxora supports 28+ languages with native speaker voice quality. Your AI receptionist can switch languages mid-call, making it feel like talking to a local team member. Perfect for multilingual cities.",
  },
  {
    question: "Will my customers think they're talking to a bot?",
    answer:
      "No. Customers report it sounds like a real, polished receptionist. The AI uses natural pauses, handles accent variations, and maintains brand tone so callers feel premium service, not automation.",
  },
  {
    question: "Can it integrate with Google Calendar, Calendly, or my custom system?",
    answer:
      "Yes. Voxora syncs directly with Google Calendar, WhatsApp, popular CRMs (HubSpot, Salesforce, GoHighLevel), and any system via webhooks. Your entire stack stays connected.",
  },
  {
    question: "What if a customer asks something unexpected?",
    answer:
      "The AI escalates to your team instantly via WhatsApp or in-app alert. You maintain complete control. Your team jumps in for complex queries; routine questions stay automated.",
  },
  {
    question: "How long does setup take? Can we launch this week?",
    answer:
      "Most clinics, salons, and service teams go live in 3-5 days. We handle call flow mapping, CRM configuration, and testing. You're up and running before the weekend.",
  },
  {
    question: "What about data security and GST compliance?",
    answer:
      "Voxora is GDPR & ISO 27001 compliant, hosted on secure Indian servers, and fully compliant with Indian telecom regulations. Call recordings are encrypted. Your data never leaves India.",
  },
  {
    question: "How much will this reduce my staff's workload?",
    answer:
      "On average, salons see 60% reduction in front-desk call time, clinics save 2-3 hours per day per location, and real estate teams reduce admin by 40%. Your team focuses on closing deals, not managing calls.",
  },
  {
    question: "Can I try it before committing?",
    answer:
      "Yes. Start with a 14-day free trial on the Starter plan. No credit card needed. You'll see live results with your actual call flow within days.",
  },
];

export const industries: Industry[] = [
  {
    title: "Salons and med spas",
    description:
      "Handle bookings, waitlists, package questions, and no-show recovery without tying up your front desk.",
    icon: Sparkles,
    outcomes: ["More premium bookings", "Less front-desk overload", "Higher rebooking rates"],
  },
  {
    title: "Clinics and healthcare",
    description:
      "Triage non-urgent calls, manage appointment requests, and give patients fast, consistent first contact.",
    icon: Stethoscope,
    outcomes: ["Reduced hold times", "Better patient intake", "24/7 call coverage"],
  },
  {
    title: "Gyms and fitness studios",
    description:
      "Convert class inquiries, membership questions, and trial requests into booked visits while staff stays focused on members.",
    icon: Activity,
    outcomes: ["More tours booked", "Improved member experience", "Lead capture outside hours"],
  },
  {
    title: "Real estate",
    description:
      "Qualify buyer and seller leads, answer listing questions, and route hot opportunities to the right agent instantly.",
    icon: Home,
    outcomes: ["Faster lead qualification", "More showings", "Better agent utilization"],
  },
  {
    title: "Service businesses",
    description:
      "Book jobs, collect service details, and recover missed calls for home services, repairs, and local operators.",
    icon: BriefcaseBusiness,
    outcomes: ["More booked jobs", "Less callback backlog", "Cleaner dispatch intake"],
  },
  {
    title: "Multi-location teams",
    description:
      "Standardize call quality across branches with one operating layer, one analytics view, and location-aware scripts.",
    icon: Building2,
    outcomes: ["Consistent CX", "Centralized reporting", "Location-aware routing"],
  },
];

export const featureSpotlights = [
  {
    title: "Capture more revenue from inbound intent",
    description:
      "Whether a caller wants a consult, a class, a property showing, or a service visit, Voxora converts inbound urgency into structured action.",
    points: ["Dynamic qualification scripts", "Escalation for VIP or urgent calls", "Real-time summaries for staff"],
    icon: Waves,
  },
  {
    title: "Automate the operations behind every call",
    description:
      "Your receptionist should not stop at answering. Voxora books, tags, routes, updates records, and triggers follow-up workflows automatically.",
    points: ["Calendar and CRM automations", "Custom webhooks and workflows", "Location-aware call routing"],
    icon: Zap,
  },
  {
    title: "Measure what the front desk cannot see",
    description:
      "See which callers booked, dropped, asked pricing questions, or required human help so you can improve staffing and scripts over time.",
    points: ["Conversion dashboards", "Missed-call recovery metrics", "Conversation-level trend analysis"],
    icon: UsersRound,
  },
];

export const contactHighlights = [
  "Live onboarding strategy session",
  "Custom call flow mapping",
  "CRM + scheduler integration review",
];
