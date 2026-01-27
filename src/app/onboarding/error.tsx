"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Please try again. If the issue persists, contact support.
      </p>
      <button className="mt-4 underline" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
