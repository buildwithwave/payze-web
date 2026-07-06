"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCheckEmail, useRegister } from "@/hooks/use-auth";
import { toast } from "@/components/ui/toast";
import { PasswordStrength } from "@/components/ui/password-strength";
import { SuccessCheck } from "@/components/ui/success-check";
import { useStore } from "@/lib/store-context";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");

  const checkEmail = useCheckEmail();
  const register = useRegister();
  const { createStore } = useStore();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkEmail.mutate(
      { email },
      {
        onSuccess: (res) => {
          if (res.data.exists) {
            toast.error("Email already registered", "Try logging in instead");
          } else {
            setStep(2);
          }
        },
      }
    );
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate(
      { email, firstName, lastName, businessName, phone, password },
      {
        onSuccess: (res) => {
          const token = res.data?.session?.access_token || res.data?.token;
          if (token) {
            localStorage.setItem("token", token);
            window.dispatchEvent(new Event("payze-auth-token-changed"));
            setStoreName(businessName);
            setStep(3);
          } else {
            toast.success("Account created!", "Please log in to continue");
            router.push("/login");
          }
        },
      }
    );
  };

  const handleStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = storeName.trim();
    if (!name) return;
    createStore.mutate(name, { onSuccess: () => setStep(4) });
  };

  useEffect(() => {
    if (step !== 4) return;
    const timer = setTimeout(() => router.push("/dashboard"), 2200);
    return () => clearTimeout(timer);
  }, [step, router]);

  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Create an account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your business email to get started
                </p>
              </div>

              <form action="#" onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Business email</Label>
                  <Input
                    id="email"
                    type="email"
                    className="h-10"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  loading={checkEmail.isPending}
                >
                  Continue
                </Button>
              </form>

              <p className="text-sm text-center text-muted-foreground leading-relaxed">
                By continuing, you agree to our{" "}
                <Link
                  href="/terms"
                  className="underline hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="underline hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </motion.div>
          ) : step === 2 ? (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Tell us about yourself
                </h1>
                <p className="text-sm text-muted-foreground">
                  Signing up as{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <form action="#" onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      className="h-10"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      className="h-10"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Legal business name</Label>
                  <Input
                    id="businessName"
                    className="h-10"
                    placeholder="e.g. Acme Ltd"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="h-10"
                    placeholder="+234 801 234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    className="h-10"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                  <PasswordStrength password={password} />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  loading={register.isPending}
                >
                  Create account
                </Button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-sm text-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back
                </button>
              </form>
            </motion.div>
          ) : step === 3 ? (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Create your store
                </h1>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve used your business name below. You can change it
                  anytime.
                </p>
              </div>

              <form action="#" onSubmit={handleStoreSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store name</Label>
                  <Input
                    id="storeName"
                    className="h-10"
                    placeholder="e.g., Onigbinde Stores"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  loading={createStore.isPending}
                  disabled={!storeName.trim() || createStore.isPending}
                >
                  Create store
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="space-y-8 text-center"
            >
              <SuccessCheck />

              <div className="space-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight">
                  You&apos;re all set
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your account and store are ready. Taking you to your
                  dashboard&hellip;
                </p>
              </div>

              <Button className="w-full" onClick={() => router.push("/dashboard")}>
                Go to dashboard
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
