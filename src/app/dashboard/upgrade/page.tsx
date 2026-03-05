"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

export default function UpgradePage() {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { hasActiveMembership, loading } = useSubscription();

  const handleUpgrade = async () => {
    if (!user) {
      router.push("/");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Gagal membuat sesi pembayaran");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Terjadi kesalahan saat memproses pembayaran");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManage = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error opening portal:", error);
      toast.error("Gagal membuka portal manajemen");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-24 lg:py-32">
      <div className="bg-white dark:bg-slate-900 py-24 lg:py-32 max-w-4xl mx-auto text-center px-4">
        <p className="text-base font-semibold leading-7 text-indigo-600">
          Pricing
        </p>
        <h2 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Supercharge Your Document Companion
        </h2>
        <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Pilih paket yang sesuai dengan kebutuhan Anda untuk berinteraksi
          dengan PDF, meningkatkan produktivitas, dan memperlancar alur kerja.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl lg:max-w-4xl mx-auto">
          {/* Starter Plan */}
          <div className="ring-1 ring-gray-200 dark:ring-slate-700 p-8 h-fit pb-12 rounded-3xl">
            <h3 className="text-lg font-semibold leading-8 text-slate-900 dark:text-white">
              Starter Plan
            </h3>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Jelajahi fitur inti tanpa biaya
            </p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Gratis
              </span>
            </p>

            <ul
              role="list"
              className="mt-8 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-400"
            >
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-indigo-600" />
                Simpan hingga 2 dokumen
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-indigo-600" />
                3 pesan per dokumen
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-indigo-600" />
                Chat AI dasar
              </li>
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="ring-2 ring-indigo-600 rounded-3xl p-8">
            <h3 className="text-lg font-semibold leading-8 text-indigo-600">
              Pro Plan
            </h3>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Maksimalkan produktivitas dengan fitur Pro
            </p>
            <p className="mt-6 flex items-baseline gap-x-1">
              <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                $5.99
              </span>
              <span className="text-sm font-semibold leading-6 text-slate-600 dark:text-slate-400">
                /bulan
              </span>
            </p>

            {loading ? (
              <Button disabled className="mt-6 w-full bg-indigo-400 text-white">
                Memuat...
              </Button>
            ) : hasActiveMembership ? (
              <Button
                onClick={handleManage}
                disabled={isLoading}
                className="mt-6 w-full bg-indigo-600/20 text-indigo-600 hover:bg-indigo-600/30 border border-indigo-600"
              >
                {isLoading ? "Memuat..." : "Kelola Langganan"}
              </Button>
            ) : (
              <Button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="mt-6 w-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {isLoading ? "Memuat..." : "Upgrade ke Pro"}
              </Button>
            )}

            <ul
              role="list"
              className="mt-8 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-400"
            >
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-indigo-600" />
                Simpan hingga 20 dokumen
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-indigo-600" />
                Kemampuan menghapus dokumen
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-indigo-600" />
                Hingga 100 pesan per dokumen
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-indigo-600" />
                Chat AI bertenaga penuh dengan memori
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-indigo-600" />
                Analitik lanjutan
              </li>
              <li className="flex gap-x-3">
                <Check className="h-6 w-5 flex-none text-indigo-600" />
                Dukungan prioritas 24 jam
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
