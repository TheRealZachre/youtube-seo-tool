"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";

export function ChannelConnectForm({
  defaultChannel,
}: {
  defaultChannel: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultChannel);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/channel?channel=${encodeURIComponent(q)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
    >
      <label className="sr-only" htmlFor="channel-input">
        YouTube channel
      </label>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          id="channel-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="@handle or youtube.com/c/..."
          className="w-full rounded-lg border border-line bg-white py-2.5 pl-10 pr-3 text-sm text-ink outline-none ring-sky/30 focus:ring-2"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky"
      >
        Analyze channel
      </button>
    </form>
  );
}
