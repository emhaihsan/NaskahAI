"use client";

import { Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PricingPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!isSignedIn) {
      // Typically you'd use Clerk's modal or redirect to sign in
      // For this example, if they click and aren't signed in, we route to home which has auth buttons
      router.push("/");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Replace with an actual test Stripe price ID
          priceId: "price_123456789", 
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error subscribing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <FileText size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              PDF<span className="text-indigo-600 dark:text-indigo-400">Talk</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/">
                <Button variant="ghost">Log in</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-500 dark:text-slate-400">
            Choose the plan that's right for you and start talking to your PDFs today.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="rounded-3xl p-8 ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 flex flex-col">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Free</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Perfect for trying out the service.</p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">$0</span>
                <span className="text-slate-500 dark:text-slate-400">/month</span>
              </div>
              
              <ul className="flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-300 mb-8 flex-1 text-left">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span>Up to 3 PDF documents</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span>5MB maximum file size</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span>10 questions per document</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span>Standard response time</span>
                </li>
              </ul>
              
              <Link href={isSignedIn ? "/dashboard" : "/"} className="w-full mt-auto">
                <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white" size="lg">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="rounded-3xl p-8 ring-2 ring-indigo-600 bg-white dark:bg-slate-900 relative flex flex-col">
              <div className="absolute top-0 right-6 -translate-y-1/2">
                <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pro</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">For power users who need more capacity.</p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">$29</span>
                <span className="text-slate-500 dark:text-slate-400">/month</span>
              </div>
              
              <ul className="flex flex-col gap-4 text-sm text-slate-600 dark:text-slate-300 mb-8 flex-1 text-left">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span>Unlimited PDF documents</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span>32MB maximum file size</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span>Unlimited questions</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span>Priority support & faster responses</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                  <span>Extract tables and data</span>
                </li>
              </ul>
              
              <Button 
                onClick={handleSubscribe} 
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-auto" 
                size="lg"
              >
                {isLoading ? "Loading..." : "Upgrade to Pro"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
