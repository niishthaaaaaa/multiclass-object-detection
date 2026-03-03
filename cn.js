import React from "react";
import { ActivityIcon, CameraIcon, Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

export function LiveTab({
  liveActive,
  liveLoading,
  liveError,
  liveDetections,
  hasLiveDetections,
  startLive,
  stopLive,
  onExport,
  liveVideoRef,
  liveCanvasRef,
  liveAnnotatedB64,
  showLivePreview,
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 p-5 text-sm text-emerald-700">
          Enable your webcam to stream frames for inference. Results update every two seconds. Camera access stays local to your browser.
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startLive}
            disabled={liveActive}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-emerald-400 bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition",
              liveActive && "cursor-not-allowed opacity-60",
            )}
          >
            <CameraIcon className="h-4 w-4" />
            Start live inference
          </button>
          <button
            type="button"
            onClick={stopLive}
            disabled={!liveActive}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
              liveActive
                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                : "border-slate-200 bg-slate-100 text-slate-400",
            )}
          >
            Stop
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={!hasLiveDetections}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
              hasLiveDetections
                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                : "border-slate-200 bg-slate-100 text-slate-400",
            )}
          >
            Export current frame
          </button>
        </div>

        {liveError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">{liveError}</div>
        )}

        <canvas ref={liveCanvasRef} className="hidden" />
      </div>

      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-black/80">
          {liveActive ? (
            <video ref={liveVideoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
          ) : (
            <div className="grid aspect-video place-content-center text-sm text-slate-400">
              Start live inference to view the webcam feed.
            </div>
          )}
          {liveLoading && (
            <div className="absolute inset-0 z-10 grid place-content-center bg-black/40">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>
        {showLivePreview && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {liveAnnotatedB64 ? (
              <img src={`data:image/jpeg;base64,${liveAnnotatedB64}`} alt="Live annotated" className="w-full object-contain" />
            ) : (
              <div className="grid h-48 place-content-center text-sm text-slate-400">Awaiting first annotated frame...</div>
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <ActivityIcon className="h-4 w-4 text-emerald-500" />
          <span>
            {liveActive
              ? liveLoading
                ? "Streaming frame..."
                : hasLiveDetections
                ? `${liveDetections.length} detections on last frame`
                : "Connected"
              : "Live feed idle"}
          </span>
        </div>
      </div>
    </div>
  );
}
