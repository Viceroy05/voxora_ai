"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/shared/fade-in";
import { Phone, CheckCircle, Calendar, AlertCircle, Loader2, Mic, Brain, Sparkles, Clock, User, PhoneCall, MessageSquare, TrendingUp, Play, RefreshCw, BookOpen, HelpCircle, XCircle, CalendarClock, ArrowRight } from "lucide-react";
import { useCurrentBusiness } from "@/components/dashboard/useCurrentBusiness";

type SimulationStep = {
  step: number;
  name: string;
  status: "pending" | "running" | "completed" | "skipped";
  duration?: number;
};

type CallResult = {
  callLog: unknown;
  booking: unknown;
  bookingCreated: boolean;
  aiJob: unknown;
  scenario: {
    customerName: string;
    customerPhone: string;
    serviceName: string;
    disposition: string;
  };
  steps: SimulationStep[];
};

type CallType = "booking" | "inquiry" | "complaint" | "cancellation" | "reschedule" | "followup";

interface CallScenario {
  id: string;
  type: CallType;
  name: string;
  description: string;
  serviceName: string;
  transcript: string;
  disposition: "BOOKED" | "QUALIFIED" | "FOLLOW_UP" | "ESCALATE" | "INFO_ONLY";
  summary: string;
  sentiment: "positive" | "neutral" | "negative" | "urgent";
  callerIntent: string;
  nextAction: string;
  bookingLikely: boolean;
  durationSeconds: number;
}

const INDIAN_NAMES = [
  "Priya Sharma", "Rahul Verma", "Anita Patel", "Vikram Singh", "Meera Krishnan",
  "Arjun Kapoor", "Sneha Reddy", "Karthik Iyer", "Pooja Nair", "Rajesh Kumar",
  "Divya Menon", "Amit Sharma", "Neha Gupta", "Suresh Babu", "Lakshmi Devi",
  "Deepak Joshi", "Kavita Rao", "Manish Tiwari", "Ritu Agarwal", "Sanjay Mehta"
];

const INDIAN_PHONE_PREFIXES = ["98765", "98766", "98767", "98768", "98769", "98770", "98771"];

const CALL_SCENARIOS: CallScenario[] = [
  // BOOKING SCENARIOS
  {
    id: "booking-haircut",
    type: "booking",
    name: "New Haircut Appointment",
    description: "Customer wants to book a haircut for tomorrow morning",
    serviceName: "Haircut & Styling",
    transcript: `Customer: Hi, I'd like to book an appointment for tomorrow morning.
Agent: Good morning! I'd be happy to help you schedule an appointment. What service are you looking for?
Customer: I need a haircut and styling.
Agent: Perfect. We have slots available at 10 AM and 11:30 AM tomorrow. Which would you prefer?
Customer: 10 AM works great for me.
Agent: Excellent! I've booked you for 10 AM tomorrow for a haircut and styling. Is there anything else you'd like to add?
Customer: No, that's all. Thank you!
Agent: You're welcome! We'll see you tomorrow at 10 AM. Have a great day!`,
    disposition: "BOOKED",
    summary: "Customer called to book a haircut and styling appointment for tomorrow morning at 10 AM.",
    sentiment: "positive",
    callerIntent: "book_appointment",
    nextAction: "confirm_booking",
    bookingLikely: true,
    durationSeconds: 180
  },
  {
    id: "booking-spa",
    type: "booking",
    name: "Spa Treatment Booking",
    description: "Customer inquires about spa treatments and books a massage",
    serviceName: "Spa Treatment",
    transcript: `Customer: Hello, I'm interested in your spa treatments.
Agent: Hello! We offer various spa treatments including massages, facials, and body treatments. What are you looking for?
Customer: I'd like to know about your massage packages and prices.
Agent: We have several packages ranging from ₹2000 to ₹5000. Our most popular is the full body massage for ₹3500.
Customer: That sounds good. Can I book for this weekend?
Agent: Certainly! We have Saturday afternoon at 2 PM or Sunday morning at 11 AM available.
Customer: Let me go with Saturday at 2 PM.
Agent: Perfect! I've scheduled your full body massage for Saturday at 2 PM. Please arrive 10 minutes early.
Customer: Will do. Thank you!
Agent: You're welcome! Looking forward to seeing you on Saturday.`,
    disposition: "BOOKED",
    summary: "Customer inquired about spa treatments and booked a full body massage for Saturday at 2 PM.",
    sentiment: "positive",
    callerIntent: "inquire_service",
    nextAction: "send_confirmation",
    bookingLikely: true,
    durationSeconds: 240
  },
  {
    id: "booking-facial",
    type: "booking",
    name: "Facial Treatment",
    description: "Customer books a hydrating facial for the weekend",
    serviceName: "Facial Treatment",
    transcript: `Customer: Hi, I'd like to book a facial treatment.
Agent: Hello! We offer different types of facials including hydrating, anti-aging, and deep cleansing. Which one interests you?
Customer: I think the hydrating facial would be perfect for my skin.
Agent: Excellent choice! The hydrating facial is 60 minutes and costs ₹2500. When would you like to come in?
Customer: Do you have any slots this weekend?
Agent: Yes, we have Saturday at 10 AM or Sunday at 2 PM.
Customer: Sunday at 2 PM works best.
Agent: Perfect! I've scheduled your hydrating facial for Sunday at 2 PM. Any skin concerns I should note?
Customer: Just some dryness, especially on my cheeks.
Agent: Noted! Our esthetician will focus on that area. See you Sunday!`,
    disposition: "BOOKED",
    summary: "Customer booked a hydrating facial treatment for Sunday at 2 PM with dry skin concerns.",
    sentiment: "positive",
    callerIntent: "book_appointment",
    nextAction: "send_reminder",
    bookingLikely: true,
    durationSeconds: 150
  },
  {
    id: "booking-hair-color",
    type: "booking",
    name: "Hair Color Treatment",
    description: "Customer inquires about hair coloring and books balayage",
    serviceName: "Hair Color Treatment",
    transcript: `Customer: Hi, I'm interested in getting my hair colored. What options do you have?
Agent: Hello! We offer various hair coloring services including highlights, full color, and balayage. What are you looking for?
Customer: I'm thinking about trying balayage. How much would it cost?
Agent: Our balayage starts from ₹4000 depending on hair length. Would you like to schedule an appointment?
Customer: Yes, that sounds good. When do you have availability?
Agent: We have openings this Friday at 11 AM or 3 PM. Which works better for you?
Customer: 3 PM would be perfect.
Agent: Great! I've booked your balayage appointment for Friday at 3 PM. Please bring any reference photos you have.
Customer: Will do. Thanks!
Agent: You're welcome! We'll see you Friday.`,
    disposition: "BOOKED",
    summary: "Customer inquired about hair coloring and scheduled a balayage treatment for Friday at 3 PM.",
    sentiment: "positive",
    callerIntent: "inquire_service",
    nextAction: "confirm_appointment",
    bookingLikely: true,
    durationSeconds: 210
  },
  {
    id: "booking-bridal",
    type: "booking",
    name: "Bridal Package Consultation",
    description: "Bride-to-be schedules a consultation for bridal package",
    serviceName: "Bridal Package",
    transcript: `Customer: Hi, I'm getting married next month and need information about your bridal packages.
Agent: Congratulations! We have comprehensive bridal packages starting from ₹50,000. Would you like to schedule a consultation?
Customer: Yes, I'd like to discuss the options.
Agent: Great! Our bridal specialist is available this Thursday at 3 PM or Friday at 11 AM. When would work for you?
Customer: Thursday at 3 PM works best.
Agent: Excellent! I've booked your bridal consultation for Thursday at 3 PM. Our specialist will walk you through all our packages.
Customer: Perfect. Should I bring anything?
Agent: Yes, please bring any inspiration photos and your wedding date details. See you Thursday!
Customer: Thank you, I will!
Agent: You're welcome! Looking forward to helping with your special day!`,
    disposition: "BOOKED",
    summary: "Bride-to-be scheduled a consultation for bridal package discussion on Thursday at 3 PM.",
    sentiment: "positive",
    callerIntent: "inquire_bridal",
    nextAction: "prepare_consultation",
    bookingLikely: true,
    durationSeconds: 300
  },

  // INQUIRY SCENARIOS
  {
    id: "inquiry-prices",
    type: "inquiry",
    name: "Price Inquiry",
    description: "Customer asks about service prices and packages",
    serviceName: "General Inquiry",
    transcript: `Customer: Hi, I was wondering about your pricing for different services.
Agent: Hello! I'd be happy to help. Which services are you interested in?
Customer: Mainly haircuts and coloring.
Agent: Our haircuts start from ₹500 for basic cuts and go up to ₹1500 for styling. Coloring ranges from ₹2000 to ₹6000 depending on the service.
Customer: That's helpful. Do you have any package deals?
Agent: Yes! We have a monthly maintenance package for ₹3000 that includes one haircut and one treatment. Would you like more details?
Customer: Yes, please.
Agent: The package includes one haircut, one facial or manicure, and 10% off all additional services. It's valid for 30 days.
Customer: That sounds good. I might come in this weekend.
Agent: Perfect! We're open Saturday 9 AM to 7 PM and Sunday 10 AM to 6 PM. Would you like to book an appointment?
Customer: Not right now, I'll call back.
Agent: No problem! Feel free to call anytime. Have a great day!`,
    disposition: "QUALIFIED",
    summary: "Customer inquired about pricing and showed interest in monthly maintenance package. Potential future booking.",
    sentiment: "neutral",
    callerIntent: "inquire_pricing",
    nextAction: "follow_up",
    bookingLikely: false,
    durationSeconds: 180
  },
  {
    id: "inquiry-hours",
    type: "inquiry",
    name: "Business Hours Inquiry",
    description: "Customer asks about operating hours and availability",
    serviceName: "General Inquiry",
    transcript: `Customer: Hi, what are your business hours?
Agent: Hello! We're open Monday through Friday from 9 AM to 8 PM, Saturday 9 AM to 7 PM, and Sunday 10 AM to 6 PM.
Customer: Do you take walk-ins or do I need an appointment?
Agent: We accept walk-ins, but appointments are recommended to ensure availability. Would you like to schedule one?
Customer: Maybe later. Are you open on holidays?
Agent: We're closed on major holidays like Diwali, Christmas, and New Year's Day. We're open with reduced hours on other holidays.
Customer: Good to know. Thanks for the information.
Agent: You're welcome! Is there anything else I can help you with?
Customer: No, that's all. Thank you!
Agent: Have a wonderful day! Feel free to call us anytime.`,
    disposition: "INFO_ONLY",
    summary: "Customer inquired about business hours, walk-in policy, and holiday schedule.",
    sentiment: "neutral",
    callerIntent: "inquire_hours",
    nextAction: "none",
    bookingLikely: false,
    durationSeconds: 120
  },
  {
    id: "inquiry-services",
    type: "inquiry",
    name: "Services Inquiry",
    description: "Customer wants to know about available services",
    serviceName: "General Inquiry",
    transcript: `Customer: Hi, I'm new to the area and looking for a good salon. What services do you offer?
Agent: Welcome to the neighborhood! We offer a full range of services including haircuts, styling, coloring, spa treatments, facials, manicures, pedicures, and bridal packages.
Customer: That's great! Do you have any special offers for new customers?
Agent: Yes! We have a new customer package that includes a haircut, facial, and manicure for just ₹2999. It's a great way to try our services.
Customer: That sounds interesting. How long would it take?
Agent: The complete package takes about 2.5 to 3 hours. We recommend setting aside a full afternoon for the full experience.
Customer: Perfect! I'd like to book it for this Saturday.
Agent: Excellent! We have Saturday afternoon at 2 PM available. Would that work for you?
Customer: Yes, that's perfect!
Agent: Great! I've booked your new customer package for Saturday at 2 PM. See you then!`,
    disposition: "BOOKED",
    summary: "New customer inquired about services and booked the new customer package for Saturday at 2 PM.",
    sentiment: "positive",
    callerIntent: "inquire_services",
    nextAction: "confirm_booking",
    bookingLikely: true,
    durationSeconds: 200
  },

  // COMPLAINT SCENARIOS
  {
    id: "complaint-service",
    type: "complaint",
    name: "Service Complaint",
    description: "Customer is unhappy with previous service",
    serviceName: "Customer Service",
    transcript: `Customer: Hi, I'm calling about my visit last week. I'm not happy with the haircut I received.
Agent: I'm sorry to hear that. Could you tell me more about what happened?
Customer: The stylist didn't listen to what I wanted. I asked for a trim and they cut off way too much.
Agent: I sincerely apologize for that. We take customer satisfaction very seriously. I'd like to make this right for you.
Customer: What can you do?
Agent: I can offer you a complimentary corrective cut with our senior stylist, or a full refund if you prefer.
Customer: I think I'd like to try the corrective cut with the senior stylist.
Agent: Perfect. Let me schedule that for you. Our senior stylist is available tomorrow at 11 AM or Thursday at 3 PM.
Customer: Tomorrow at 11 AM works.
Agent: Excellent. I've booked your complimentary corrective cut for tomorrow at 11 AM with our senior stylist. Is there anything else I can do?
Customer: No, that's helpful. Thank you.
Agent: You're welcome, and again, I apologize for the inconvenience. We'll make sure you're taken care of tomorrow.`,
    disposition: "ESCALATE",
    summary: "Customer complained about previous haircut. Complimentary corrective cut scheduled with senior stylist.",
    sentiment: "negative",
    callerIntent: "file_complaint",
    nextAction: "escalate_manager",
    bookingLikely: false,
    durationSeconds: 240
  },

  // CANCELLATION SCENARIOS
  {
    id: "cancellation-appointment",
    type: "cancellation",
    name: "Appointment Cancellation",
    description: "Customer needs to cancel their appointment",
    serviceName: "Customer Service",
    transcript: `Customer: Hi, I need to cancel my appointment for tomorrow at 2 PM.
Agent: I can help you with that. May I have your name and phone number to locate your appointment?
Customer: It's Priya Sharma, phone number +91 98765 43210.
Agent: Thank you, Priya. I found your appointment for a facial treatment tomorrow at 2 PM. May I ask the reason for cancellation?
Customer: Something came up at work and I can't make it.
Agent: I understand. Would you like to reschedule instead?
Customer: Yes, actually. Do you have any availability next week?
Agent: Let me check. We have Monday at 10 AM, Wednesday at 3 PM, or Friday at 11 AM.
Customer: Wednesday at 3 PM would work.
Agent: Perfect! I've rescheduled your facial treatment for Wednesday at 3 PM. Is there anything else I can help you with?
Customer: No, that's all. Thank you!
Agent: You're welcome! We'll see you Wednesday at 3 PM.`,
    disposition: "FOLLOW_UP",
    summary: "Customer cancelled appointment for tomorrow and rescheduled for Wednesday at 3 PM.",
    sentiment: "neutral",
    callerIntent: "cancel_appointment",
    nextAction: "confirm_reschedule",
    bookingLikely: false,
    durationSeconds: 150
  },

  // RESCHEDULE SCENARIOS
  {
    id: "reschedule-appointment",
    type: "reschedule",
    name: "Appointment Reschedule",
    description: "Customer wants to change their appointment time",
    serviceName: "Customer Service",
    transcript: `Customer: Hi, I have an appointment for this Friday at 10 AM, but I need to change it.
Agent: I can help you reschedule. May I have your name and phone number?
Customer: Rahul Verma, +91 98765 43211.
Agent: Thank you, Rahul. I found your appointment for a haircut and styling this Friday at 10 AM. What time would work better for you?
Customer: Do you have any slots in the afternoon?
Agent: Let me check. We have Friday at 2 PM or 4 PM available.
Customer: 2 PM would be perfect.
Agent: Excellent! I've moved your appointment to Friday at 2 PM. Is there anything else you need?
Customer: No, that's it. Thanks!
Agent: You're welcome! We'll see you Friday at 2 PM.`,
    disposition: "FOLLOW_UP",
    summary: "Customer rescheduled appointment from Friday 10 AM to Friday 2 PM.",
    sentiment: "neutral",
    callerIntent: "reschedule_appointment",
    nextAction: "update_calendar",
    bookingLikely: false,
    durationSeconds: 120
  },

  // FOLLOW-UP SCENARIOS
  {
    id: "followup-previous",
    type: "followup",
    name: "Previous Service Follow-up",
    description: "Customer calls after a previous service",
    serviceName: "Customer Service",
    transcript: `Customer: Hi, I was in last week for a hair color treatment and I have some questions.
Agent: Hello! I'd be happy to help. What questions do you have?
Customer: The stylist mentioned using a specific shampoo for color-treated hair. Could you remind me which one?
Agent: Of course! We recommend our Color Protect Shampoo and Conditioner set. It's specifically formulated to maintain color vibrancy.
Customer: Great! Do you sell it at the salon?
Agent: Yes, we carry it in stock. It's ₹1200 for the set. Would you like me to set one aside for you?
Customer: Yes, please. When can I pick it up?
Agent: We're open until 8 PM today if that works for you.
Customer: Perfect, I'll come by around 6 PM.
Agent: Excellent! I'll have the Color Protect set ready for you at the front desk. Is there anything else?
Customer: No, that's all. Thank you!
Agent: You're welcome! See you at 6 PM.`,
    disposition: "QUALIFIED",
    summary: "Customer followed up on previous hair color treatment. Product purchase scheduled for pickup.",
    sentiment: "positive",
    callerIntent: "follow_up_service",
    nextAction: "prepare_product",
    bookingLikely: false,
    durationSeconds: 150
  }
];

export default function CallSimulatorPage() {
  const { businessId, loading: businessLoading, error: businessError } = useCurrentBusiness();
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CallResult | null>(null);
  const [steps, setSteps] = useState<SimulationStep[]>([
    { step: 1, name: "Incoming Call", status: "pending" },
    { step: 2, name: "Call Answered", status: "pending" },
    { step: 3, name: "Transcript Generated", status: "pending" },
    { step: 4, name: "AI Analysis", status: "pending" },
    { step: 5, name: "Booking Created", status: "pending" },
  ]);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [selectedCallType, setSelectedCallType] = useState<CallType | null>(null);

  const generateRandomData = () => {
    const name = INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)];
    const phonePrefix = INDIAN_PHONE_PREFIXES[Math.floor(Math.random() * INDIAN_PHONE_PREFIXES.length)];
    const phoneSuffix = Math.floor(10000 + Math.random() * 90000);
    const phone = `+91 ${phonePrefix} ${phoneSuffix}`;

    // Use selected scenario or pick random from filtered scenarios
    let scenario: CallScenario;
    if (selectedScenarioId) {
      scenario = CALL_SCENARIOS.find(s => s.id === selectedScenarioId) || CALL_SCENARIOS[0];
    } else if (selectedCallType) {
      const filteredScenarios = CALL_SCENARIOS.filter(s => s.type === selectedCallType);
      scenario = filteredScenarios[Math.floor(Math.random() * filteredScenarios.length)];
    } else {
      scenario = CALL_SCENARIOS[Math.floor(Math.random() * CALL_SCENARIOS.length)];
    }

    return {
      customerName: name,
      customerPhone: phone,
      serviceName: scenario.serviceName,
      transcript: scenario.transcript,
      disposition: scenario.disposition,
      summary: scenario.summary,
      aiAnalysis: {
        summary: scenario.summary,
        disposition: scenario.disposition,
        sentiment: scenario.sentiment,
        callerIntent: scenario.callerIntent,
        nextAction: scenario.nextAction,
        bookingLikely: scenario.bookingLikely,
        extractedContact: {
          name,
          phone,
          email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
        },
        structuredNotes: [
          `Call type: ${scenario.type}`,
          `Service: ${scenario.serviceName}`,
          `Intent: ${scenario.callerIntent}`,
          `Disposition: ${scenario.disposition}`,
          scenario.bookingLikely ? "High booking probability" : "Low booking probability",
        ],
      },
    };
  };

  const simulateCall = async () => {
    if (!businessId) return;

    setIsSimulating(true);
    setError(null);
    setResult(null);
    setShowSuccessAnimation(false);
    setSteps(steps.map(s => ({ ...s, status: "pending" as const })));

    try {
      // Step 1: Incoming Call
      setSteps(prev => prev.map(s => s.step === 1 ? { ...s, status: "running" } : s));
      await new Promise(resolve => setTimeout(resolve, 800));
      setSteps(prev => prev.map(s => s.step === 1 ? { ...s, status: "completed", duration: 0.8 } : s));

      // Step 2: Call Answered
      setSteps(prev => prev.map(s => s.step === 2 ? { ...s, status: "running" } : s));
      await new Promise(resolve => setTimeout(resolve, 600));
      setSteps(prev => prev.map(s => s.step === 2 ? { ...s, status: "completed", duration: 0.6 } : s));

      // Step 3: Transcript Generated
      setSteps(prev => prev.map(s => s.step === 3 ? { ...s, status: "running" } : s));
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSteps(prev => prev.map(s => s.step === 3 ? { ...s, status: "completed", duration: 1.0 } : s));

      // Step 4: AI Analysis
      setSteps(prev => prev.map(s => s.step === 4 ? { ...s, status: "running" } : s));
      await new Promise(resolve => setTimeout(resolve, 1200));
      setSteps(prev => prev.map(s => s.step === 4 ? { ...s, status: "completed", duration: 1.2 } : s));

      // Step 5: Booking Created
      setSteps(prev => prev.map(s => s.step === 5 ? { ...s, status: "running" } : s));

      // Call the API
      const response = await fetch("/api/demo/simulate-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to simulate call");
      }

      const data = await response.json();

      setSteps(prev => prev.map(s => s.step === 5 ? { ...s, status: data.bookingCreated ? "completed" : "skipped", duration: 0.5 } : s));

      setResult(data);
      setIsSimulating(false);
      setShowSuccessAnimation(true);

      // Hide success animation after 3 seconds
      setTimeout(() => setShowSuccessAnimation(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSimulating(false);
      setSteps(steps.map(s => ({ ...s, status: "pending" as const })));
    }
  };

  const reset = () => {
    setIsSimulating(false);
    setError(null);
    setResult(null);
    setShowSuccessAnimation(false);
    setSteps(steps.map(s => ({ ...s, status: "pending" as const })));
  };

  const getStepIcon = (step: SimulationStep) => {
    switch (step.status) {
      case "running":
        return <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "skipped":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-600" />;
    }
  };

  const getStepColor = (step: SimulationStep) => {
    switch (step.status) {
      case "running":
        return "text-cyan-400";
      case "completed":
        return "text-green-400";
      case "skipped":
        return "text-yellow-400";
      default:
        return "text-gray-500";
    }
  };

  if (businessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (businessError) {
    return (
      <div className="rounded-[2rem] border border-rose-500/20 bg-rose-500/5 p-8 text-white">
        <p className="font-semibold">Unable to load business</p>
        <p className="mt-2 text-sm text-muted-foreground">{businessError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center space-y-4 animate-bounce-in">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Call Simulated Successfully!</h3>
              <p className="text-lg text-muted-foreground">
                {result?.scenario?.customerName} booked {result?.scenario?.serviceName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Call Simulator</h1>
          <p className="mt-2 text-muted-foreground">
            Simulate realistic incoming calls with AI analysis and automatic booking
          </p>
        </div>
        <Button
          onClick={simulateCall}
          disabled={isSimulating}
          size="lg"
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        >
          {isSimulating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Simulating...
            </>
          ) : (
            <>
              <Phone className="w-4 h-4 mr-2" />
              Simulate Incoming Call
            </>
          )}
        </Button>
      </div>

      {/* Scenario Selection */}
      <FadeIn>
        <Card className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/60 to-slate-900/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-cyan-400" />
              Select Call Scenario
            </CardTitle>
            <CardDescription>
              Choose a specific call type or scenario to simulate, or leave unselected for random
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Call Type Filters */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Call Types
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCallType === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedCallType(null);
                      setSelectedScenarioId(null);
                    }}
                    className={selectedCallType === null ? "bg-cyan-500 hover:bg-cyan-600" : ""}
                  >
                    All Types
                  </Button>
                  <Button
                    variant={selectedCallType === "booking" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedCallType("booking");
                      setSelectedScenarioId(null);
                    }}
                    className={selectedCallType === "booking" ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Bookings
                  </Button>
                  <Button
                    variant={selectedCallType === "inquiry" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedCallType("inquiry");
                      setSelectedScenarioId(null);
                    }}
                    className={selectedCallType === "inquiry" ? "bg-blue-500 hover:bg-blue-600" : ""}
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Inquiries
                  </Button>
                  <Button
                    variant={selectedCallType === "complaint" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedCallType("complaint");
                      setSelectedScenarioId(null);
                    }}
                    className={selectedCallType === "complaint" ? "bg-red-500 hover:bg-red-600" : ""}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Complaints
                  </Button>
                  <Button
                    variant={selectedCallType === "cancellation" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedCallType("cancellation");
                      setSelectedScenarioId(null);
                    }}
                    className={selectedCallType === "cancellation" ? "bg-orange-500 hover:bg-orange-600" : ""}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancellations
                  </Button>
                  <Button
                    variant={selectedCallType === "reschedule" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedCallType("reschedule");
                      setSelectedScenarioId(null);
                    }}
                    className={selectedCallType === "reschedule" ? "bg-purple-500 hover:bg-purple-600" : ""}
                  >
                    <CalendarClock className="w-4 h-4 mr-2" />
                    Reschedules
                  </Button>
                  <Button
                    variant={selectedCallType === "followup" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedCallType("followup");
                      setSelectedScenarioId(null);
                    }}
                    className={selectedCallType === "followup" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Follow-ups
                  </Button>
                </div>
              </div>

              {/* Specific Scenarios */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Specific Scenarios
                </h4>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {CALL_SCENARIOS.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => {
                        setSelectedScenarioId(scenario.id);
                        setSelectedCallType(scenario.type);
                      }}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        selectedScenarioId === scenario.id
                          ? "bg-cyan-500/10 border-cyan-500/50"
                          : "bg-slate-800/30 border-white/5 hover:bg-slate-800/50 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-white text-sm">{scenario.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {scenario.description}
                          </p>
                        </div>
                        {selectedScenarioId === scenario.id && (
                          <CheckCircle className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          scenario.disposition === "BOOKED" ? "bg-green-500/20 text-green-400" :
                          scenario.disposition === "QUALIFIED" ? "bg-blue-500/20 text-blue-400" :
                          scenario.disposition === "FOLLOW_UP" ? "bg-yellow-500/20 text-yellow-400" :
                          scenario.disposition === "ESCALATE" ? "bg-red-500/20 text-red-400" :
                          "bg-gray-500/20 text-gray-400"
                        }`}>
                          {scenario.disposition}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          scenario.sentiment === "positive" ? "bg-green-500/20 text-green-400" :
                          scenario.sentiment === "negative" ? "bg-red-500/20 text-red-400" :
                          scenario.sentiment === "urgent" ? "bg-orange-500/20 text-orange-400" :
                          "bg-gray-500/20 text-gray-400"
                        }`}>
                          {scenario.sentiment}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {scenario.durationSeconds}s
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Simulation Steps */}
        <FadeIn>
          <Card className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/60 to-slate-900/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-cyan-400" />
                Call Flow
              </CardTitle>
              <CardDescription>
                Real-time progress of the simulated call
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Simulation failed</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                  </div>
                  <Button onClick={reset} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {steps.map((step) => (
                    <div
                      key={step.step}
                      className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                        step.status === "running"
                          ? "bg-cyan-500/10 border border-cyan-500/20"
                          : step.status === "completed"
                          ? "bg-green-500/10 border border-green-500/20"
                          : "bg-slate-800/30 border border-white/5"
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {getStepIcon(step)}
                      </div>
                      <div className="flex-grow">
                        <p className={`font-medium ${getStepColor(step)}`}>
                          {step.name}
                        </p>
                        {step.status === "running" && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Processing...
                          </p>
                        )}
                      </div>
                      {step.duration && (
                        <div className="text-sm text-muted-foreground">
                          {step.duration.toFixed(1)}s
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        {/* Call Details */}
        <FadeIn delay={0.1}>
          <Card className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/60 to-slate-900/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                Call Details
              </CardTitle>
              <CardDescription>
                Information about the simulated call
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  {/* Customer Info */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Customer</h4>
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                        <User className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium text-white">{result.scenario.customerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                        <Phone className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium text-white">{result.scenario.customerPhone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Info */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Service</h4>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-sm text-muted-foreground">Booked Service</p>
                        <p className="font-medium text-white">{result.scenario.serviceName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Call Outcome */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Outcome</h4>
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${
                      result.scenario.disposition === "BOOKED" 
                        ? "bg-green-500/10 border border-green-500/20" 
                        : "bg-yellow-500/10 border border-yellow-500/20"
                    }`}>
                      <CheckCircle className={`w-5 h-5 ${
                        result.scenario.disposition === "BOOKED" 
                          ? "text-green-500" 
                          : "text-yellow-500"
                      }`} />
                      <div>
                        <p className="text-sm text-muted-foreground">Disposition</p>
                        <p className="font-medium text-white">{result.scenario.disposition}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <Phone className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">No call simulated yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click the button above to simulate an incoming call
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        {/* Transcript */}
        <FadeIn delay={0.2}>
          <Card className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/60 to-slate-900/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                Call Transcript
              </CardTitle>
              <CardDescription>
                Full conversation transcript with AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result?.callLog?.transcriptText ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-800/30 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Mic className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-medium text-muted-foreground">Transcript</span>
                    </div>
                    <pre className="text-sm text-white whitespace-pre-wrap font-mono">
                      {result.callLog.transcriptText}
                    </pre>
                  </div>

                  {result.callLog.aiAnalysis && (
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-purple-400">AI Analysis</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Summary</p>
                          <p className="text-sm text-white">{result.callLog.aiAnalysis.summary}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Intent</p>
                          <p className="text-sm text-white">{result.callLog.aiAnalysis.callerIntent}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Sentiment</p>
                          <p className="text-sm text-white capitalize">{result.callLog.aiAnalysis.sentiment}</p>
                        </div>
                        {result.callLog.aiAnalysis.structuredNotes && (
                          <div>
                            <p className="text-xs text-muted-foreground">Key Points</p>
                            <ul className="text-sm text-white list-disc list-inside">
                              {result.callLog.aiAnalysis.structuredNotes.map((note: string, idx: number) => (
                                <li key={idx}>{note}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">No transcript available</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Simulate a call to see the transcript and AI analysis
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        {/* Metrics Update */}
        <FadeIn delay={0.3}>
          <Card className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/60 to-slate-900/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Dashboard Metrics
              </CardTitle>
              <CardDescription>
                Real-time updates to your dashboard metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <PhoneCall className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-muted-foreground">Total Calls</span>
                      </div>
                      <p className="text-2xl font-bold text-white">+1</p>
                    </div>
                    <div className={`p-4 rounded-lg border ${
                      result.bookingCreated 
                        ? "bg-green-500/10 border-green-500/20" 
                        : "bg-slate-800/30 border-white/5"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className={`w-4 h-4 ${
                          result.bookingCreated ? "text-green-400" : "text-slate-400"
                        }`} />
                        <span className="text-sm text-muted-foreground">Bookings</span>
                      </div>
                      <p className={`text-2xl font-bold ${
                        result.bookingCreated ? "text-green-400" : "text-slate-400"
                      }`}>
                        {result.bookingCreated ? "+1" : "+0"}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-800/30 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-muted-foreground">AI Insights</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Sentiment</span>
                        <span className="text-sm font-medium text-white capitalize">
                          {result.callLog?.aiAnalysis?.sentiment || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Intent</span>
                        <span className="text-sm font-medium text-white capitalize">
                          {result.callLog?.aiAnalysis?.callerIntent || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Booking Likelihood</span>
                        <span className={`text-sm font-medium ${
                          result.callLog?.aiAnalysis?.bookingLikely 
                            ? "text-green-400" 
                            : "text-yellow-400"
                        }`}>
                          {result.callLog?.aiAnalysis?.bookingLikely ? "High" : "Low"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={reset} variant="outline" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Simulate Another
                    </Button>
                    <Button 
                      onClick={() => window.location.href = "/dashboard/calls"} 
                      variant="default" 
                      className="flex-1"
                    >
                      <PhoneCall className="w-4 h-4 mr-2" />
                      View All Calls
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Metrics not updated</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Simulate a call to see real-time metric updates
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
