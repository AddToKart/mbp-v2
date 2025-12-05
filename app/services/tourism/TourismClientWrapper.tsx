"use client";

import { Suspense, useEffect, useState } from "react";
import TourismContent from "./TourismContent";

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/20" />
        <div className="h-4 w-32 bg-muted rounded" />
      </div>
    </div>
  );
}

export default function TourismClientWrapper(props: any) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <TourismContent {...props} />
    </Suspense>
  );
}
