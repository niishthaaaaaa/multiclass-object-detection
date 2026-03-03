import React from "react";
import { GithubIcon, SparklesIcon } from "lucide-react";

export function Header({
  logoText = "7D",
  title = "Detects7 Studio",
  subtitle = "Next-gen computer vision control room",
  githubLink = "https://github.com/your/repo",
  githubStarsLabel = "68.1K",
}) {
  return (
    <nav className="border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{logoText}</span>
          <div>
            <p className="text-xl font-semibold tracking-tight">{title}</p>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <SparklesIcon className="h-3.5 w-3.5" />
            Powered by YOLO
          </span>
          <a
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            href={githubLink}
            target="_blank"
            rel="noreferrer"
          >
            <GithubIcon className="h-4 w-4" />
            <span>{githubStarsLabel}</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
