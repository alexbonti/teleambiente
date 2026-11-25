"use client";

import { useEffect, useRef, useState } from "react";

const HLS_SRC = "https://64b16f23efbee.streamlock.net:443/teleambiente3/teleambiente3/playlist.m3u8";

/**
 * Live player. The broadcast stream is a single-bitrate HLS playlist: Safari plays it
 * natively, everything else needs hls.js, which is loaded only when the viewer asks
 * for video. No third-party cookies, no embed, no player skin of someone else's brand.
 */
export function LivePlayer({ programme, offAirNote }: { programme: string; offAirNote?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "playing" | "error">("idle");

  useEffect(() => {
    if (state !== "loading") return;
    const video = videoRef.current;
    if (video === null) return;

    let destroy: (() => void) | undefined;
    let cancelled = false;

    async function start() {
      const element = videoRef.current;
      if (element === null) return;
      const nativeHls = element.canPlayType("application/vnd.apple.mpegurl") !== "";
      if (nativeHls) {
        element.src = HLS_SRC;
        await element.play().catch(() => setState("error"));
        setState("playing");
        return;
      }
      try {
        const { default: Hls } = await import("hls.js");
        if (cancelled) return;
        if (!Hls.isSupported()) {
          element.src = HLS_SRC;
          await element.play().catch(() => setState("error"));
          setState("playing");
          return;
        }
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(HLS_SRC);
        hls.attachMedia(element);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) setState("error");
        });
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          void element.play().then(() => setState("playing")).catch(() => setState("error"));
        });
        destroy = () => hls.destroy();
      } catch {
        setState("error");
      }
    }

    void start();
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [state]);

  return (
    <div className="border border-ink bg-ink">
      <div className="relative aspect-video w-full">
        <video
          ref={videoRef}
          controls={state === "playing"}
          playsInline
          preload="none"
          className="size-full object-cover"
          aria-label={`Diretta ${programme}`}
        />

        {state !== "playing" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-paper/70">
              Canale 221 · 18 · Roma
            </p>
            <p className="font-display text-[1.35rem] font-bold leading-tight text-paper sm:text-[1.7rem]">
              {state === "error" ? "Streaming non raggiungibile" : programme}
            </p>
            {state === "idle" && offAirNote ? (
              <p className="max-w-[34ch] text-[0.8125rem] leading-relaxed text-paper/70">{offAirNote}</p>
            ) : null}
            {state === "error" ? (
              <p className="max-w-[38ch] text-[0.8125rem] leading-relaxed text-paper/70">
                Il flusso live non risponde. Puoi riprovare o aprire il canale su YouTube mentre la
                regia ripristina il segnale.
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => setState(state === "error" ? "idle" : "loading")}
              className="inline-flex items-center gap-2 border border-paper bg-paper px-4 py-2 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-signal-ink hover:text-white"
            >
              {state === "loading" ? (
                <>
                  <span className="size-2 animate-pulse rounded-full bg-signal" aria-hidden="true" />
                  Connessione…
                </>
              ) : state === "error" ? (
                "Riprova"
              ) : (
                <>
                  <span aria-hidden="true">▶</span> Guarda la diretta
                </>
              )}
            </button>
            <a
              className="text-[0.6875rem] uppercase tracking-[0.1em] text-paper/60 underline hover:text-paper"
              href="https://www.youtube.com/channel/UCf9ONyZWZ9NfdKDvJ6T2QZQ/streams"
            >
              Apri su YouTube
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
