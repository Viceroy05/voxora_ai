"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/shared/fade-in";
import { Phone, CheckCircle, Calendar, AlertCircle, Loader2, Mic, Brain, Sparkles, Clock } from "lucide-react";

type SimulationStep = {
  step: number;
  name: string;
  status: "pending" | "running" | "completed" | "skipped";
};

type DemoCallSimulatorProps = {
  businessId: string;
  onSimulationComplete?: () => void;
};

export function DemoCallSimulator({ businessId, onSimulationComplete }: DemoCallSimulatorProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [steps, setSteps] = useState<SimulationStep[]>([
    { step: 1, name: "Incoming Call", status: "pending" },
    { step: 2, name: "Call Answered", status: "pending" },
    { step: 3, name: "Transcript Generated", status: "pending" },
    { step: 4, name: "AI Analysis", status: "pending" },
    { step: 5, name: "Booking Created", status: "pending" },
  ]);

  const simulateCall = async () => {
    setIsSimulating(true);
    setError(null);
    setResult(null);
    setSteps(steps.map(s => ({ ...s, status: "pending" as const })));

    try {
      // Step 1: Incoming Call
      setSteps(prev => prev.map(s => s.step === 1 ? { ...s, status: "running" } : s));
      await new Promise(resolve => setTimeout(resolve, 800));

      // Call the API which will process all steps
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

      // Update steps based on API response
      if (data.steps) {
        setSteps(data.steps.map((s: any) => ({
          step: s.step,
          name: s.name,
          status: s.status as "completed" | "skipped"
        })));
      } else {
        // Fallback: mark all steps as completed
        setSteps(steps.map(s => ({ ...s, status: "completed" as const })));
      }

      setResult(data);
      setIsSimulating(false);

      // Notify parent component
      onSimulationComplete?.();
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

  return (
    <FadeIn>
      <Card className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/60 to-slate-900/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-cyan-400" />
            AI Call Simulator
          </CardTitle>
          <CardDescription>
            Production-grade demo: Simulate realistic incoming calls with Twilio webhooks, AI analysis, and automatic booking
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
          ) : result ? (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Call simulation complete!</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {result.scenario?.customerName} booked {result.scenario?.serviceName}
                  </p>
                </div>
              </div>

              {/* Simulation Steps */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Simulation Steps</h4>
                <div className="space-y-2">
                  {steps.map((step) => (
                    <div key={step.step} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      {getStepIcon(step)}
                      <span className={`flex-1 text-sm font-medium ${getStepColor(step)}`}>
                        {step.name}
                      </span>
                      {step.status === "completed" && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {step.status === "skipped" && (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-center">
                <Button onClick={reset} variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Simulate Another Call
                </Button>
                <Button onClick={() => window.location.href = "/dashboard/calls"}>
                  View in Calls
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Initial State */}
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Ready to simulate a call</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click the button below to simulate a realistic incoming customer call with full AI processing
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 text-cyan-400" />
                  <span>Realistic Twilio webhooks</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mic className="w-4 h-4 text-purple-400" />
                  <span>Full transcript generation</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Brain className="w-4 h-4 text-pink-400" />
                  <span>AI-powered analysis</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>Automatic booking</span>
                </div>
              </div>

              {/* Simulate Button */}
              <Button 
                onClick={simulateCall} 
                size="lg" 
                className="w-full"
                disabled={isSimulating}
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
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
}
