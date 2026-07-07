"use client";

import { useEffect, useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { useReducedMotion } from "motion/react";
import successAnimation from "@/public/lottie/payment-success.json";

export function PaymentSuccessLottie() {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      lottieRef.current?.goToAndStop(99, true);
    }
  }, [shouldReduceMotion]);

  return (
    <div
      className="mx-auto size-36 sm:size-44"
      aria-hidden="true"
      role="presentation"
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={successAnimation}
        autoplay={!shouldReduceMotion}
        loop={false}
        rendererSettings={{
          preserveAspectRatio: "xMidYMid meet",
        }}
      />
    </div>
  );
}
