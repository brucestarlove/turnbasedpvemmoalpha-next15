"use client";

import { useEffect, useRef, useState } from "react";

import { Icons } from "@/components/icons";

type GameLogData = {
  id: string;
  playerId: string;
  message: string;
  type: string;
  timestamp: Date;
};

type GameLogPanelProps = {
  logs: GameLogData[];
  isLoading?: boolean;
};

export const GameLogPanel = ({
  logs,
  isLoading = false,
}: GameLogPanelProps) => {
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLogsLength = useRef(0);

  useEffect(() => {
    // Auto-scroll only if new logs were added and auto-scroll is enabled
    if (
      autoScroll &&
      logs.length > prevLogsLength.current &&
      scrollRef.current
    ) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 100);
    }

    prevLogsLength.current = logs.length;
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop } = scrollRef.current;
      const isAtTop = scrollTop <= 10;
      setAutoScroll(isAtTop);
    }
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    setAutoScroll(true);
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLogTypeColor = (message: string) => {
    if (
      message.includes("🎉") ||
      message.includes("completed") ||
      message.includes("earned") ||
      message.includes("gained")
    ) {
      return "text-green-400";
    }
    if (
      message.includes("🔓") ||
      message.includes("Unlocked") ||
      message.includes("unlocked")
    ) {
      return "text-purple-400";
    }
    if (message.includes("started") || message.includes("began")) {
      return "text-blue-400";
    }
    if (message.includes("contributed") || message.includes("donated")) {
      return "text-yellow-400";
    }
    if (message.includes("failed") || message.includes("error")) {
      return "text-red-400";
    }
    return "text-foreground";
  };

  const getLogIcon = (message: string) => {
    if (
      message.includes("🎉") ||
      message.includes("completed") ||
      message.includes("earned")
    ) {
      return <Icons.check className="h-3 w-3 text-green-400" />;
    }
    if (
      message.includes("🔓") ||
      message.includes("Unlocked") ||
      message.includes("unlocked")
    ) {
      return <Icons.star className="h-3 w-3 text-purple-400" />;
    }
    if (message.includes("started") || message.includes("began")) {
      return <Icons.play className="h-3 w-3 text-blue-400" />;
    }
    if (message.includes("contributed") || message.includes("donated")) {
      return <Icons.gift className="h-3 w-3 text-yellow-400" />;
    }
    if (message.includes("failed") || message.includes("error")) {
      return <Icons.alertTriangle className="h-3 w-3 text-red-400" />;
    }
    return <Icons.info className="text-muted-foreground h-3 w-3" />;
  };

  if (isLoading) {
    return (
      <div className="bg-card/50 rounded-lg border p-4 shadow-lg backdrop-blur-sm">
        <h2 className="border-border mb-3 flex items-center gap-2 border-b pb-2 text-xl font-bold">
          <Icons.clipboard className="h-5 w-5" />
          Activity Log
        </h2>
        <div className="flex h-96 items-center justify-center">
          <Icons.loading className="text-starlight h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/50 rounded-lg border p-4 shadow-lg backdrop-blur-sm">
      <div className="border-border mb-3 flex items-center justify-between border-b pb-2">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Icons.clipboard className="text-starlight h-5 w-5" />
          Activity Log
        </h2>
        <div className="flex items-center gap-2">
          {!autoScroll && (
            <button
              onClick={scrollToTop}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
            >
              <Icons.arrowLeft className="h-3 w-3 rotate-[90deg]" />
              New
            </button>
          )}
          <span className="text-muted-foreground text-xs">
            {logs.length} entries
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-96 space-y-2 overflow-y-auto pr-2"
        style={{ scrollbarWidth: "thin" }}
      >
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <div
              key={log.id}
              className={`hover:bg-background/30 flex items-start gap-2 rounded-lg p-2 transition-colors ${
                index === logs.length - 1 && autoScroll ? "bg-starlight/10" : ""
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {getLogIcon(log.message)}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm leading-relaxed ${getLogTypeColor(log.message)}`}
                >
                  {log.message}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatTimestamp(log.timestamp)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <Icons.clipboard className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-muted-foreground font-medium">No activity yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Start a mission to see your progress here
            </p>
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <div className="border-border/50 mt-3 border-t pt-3">
          <p className="text-muted-foreground text-center text-xs">
            Auto-refreshes every 5 seconds • Scroll up to pause auto-scroll
          </p>
        </div>
      )}
    </div>
  );
};
