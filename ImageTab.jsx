import React from "react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "lucide-react";

export function Footer({
  githubLink = "https://github.com/your/repo",
  twitterLink = "https://twitter.com/your_handle",
  linkedinLink = "https://linkedin.com/in/yourprofile",
}) {
  return (
    <footer className="border-t border-slate-200 bg-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Built by Detects7 Labs · Minimal vision UI for modern inference.</span>
        <div className="flex items-center gap-4 text-slate-400">
          <a className="inline-flex items-center gap-1 hover:text-slate-700" href={githubLink} target="_blank" rel="noreferrer">
            <GithubIcon className="h-4 w-4" /> GitHub
          </a>
          <a className="inline-flex items-center gap-1 hover:text-slate-700" href={twitterLink} target="_blank" rel="noreferrer">
            <TwitterIcon className="h-4 w-4" /> Twitter
          </a>
          <a className="inline-flex items-center gap-1 hover:text-slate-700" href={linkedinLink} target="_blank" rel="noreferrer">
            <LinkedinIcon className="h-4 w-4" /> LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
