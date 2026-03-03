import React from "react";
import { DownloadIcon, Loader2, VideoIcon } from "lucide-react";
import { cn } from "../../utils/cn";

export function VideoTab({
  onVideoUpload,
  videoLoading,
  processedVideoUrl,
  videoPreviewUrl,
  onDownloadProcessed,
  videoMeta,
  onMetadata,
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <label
          htmlFor="video-upload"
          className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-8 text-center transition hover:border-slate-400 hover:bg-white"
        >
          <div className="rounded-full bg-white p-4 shadow-sm">
            <VideoIcon className="h-6 w-6 text-slate-500 transition group-hover:text-slate-700" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700">Upload an MP4 video</p>
            <p className="text-xs text-slate-500">Annotated download will be provided</p>
          </div>
          <input
            id="video-upload"
            type="file"
            accept="video/mp4,video/*"
            className="sr-only"
            onChange={onVideoUpload}
          />
        </label>

        <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
          Processing happens server-side. Longer clips will take proportionally longer to annotate.
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onDownloadProcessed}
            disabled={!processedVideoUrl}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
              processedVideoUrl
                ? "border-slate-200 bg-slate-900 text-white hover:bg-slate-800"
                : "border-slate-200 bg-slate-100 text-slate-400",
            )}
          >
            <DownloadIcon className="h-4 w-4" />
            Download annotated video
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400"
          >
            JSON export (coming soon)
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {videoLoading && (
            <div className="absolute inset-0 z-10 grid place-content-center bg-white/80">
              <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
            </div>
          )}

          {processedVideoUrl ? (
            <video
              key={processedVideoUrl}
              controls
              className="aspect-video w-full rounded-2xl"
              src={processedVideoUrl}
              onLoadedMetadata={(event) =>
                onMetadata?.({
                  duration: event.currentTarget.duration,
                  width: event.currentTarget.videoWidth,
                  height: event.currentTarget.videoHeight,
                })
              }
            />
          ) : videoPreviewUrl ? (
            <video key={videoPreviewUrl} controls className="aspect-video w-full rounded-2xl opacity-70" src={videoPreviewUrl} />
          ) : (
            <div className="grid h-full place-content-center p-16 text-sm text-slate-400">
              Upload a clip to preview and annotate.
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <VideoIcon className="h-4 w-4 text-indigo-500" />
          <span>
            {videoLoading
              ? "Processing video..."
              : processedVideoUrl
              ? "Annotated video ready"
              : "Awaiting upload"}
          </span>
          {videoMeta && (
            <span>
              · {Math.round(videoMeta.duration || 0)}s · {videoMeta.width}×{videoMeta.height}px
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
