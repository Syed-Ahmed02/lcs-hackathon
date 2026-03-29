"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";

function CountdownTimer({ expiresAt }: { expiresAt: number }) {
  const [remaining, setRemaining] = useState(Math.max(0, expiresAt - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, expiresAt - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const min = Math.floor(remaining / 60_000);
  const sec = Math.floor((remaining % 60_000) / 1000);

  if (remaining === 0) return <span className="text-destructive text-sm">Expired</span>;
  return (
    <span className="text-muted-foreground text-sm">
      Expires in {min}:{sec.toString().padStart(2, "0")}
    </span>
  );
}

export default function LinkExtensionPage() {
  const activeLinkCode = useQuery(api.linking.getActiveLinkCode);
  const generateLinkCode = useMutation(api.linking.generateLinkCode);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateLinkCode({});
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!activeLinkCode) return;
    navigator.clipboard.writeText(activeLinkCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Link Your Extension</h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Generate a code and enter it in the browser extension to connect your account.
        </p>
      </div>

      <div className="max-w-sm rounded-xl border bg-card p-6">
        {activeLinkCode ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <p className="text-muted-foreground text-xs uppercase tracking-widest">
                Your link code
              </p>
              <span className="font-mono text-4xl font-bold tracking-widest">
                {activeLinkCode.code}
              </span>
              <CountdownTimer expiresAt={activeLinkCode.expiresAt} />
            </div>

            <button
              onClick={handleCopy}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 w-full rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              {copied ? "Copied!" : "Copy Code"}
            </button>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="text-muted-foreground hover:text-foreground w-full text-center text-xs transition-colors"
            >
              Generate new code
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-center text-sm">
              No active link code. Generate one and enter it in the extension popup.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {generating ? "Generating…" : "Generate Link Code"}
            </button>
          </div>
        )}
      </div>

      <div className="max-w-sm rounded-xl border bg-muted/50 p-4 text-sm">
        <p className="font-medium">How it works</p>
        <ol className="text-muted-foreground mt-2 list-decimal space-y-1 pl-4 text-xs">
          <li>Click Generate to create a 6-character code.</li>
          <li>Open the extension popup in your browser.</li>
          <li>Enter the code in the "Link Account" field.</li>
          <li>The extension is now associated with your account.</li>
        </ol>
      </div>
    </div>
  );
}
