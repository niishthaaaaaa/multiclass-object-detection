import React from "react";
import { Badge } from "../primitives";
import { formatConfidence } from "../../utils/cn";

export function InsightsSidebar({ detectionSummary, confidenceStats, activeTab }) {
  return (
    <>
      <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Detection insights</h3>
          <span className="text-xs text-slate-400">Auto-refreshing</span>
        </div>
        {detectionSummary?.length ? (
          <div className="mt-4 space-y-4">
            {detectionSummary.slice(0, 4).map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.count} detections</p>
                </div>
                <Badge variant="secondary">{formatConfidence(item.best)} max</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-slate-500">
            {activeTab === "video"
              ? "Upload a video clip to inspect frame-by-frame detections."
              : activeTab === "live"
              ? "Start your webcam to populate live detection telemetry."
              : "Run an image inference to unlock detection analytics."}
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">%
          </span>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Confidence metrics</h4>
            <p className="text-xs text-slate-500">Aggregated from your latest run</p>
          </div>
        </div>
        {confidenceStats ? (
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center">
              <p className="text-xs text-slate-500">Average</p>
              <p className="text-lg font-semibold text-slate-900">{formatConfidence(confidenceStats.avg)}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center">
              <p className="text-xs text-slate-500">Best</p>
              <p className="text-lg font-semibold text-slate-900">{formatConfidence(confidenceStats.best)}</p>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">Metrics will populate once detections are available.</p>
        )}
      </div>
    </>
  );
}
