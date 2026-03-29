"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, RefreshCw } from "lucide-react";

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

  if (remaining === 0) return <span className="text-sm text-destructive">Expired</span>;
  return (
    <span className="text-sm tabular-nums text-muted-foreground">
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
        <h2 className="text-xl font-semibold tracking-tight">Link Extension</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Generate a code and enter it in the browser extension to connect your account.
        </p>
      </div>

      <Card className="max-w-sm">
        <CardContent className="pt-6">
          {activeLinkCode ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Your link code
                </p>
                <span className="font-mono text-3xl font-bold tracking-[0.2em]">
                  {activeLinkCode.code}
                </span>
                <CountdownTimer expiresAt={activeLinkCode.expiresAt} />
              </div>

              <Button
                variant="secondary"
                className="w-full gap-2"
                onClick={handleCopy}
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy Code"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-1.5 text-muted-foreground"
                onClick={handleGenerate}
                disabled={generating}
              >
                <RefreshCw className={`size-3 ${generating ? "animate-spin" : ""}`} />
                Generate new code
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-center text-sm text-muted-foreground">
                No active link code. Generate one and enter it in the extension popup.
              </p>
              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? "Generating…" : "Generate Link Code"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-sm bg-muted/30">
        <CardContent className="pt-5 pb-4 text-sm">
          <p className="font-medium">How it works</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
            <li>Click Generate to create a 6-character code.</li>
            <li>Open the extension popup in your browser.</li>
            <li>Enter the code in the &ldquo;Link Account&rdquo; field.</li>
            <li>The extension is now connected to your account.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
