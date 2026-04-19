import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarClock,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Globe2,
  LayoutDashboard,
  MessageSquareMore,
  PhoneCall,
  PlugZap,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TriangleAlert,
  UsersRound,
  Workflow,
} from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
  helper: string;
};

export type SeriesPoint = {
  label: string;
  value: number;
  secondary?: number;
};

export type BreakdownItem = {
  label: string;
  value: number;
  displayValue?: string;
  meta?: string;
};

export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  status: "success" | "warning" | "danger" | "secondary";
};

export type CallRow = {
  id: string;
  caller: string;
  channel: string;
  intent: string;
  duration: string;
  result: string;
  sentiment: string;
};

export type BookingRow = {
  id: string;
  customer: string;
  service: string;
  time: string;
  owner: string;
  status: string;
  value: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  location: string;
  coverage: string;
  status: string;
};

export type InvoiceRow = {
  id: string;
  invoice: string;
  period: string;
  amount: string;
  status: string;
  method: string;
};

export type IntegrationItem = {
  id: string;
  name: string;
  description: string;
  status: string;
  icon: LucideIcon;
  sync: string;
};

export const dashboardNavigation: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/calls", label: "Calls", icon: PhoneCall, badge: "18" },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarClock },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/ai-settings", label: "AI Settings", icon: SlidersHorizontal },
  { href: "/dashboard/team-members", label: "Team Members", icon: UsersRound },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/integrations", label: "Integrations", icon: PlugZap },
];

export const overviewMetrics: DashboardMetric[] = [
  {
    label: "Calls answered",
    value: "12,482",
    delta: "+18.2%",
    helper: "Across all locations this month",
  },
  {
    label: "Bookings created",
    value: "1,246",
    delta: "+21.4%",
    helper: "Booked directly by Voxora AI",
  },
  {
    label: "Revenue saved",
    value: "$84,200",
    delta: "+16.8%",
    helper: "Recovered from after-hours and missed calls",
  },
  {
    label: "Missed calls recovered",
    value: "312",
    delta: "+28.1%",
    helper: "Follow-up flows converted into responses",
  },
  {
    label: "Conversion rate",
    value: "34.8%",
    delta: "+4.2 pts",
    helper: "Call-to-booking or qualified-lead conversion",
  },
];

export const overviewTrend: SeriesPoint[] = [
  { label: "Mon", value: 82, secondary: 44 },
  { label: "Tue", value: 95, secondary: 49 },
  { label: "Wed", value: 88, secondary: 52 },
  { label: "Thu", value: 116, secondary: 61 },
  { label: "Fri", value: 124, secondary: 68 },
  { label: "Sat", value: 133, secondary: 74 },
  { label: "Sun", value: 142, secondary: 79 },
];

export const overviewOutcomeBreakdown: BreakdownItem[] = [
  { label: "Booked", value: 46, displayValue: "46%", meta: "Primary conversion" },
  { label: "Qualified lead", value: 24, displayValue: "24%", meta: "Passed to staff" },
  { label: "Resolved by AI", value: 18, displayValue: "18%", meta: "No escalation needed" },
  { label: "Follow-up needed", value: 12, displayValue: "12%", meta: "SMS or callback queued" },
];

export const overviewActivities: ActivityItem[] = [
  {
    id: "act-1",
    title: "High-intent buyer escalated to Jordan Blake",
    description: "Listing inquiry above $1.2M matched to live agent in 11 seconds.",
    time: "2 min ago",
    status: "success",
  },
  {
    id: "act-2",
    title: "Clinic reschedule handled fully by AI",
    description: "Patient moved appointment from 2:00 PM to 4:30 PM with confirmation SMS sent.",
    time: "9 min ago",
    status: "secondary",
  },
  {
    id: "act-3",
    title: "Missed call recovery flow triggered",
    description: "Service-business prospect replied YES to callback prompt after-hours.",
    time: "14 min ago",
    status: "warning",
  },
];

export const liveCalls: CallRow[] = [
  {
    id: "call-1",
    caller: "Ava Thompson",
    channel: "Voice",
    intent: "Luxury color consultation",
    duration: "04:18",
    result: "Booked",
    sentiment: "Positive",
  },
  {
    id: "call-2",
    caller: "Michael Rivera",
    channel: "Voice",
    intent: "New patient consult",
    duration: "03:07",
    result: "Qualified",
    sentiment: "Neutral",
  },
  {
    id: "call-3",
    caller: "Sofia Patel",
    channel: "SMS recovery",
    intent: "Membership trial",
    duration: "02:11",
    result: "Follow-up",
    sentiment: "Positive",
  },
  {
    id: "call-4",
    caller: "Daniel Brooks",
    channel: "Voice",
    intent: "Emergency plumbing visit",
    duration: "01:52",
    result: "Escalated",
    sentiment: "Urgent",
  },
  {
    id: "call-5",
    caller: "Olivia Chen",
    channel: "Voice",
    intent: "Property showing",
    duration: "05:26",
    result: "Booked",
    sentiment: "Positive",
  },
];

export const bookingsTable: BookingRow[] = [
  {
    id: "booking-1",
    customer: "Mia Foster",
    service: "Hydrafacial consultation",
    time: "Today - 10:30 AM",
    owner: "Studio Vale",
    status: "Confirmed",
    value: "$280",
  },
  {
    id: "booking-2",
    customer: "Noah Williams",
    service: "Orthopedic intake",
    time: "Today - 1:15 PM",
    owner: "Aster Clinic",
    status: "Pending forms",
    value: "$420",
  },
  {
    id: "booking-3",
    customer: "Ella Martin",
    service: "Premium gym trial",
    time: "Today - 4:00 PM",
    owner: "Pulse House",
    status: "Confirmed",
    value: "$0",
  },
  {
    id: "booking-4",
    customer: "James Carter",
    service: "Property tour",
    time: "Tomorrow - 11:00 AM",
    owner: "Atlas Realty",
    status: "Assigned",
    value: "$18k pipeline",
  },
];

export const callsMetrics: DashboardMetric[] = [
  {
    label: "Handled today",
    value: "428",
    delta: "+14%",
    helper: "Inbound conversations completed",
  },
  {
    label: "Avg. response time",
    value: "4.1s",
    delta: "-0.8s",
    helper: "From ring to first response",
  },
  {
    label: "Escalation rate",
    value: "12.4%",
    delta: "-2.1 pts",
    helper: "Only high-complexity calls routed to staff",
  },
  {
    label: "Caller satisfaction",
    value: "94%",
    delta: "+3%",
    helper: "Post-call sentiment model score",
  },
];

export const callsTrend: SeriesPoint[] = [
  { label: "8 AM", value: 18, secondary: 8 },
  { label: "10 AM", value: 34, secondary: 14 },
  { label: "12 PM", value: 41, secondary: 18 },
  { label: "2 PM", value: 52, secondary: 22 },
  { label: "4 PM", value: 45, secondary: 19 },
  { label: "6 PM", value: 30, secondary: 13 },
  { label: "8 PM", value: 22, secondary: 9 },
];

export const callDispositionBreakdown: BreakdownItem[] = [
  { label: "Booked on call", value: 38, displayValue: "162", meta: "38% of handled calls" },
  { label: "Qualified and routed", value: 26, displayValue: "111", meta: "Lead handed to staff" },
  { label: "Resolved automatically", value: 21, displayValue: "90", meta: "Informational or support" },
  { label: "Missed call recovery", value: 15, displayValue: "65", meta: "Recovered after initial miss" },
];

export const bookingsMetrics: DashboardMetric[] = [
  {
    label: "Bookings today",
    value: "68",
    delta: "+19%",
    helper: "Across all connected calendars",
  },
  {
    label: "Reschedules handled",
    value: "14",
    delta: "+7%",
    helper: "No manual staff intervention",
  },
  {
    label: "No-show prevention",
    value: "91%",
    delta: "+5 pts",
    helper: "Reminder confirmations collected",
  },
  {
    label: "Pipeline value",
    value: "$27,400",
    delta: "+23%",
    helper: "Expected value from new bookings",
  },
];

export const bookingSourceBreakdown: BreakdownItem[] = [
  { label: "Phone", value: 54, displayValue: "54%", meta: "Booked during live call" },
  { label: "SMS recovery", value: 21, displayValue: "21%", meta: "Recovered after missed call" },
  { label: "Website callback", value: 15, displayValue: "15%", meta: "Follow-up workflow" },
  { label: "Manual handoff", value: 10, displayValue: "10%", meta: "Agent-assisted close" },
];

export const analyticsMetrics: DashboardMetric[] = [
  {
    label: "Qualified lead rate",
    value: "41.2%",
    delta: "+6.4 pts",
    helper: "High-intent calls identified by AI",
  },
  {
    label: "Recovered revenue",
    value: "$12,800",
    delta: "+17%",
    helper: "Last 7 days only",
  },
  {
    label: "After-hours bookings",
    value: "97",
    delta: "+29%",
    helper: "Revenue that front desk would have missed",
  },
  {
    label: "Human takeover needed",
    value: "8.6%",
    delta: "-1.5 pts",
    helper: "AI confidence improving",
  },
];

export const analyticsTrend: SeriesPoint[] = [
  { label: "Week 1", value: 28, secondary: 18 },
  { label: "Week 2", value: 31, secondary: 20 },
  { label: "Week 3", value: 33, secondary: 22 },
  { label: "Week 4", value: 37, secondary: 25 },
  { label: "Week 5", value: 39, secondary: 27 },
  { label: "Week 6", value: 42, secondary: 29 },
];

export const locationPerformance = [
  {
    id: "loc-1",
    location: "San Francisco Clinic",
    answered: "2,140",
    bookings: "218",
    conversion: "35.8%",
    recovered: "$14,200",
  },
  {
    id: "loc-2",
    location: "Palo Alto Med Spa",
    answered: "1,624",
    bookings: "205",
    conversion: "39.4%",
    recovered: "$18,900",
  },
  {
    id: "loc-3",
    location: "Atlas Realty West",
    answered: "984",
    bookings: "94",
    conversion: "30.2%",
    recovered: "$21,600",
  },
  {
    id: "loc-4",
    location: "Northside Services",
    answered: "1,107",
    bookings: "136",
    conversion: "33.5%",
    recovered: "$10,300",
  },
];

export const aiControls = [
  {
    title: "Voice persona",
    description: "Confident, polished, and calm with a slightly warmer tone for service businesses.",
    icon: Sparkles,
    status: "Active",
  },
  {
    title: "Escalation logic",
    description: "Urgent intents, VIP callers, and low-confidence responses route to humans within 20 seconds.",
    icon: TriangleAlert,
    status: "Optimized",
  },
  {
    title: "Multilingual routing",
    description: "English, Spanish, Hindi, and Arabic available with automatic language detection.",
    icon: Globe2,
    status: "Enabled",
  },
];

export const aiSettingsMetrics: DashboardMetric[] = [
  {
    label: "Voice confidence",
    value: "96.2%",
    delta: "+1.8 pts",
    helper: "Average confidence across handled conversations",
  },
  {
    label: "Auto-resolution rate",
    value: "58%",
    delta: "+6%",
    helper: "Calls solved without human intervention",
  },
  {
    label: "Escalation precision",
    value: "91%",
    delta: "+3%",
    helper: "Human handoffs matched to genuine complexity",
  },
  {
    label: "Languages active",
    value: "4",
    delta: "Live",
    helper: "English, Spanish, Hindi, and Arabic",
  },
];

export const automationRules = [
  {
    label: "Auto-book when confidence is above 92%",
    value: 92,
    displayValue: "92%",
    meta: "Current threshold",
  },
  {
    label: "Escalate pricing objections instantly",
    value: 100,
    displayValue: "Live",
    meta: "Rule enabled",
  },
  {
    label: "Send missed-call SMS within 45 seconds",
    value: 45,
    displayValue: "45s",
    meta: "Current delay",
  },
];

export const teamMetrics: DashboardMetric[] = [
  {
    label: "Active members",
    value: "24",
    delta: "+3",
    helper: "Across all business units",
  },
  {
    label: "Avg. response assist",
    value: "1m 12s",
    delta: "-14s",
    helper: "When human takeover is requested",
  },
  {
    label: "Coverage hours",
    value: "168h",
    delta: "24/7",
    helper: "AI plus live staff coverage map",
  },
  {
    label: "Admin seats utilized",
    value: "83%",
    delta: "+6%",
    helper: "Of available workspace seats",
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: "member-1",
    name: "Samantha Reyes",
    role: "Operations Admin",
    location: "San Francisco",
    coverage: "Mon-Fri 9 AM - 6 PM",
    status: "Online",
  },
  {
    id: "member-2",
    name: "Jordan Blake",
    role: "Sales Lead",
    location: "Atlas Realty",
    coverage: "Escalations only",
    status: "Available",
  },
  {
    id: "member-3",
    name: "Mina Kapoor",
    role: "Clinic Manager",
    location: "Aster Clinic",
    coverage: "Mon-Sat 8 AM - 5 PM",
    status: "Busy",
  },
  {
    id: "member-4",
    name: "Luis Fernandez",
    role: "Support Admin",
    location: "Northside Services",
    coverage: "After-hours backup",
    status: "Offline",
  },
];

export const billingMetrics: DashboardMetric[] = [
  {
    label: "Current plan",
    value: "Growth",
    delta: "6 locations",
    helper: "Premium voice, CRM sync, analytics",
  },
  {
    label: "This month usage",
    value: "8,420 min",
    delta: "84%",
    helper: "Of included AI voice minutes",
  },
  {
    label: "Estimated invoice",
    value: "$2,480",
    delta: "+$190",
    helper: "Projected before cycle closes",
  },
  {
    label: "Recovered revenue / spend",
    value: "34x",
    delta: "+5x",
    helper: "Operational ROI on current plan",
  },
];

export const invoices: InvoiceRow[] = [
  {
    id: "invoice-1",
    invoice: "INV-3021",
    period: "Apr 1 - Apr 30",
    amount: "$2,480",
    status: "Upcoming",
    method: "Visa ending 4242",
  },
  {
    id: "invoice-2",
    invoice: "INV-2988",
    period: "Mar 1 - Mar 31",
    amount: "$2,290",
    status: "Paid",
    method: "Visa ending 4242",
  },
  {
    id: "invoice-3",
    invoice: "INV-2944",
    period: "Feb 1 - Feb 29",
    amount: "$2,105",
    status: "Paid",
    method: "Visa ending 4242",
  },
];

export const integrationMetrics: DashboardMetric[] = [
  {
    label: "Connected apps",
    value: "11",
    delta: "+2",
    helper: "CRM, calendars, SMS, and reporting",
  },
  {
    label: "Successful syncs",
    value: "99.4%",
    delta: "+0.6 pts",
    helper: "Over the last 30 days",
  },
  {
    label: "Webhook latency",
    value: "320ms",
    delta: "-44ms",
    helper: "Median action delivery speed",
  },
  {
    label: "Failed events",
    value: "3",
    delta: "-7",
    helper: "Auto-retried and resolved",
  },
];

export const integrations: IntegrationItem[] = [
  {
    id: "int-1",
    name: "HubSpot",
    description: "Lead sync, lifecycle stage updates, and conversation notes.",
    status: "Connected",
    icon: Workflow,
    sync: "Synced 2 min ago",
  },
  {
    id: "int-2",
    name: "Google Calendar",
    description: "Availability lookup, appointment creation, and reminders.",
    status: "Connected",
    icon: CalendarClock,
    sync: "Synced just now",
  },
  {
    id: "int-3",
    name: "Stripe",
    description: "Plan billing, invoice history, and usage-based overages.",
    status: "Connected",
    icon: CircleDollarSign,
    sync: "Synced 11 min ago",
  },
  {
    id: "int-4",
    name: "Twilio",
    description: "Voice routing, SMS recovery, and outbound callback orchestration.",
    status: "Healthy",
    icon: PhoneCall,
    sync: "Synced 1 min ago",
  },
];

export const integrationSyncFeed: ActivityItem[] = [
  {
    id: "sync-1",
    title: "HubSpot contact updated",
    description: "Lead owner and booking timestamp written after qualified call.",
    time: "4 min ago",
    status: "success",
  },
  {
    id: "sync-2",
    title: "Google Calendar slot reserved",
    description: "Aesthetic consult booked for Thursday 3:30 PM with reminder attached.",
    time: "8 min ago",
    status: "secondary",
  },
  {
    id: "sync-3",
    title: "Webhook retried successfully",
    description: "Northside Services dispatch payload delivered after first timeout.",
    time: "23 min ago",
    status: "warning",
  },
];

export const sidebarStatusCards = [
  {
    icon: ShieldCheck,
    label: "AI runtime",
    value: "Healthy",
    helper: "No incidents in the last 7 days",
  },
  {
    icon: Clock3,
    label: "Average pickup",
    value: "4.1 seconds",
    helper: "Across all business hours",
  },
  {
    icon: MessageSquareMore,
    label: "Recovery automation",
    value: "Live",
    helper: "SMS + callback workflows enabled",
  },
];
