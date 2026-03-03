import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ActivityIcon,
  BoxIcon,
  CameraIcon,
  DownloadIcon,
  GithubIcon,
  HouseIcon,
  ImageIcon,
  LinkedinIcon,
  Loader2,
  PanelsTopLeftIcon,
  SparklesIcon,
  TwitterIcon,
  VideoIcon,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const FEATURE_CARDS = [
  {
    title: "Multi-modal ready",
    description: "Switch between image, video and live webcam inference with a single interface.",
  },
  {
    title: "Confidence analytics",
    description: "Precision metrics update in real time as new predictions stream in.",
  },
  {
    title: "Zero friction export",
    description: "Download annotated media or JSON results for downstream debugging instantly.",
  },
  {
    title: "Production grade",
    description: "FastAPI backend with YOLO at the core—built for dependable deployments.",
  },
];

const INFO_PILLS = [
  "FastAPI backend",
  "YOLO model",
  "Video annotations",
  "Live webcam",
  "Framer Motion",
];

const formatConfidence = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  const percent = value <= 1 ? value * 100 : value;
  return `${percent.toFixed(1)}%`;
};

const TabsContext = createContext();

function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue ?? internalValue;

  const setValue = useCallback(
    (next) => {
      onValueChange?.(next);
      if (controlledValue === undefined) {
        setInternalValue(next);
      }
    },
    [controlledValue, onValueChange],
  );

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, children, ...props }) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 p-2 text-sm backdrop-blur",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function TabsTrigger({ value, className, children, ...props }) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");
  const selected = context.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={() => context.setValue(value)}
      className={cn(
        "flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 font-medium transition",
        selected
          ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10"
          : "border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-900",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, className, children, ...props }) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be inside Tabs");
  const hidden = context.value !== value;

  return (
    <div
      role="tabpanel"
      hidden={hidden}
      className={cn(hidden ? "hidden" : "block", className)}
      {...props}
    >
      {!hidden ? children : null}
    </div>
  );
}

function ScrollArea({ className, children }) {
  return (
    <div className={cn("relative overflow-x-auto", className)}>{children}</div>
  );
}

function ScrollBar({ orientation = "horizontal" }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none mt-3 h-1 rounded-full bg-slate-200/80",
        orientation === "vertical" && "hidden",
      )}
    />
  );
}

function Badge({ className = "", variant = "default", ...props }) {
  const styles = {
    default:
      "inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white",
    secondary:
      "inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600",
  };
  return (
    <span className={cn(styles[variant] || styles.default, className)} {...props} />
  );
}

function Announcement({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/70 px-5 py-3 text-sm shadow-sm shadow-slate-100",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function AnnouncementTag({ className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-slate-900/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

function AnnouncementTitle({ className, children, ...props }) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-sm font-medium text-slate-600",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("image");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [annotatedImageB64, setAnnotatedImageB64] = useState(null);
  const [detections, setDetections] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);

  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoMeta, setVideoMeta] = useState(null);

  const [liveActive, setLiveActive] = useState(false);
  const [liveAnnotatedB64, setLiveAnnotatedB64] = useState(null);
  const [liveDetections, setLiveDetections] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const [showLivePreview, setShowLivePreview] = useState(false);

  const [announcementHidden, setAnnouncementHidden] = useState(false);

  const liveVideoRef = useRef(null);
  const liveCanvasRef = useRef(null);
  const liveIntervalRef = useRef(null);
  const liveStreamRef = useRef(null);
  const liveRequestRef = useRef(false);
  const lastInferenceTimeRef = useRef(0);
  const liveOverlayCanvasRef = useRef(null);


  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (!videoFile) {
      setVideoPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  useEffect(() => {
    if (!processedVideoUrl) {
      return undefined;
    }
    return () => URL.revokeObjectURL(processedVideoUrl);
  }, [processedVideoUrl]);

  const stopLive = useCallback(() => {
    if (liveIntervalRef.current) {
      cancelAnimationFrame(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }
    if (liveStreamRef.current) {
      liveStreamRef.current.getTracks().forEach((track) => track.stop());
      liveStreamRef.current = null;
    }
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
    liveRequestRef.current = false;
    setLiveActive(false);
    setLiveAnnotatedB64(null);
    setLiveDetections([]);
    setLiveLoading(false);
  }, []);

  // Replace your captureLiveFrame function with this enhanced version
  const captureLiveFrame = useCallback(async () => {
    if (!liveVideoRef.current || !liveCanvasRef.current) return;

    const now = performance.now();
    const MIN_INTERVAL = 200; // ms between inferences
    if (now - lastInferenceTimeRef.current < MIN_INTERVAL) return;

    if (liveRequestRef.current) return;

    const video = liveVideoRef.current;
    if (video.readyState < 2) return;

    liveRequestRef.current = true;
    lastInferenceTimeRef.current = now;

    try {
      const canvas = liveCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92),
      );

      if (!blob) {
        liveRequestRef.current = false;
        return;
      }

      const form = new FormData();
      form.append("file", new File([blob], "live-frame.jpg", { type: "image/jpeg" }));

      setLiveLoading(true);
      const res = await axios.post(`${API}/predict-image`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const detections = res.data.detections || [];

      console.log('Detections received:', detections); // Debug log

      setLiveDetections(detections);
      setLiveAnnotatedB64(res.data.annotated_image_b64 || null);
      setLiveError(null);

      // Draw bounding boxes on canvas overlay
      drawBoundingBoxes(detections, video.videoWidth, video.videoHeight);

    } catch (err) {
      console.error('Live inference error:', err);
      setLiveError(err?.response?.data?.detail || err.message);
    } finally {
      setLiveLoading(false);
      liveRequestRef.current = false;
    }
  }, []);


  // Add this NEW function to draw bounding boxes
  const drawBoundingBoxes = useCallback((detections, videoWidth, videoHeight) => {
    if (!liveOverlayCanvasRef.current) {
      console.log('Overlay canvas ref not available');
      return;
    }

    const canvas = liveOverlayCanvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = videoWidth;
    canvas.height = videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    console.log(`Drawing ${detections.length} detections`);

    detections.forEach((detection, index) => {
      const { bbox, class_label, label, conf, class: classId } = detection;

      if (!bbox || bbox.length < 4) {
        console.log(`Detection ${index} has invalid bbox:`, bbox);
        return;
      }

      const [x1, y1, x2, y2] = bbox;
      const width = x2 - x1;
      const height = y2 - y1;

      const colors = ['#00ff00', '#ff0000', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      const colorIndex = (classId ?? index) % colors.length;
      const color = colors[colorIndex];

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, width, height);

      const displayLabel = class_label || label || `Object ${classId ?? index}`;
      const confidence = conf ? ` ${(conf * 100).toFixed(1)}%` : '';
      const text = `${displayLabel}${confidence}`;

      ctx.font = 'bold 16px Arial';
      const textMetrics = ctx.measureText(text);
      const textHeight = 20;
      const padding = 10;

      ctx.fillStyle = color;
      ctx.fillRect(x1, Math.max(0, y1 - textHeight - 4), textMetrics.width + padding, textHeight + 4);

      ctx.fillStyle = '#000000';
      ctx.fillText(text, x1 + 5, Math.max(textHeight - 4, y1 - 8));
    });
  }, []);




  const startLive = useCallback(async () => {
    if (liveActive) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setLiveError("Live inference requires camera access, which is unavailable on this device.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      liveStreamRef.current = stream;
      setLiveError(null);
      setLiveActive(true);

      // Wait for video element to be mounted and playing
      setTimeout(async () => {
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = stream;
          try {
            await liveVideoRef.current.play();
            console.log('Video started playing');

            // Start capturing frames after video is ready using requestAnimationFrame
            const loop = () => {
              captureLiveFrame();
              liveIntervalRef.current = requestAnimationFrame(loop);
            };

            // Small delay to ensure video metadata is ready
            setTimeout(() => {
              liveIntervalRef.current = requestAnimationFrame(loop);
            }, 200);
          } catch (playError) {
            console.error('Error playing video:', playError);
            setLiveError('Failed to play video stream');
          }
        }
      }, 100);

    } catch (err) {
      console.error('Camera access error:', err);
      setLiveError(err?.message || "Unable to start live stream. Please allow camera permissions.");
      stopLive();
    }
  }, [captureLiveFrame, liveActive, stopLive]);


  const currentDetections = activeTab === "live" ? liveDetections : detections;

  const detectionSummary = useMemo(() => {
    if (!currentDetections?.length) return [];
    const grouped = currentDetections.reduce((acc, detection) => {
      const clsId = detection.class ?? detection.cls;
      const label = detection.class_label ?? detection.label ?? (clsId != null ? `Class ${clsId}` : "Object");
      const key = `${label}__${clsId ?? label}`;
      const conf = typeof detection.conf === "number" ? detection.conf : null;
      const entry = acc.get(key) || { label, clsId, count: 0, best: 0 };
      entry.count += 1;
      if (conf !== null && conf > entry.best) {
        entry.best = conf;
      }
      acc.set(key, entry);
      return acc;
    }, new Map());
    return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
  }, [currentDetections]);

  const confidenceStats = useMemo(() => {
    if (!currentDetections?.length) return null;
    const confidences = currentDetections
      .map((d) => (typeof d.conf === "number" ? d.conf : null))
      .filter((c) => c !== null);
    if (!confidences.length) return null;
    const best = Math.max(...confidences);
    const avg = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    return { best, avg };
  }, [currentDetections]);

  const handleImageUpload = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setImageFile(selectedFile);
    setAnnotatedImageB64(null);
    setDetections([]);
    setImageLoading(true);

    const form = new FormData();
    form.append("file", selectedFile);

    try {
      const res = await axios.post(`${API}/predict-image`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDetections(res.data.detections || []);
      setAnnotatedImageB64(res.data.annotated_image_b64 || null);
    } catch (err) {
      alert("Error: " + (err?.response?.data?.detail || err.message));
    } finally {
      setImageLoading(false);
      event.target.value = "";
    }
  };

  const handleVideoUpload = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setVideoFile(selectedFile);
    setProcessedVideoUrl(null);
    setVideoMeta(null);
    setVideoLoading(true);

    const form = new FormData();
    form.append("file", selectedFile);

    try {
      const res = await axios.post(`${API}/predict-video/save`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: "video/mp4" }));
      setProcessedVideoUrl(url);
    } catch (err) {
      alert("Video error: " + (err?.response?.data?.detail || err.message));
    } finally {
      setVideoLoading(false);
      event.target.value = "";
    }
  };

  const downloadAnnotatedImage = () => {
    if (!annotatedImageB64) return;
    const a = document.createElement("a");
    a.href = `data:image/jpeg;base64,${annotatedImageB64}`;
    a.download = "annotated_image.jpg";
    a.click();
  };

  const downloadProcessedVideo = () => {
    if (!processedVideoUrl) return;
    const a = document.createElement("a");
    a.href = processedVideoUrl;
    a.download = "annotated_video.mp4";
    a.click();
  };

  const exportDetections = (data, filename = "detections.json") => {
    if (!data?.length) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasImageDetections = detections.length > 0;
  const hasLiveDetections = liveDetections.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <canvas
        ref={liveCanvasRef}
        className="hidden"
      />
      <nav className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-2xl font-bold tracking-tight text-slate-900">d7</span>
            <div>
              <p className="text-xl font-semibold tracking-tight">Detects7</p>
              <p className="text-sm text-slate-500">Next-gen computer vision control room</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              <SparklesIcon className="h-3.5 w-3.5" />
              Powered by YOLO
            </span>
            <a
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              href="https://github.com/your/repo"
              target="_blank"
              rel="noreferrer"
            >
              <GithubIcon className="h-4 w-4" />
              <span>68.1K</span>
            </a>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {!announcementHidden && (
          <Announcement className="mb-8">
            <div className="flex items-center gap-3">
              <AnnouncementTag>Latest update</AnnouncementTag>
              <AnnouncementTitle>
                Real-time webcam inference is now live.
              </AnnouncementTitle>
            </div>
            <button
              type="button"
              onClick={() => setAnnouncementHidden(true)}
              className="rounded-full border border-transparent px-3 py-1 text-xs text-slate-400 transition hover:border-slate-200 hover:text-slate-600"
            >
              Dismiss
            </button>
          </Announcement>
        )}

        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap gap-2">
              {INFO_PILLS.map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {pill}
                </span>
              ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Orchestrate your detections across image, video, and live streams
                  </h1>
                  <p className="text-base text-slate-600">
                    Upload media, monitor results, and export with confidence. Detects7 keeps the canvas minimal so
                    your model output takes center stage.
                  </p>
                </div>

                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  defaultValue="image"
                  className="space-y-6"
                >
                  <ScrollArea>
                    <TabsList>
                      <TabsTrigger value="image">
                        <HouseIcon className="-ms-0.5 me-1.5 h-4 w-4 opacity-60" />
                        Image
                        <Badge variant="secondary" className="ms-1.5">Classic</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="video" className="group">
                        <PanelsTopLeftIcon className="-ms-0.5 me-1.5 h-4 w-4 opacity-60" />
                        Video
                        <Badge
                          variant="secondary"
                          className="ms-1.5 min-w-5 px-2 group-data-[state=inactive]:opacity-60"
                        >
                          MP4
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="live" className="group">
                        <BoxIcon className="-ms-0.5 me-1.5 h-4 w-4 opacity-60" />
                        Live
                        <Badge className="ms-1.5 group-data-[state=inactive]:opacity-60">New</Badge>
                      </TabsTrigger>
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>

                  <TabsContent value="image" className="rounded-3xl border border-slate-200 bg-white/60 p-6 shadow-sm">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
                      <div className="space-y-4">
                        <label
                          htmlFor="image-upload"
                          className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-8 text-center transition hover:border-slate-400 hover:bg-white"
                        >
                          <div className="rounded-full bg-white p-4 shadow-sm">
                            <ImageIcon className="h-6 w-6 text-slate-500 transition group-hover:text-slate-700" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-700">Drop or choose an image</p>
                            <p className="text-xs text-slate-500">JPEG or PNG up to 10MB</p>
                          </div>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageUpload}
                          />
                        </label>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={downloadAnnotatedImage}
                            disabled={!annotatedImageB64}
                            className={cn(
                              "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
                              annotatedImageB64
                                ? "border-slate-200 bg-slate-900 text-white shadow-sm hover:bg-slate-800"
                                : "border-slate-200 bg-slate-100 text-slate-400",
                            )}
                          >
                            <DownloadIcon className="h-4 w-4" />
                            Download annotated
                          </button>
                          <button
                            type="button"
                            onClick={() => exportDetections(detections)}
                            disabled={!hasImageDetections}
                            className={cn(
                              "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
                              hasImageDetections
                                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                : "border-slate-200 bg-slate-100 text-slate-400",
                            )}
                          >
                            <DownloadIcon className="h-4 w-4" />
                            Export detections
                          </button>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
                          Uploads stay local until inference finishes. Clear history by refreshing the page.
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                          {imageLoading && (
                            <div className="absolute inset-0 z-10 grid place-content-center bg-white/80">
                              <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                            </div>
                          )}
                          {annotatedImageB64 ? (
                            <img
                              src={`data:image/jpeg;base64,${annotatedImageB64}`}
                              alt="Annotated result"
                              className="max-h-[480px] w-full object-contain"
                            />
                          ) : imagePreviewUrl ? (
                            <img
                              src={imagePreviewUrl}
                              alt="Image preview"
                              className="max-h-[480px] w-full object-contain"
                            />
                          ) : (
                            <div className="text-sm text-slate-400">Upload an image to preview and annotate.</div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <ActivityIcon className="h-4 w-4 text-emerald-500" />
                          <span>
                            {imageLoading
                              ? "Running inference..."
                              : hasImageDetections
                                ? `${detections.length} detections ready`
                                : "Awaiting upload"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="video" className="rounded-3xl border border-slate-200 bg-white/60 p-6 shadow-sm">
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
                            onChange={handleVideoUpload}
                          />
                        </label>

                        <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
                          Processing happens server-side. Longer clips will take proportionally longer to annotate.
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={downloadProcessedVideo}
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
                            onClick={() => exportDetections([], "video-detections.json")}
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
                                setVideoMeta({
                                  duration: event.currentTarget.duration,
                                  width: event.currentTarget.videoWidth,
                                  height: event.currentTarget.videoHeight,
                                })
                              }
                            />
                          ) : videoPreviewUrl ? (
                            <video
                              key={videoPreviewUrl}
                              controls
                              className="aspect-video w-full rounded-2xl opacity-70"
                              src={videoPreviewUrl}
                            />
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
                  </TabsContent>

                  <TabsContent value="live" className="space-y-6">
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
                      <p className="text-sm leading-relaxed text-slate-600">
                        Enable your webcam to stream frames for inference. Results update every two seconds. Camera access stays local to your browser.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={startLive}
                          disabled={liveActive}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition-all",
                            liveActive
                              ? "cursor-not-allowed bg-slate-100 text-slate-400"
                              : "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95"
                          )}
                        >
                          <CameraIcon className="h-4 w-4" />
                          Start live inference
                        </button>
                        <button
                          onClick={stopLive}
                          disabled={!liveActive}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                            !liveActive
                              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:scale-95"
                          )}
                        >
                          Stop
                        </button>
                        <button
                          onClick={() => setShowLivePreview((prev) => !prev)}
                          disabled={!liveActive}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                            !liveActive
                              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          )}
                        >
                          {showLivePreview ? "Hide" : "Show"} annotated snapshot
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-black/80">
                        {liveActive ? (
                          <div className="relative aspect-video w-full">
                            {/* Video feed */}
                            <video
                              ref={liveVideoRef}
                              autoPlay
                              playsInline
                              muted
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Overlay canvas for bounding boxes */}
                            <canvas
                              ref={liveOverlayCanvasRef}
                              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
                            />
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">
                            {liveActive
                              ? "Waiting for detections..."
                              : "Start your webcam to populate live detection telemetry."}
                          </p>
                        )}
                      </div>

                      {showLivePreview && liveAnnotatedB64 && (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                          <img
                            src={`data:image/jpeg;base64,${liveAnnotatedB64}`}
                            alt="Live annotated"
                            className="w-full object-contain"
                          />
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
                                : "Connected - waiting for detections..."
                            : "Live feed idle"}
                        </span>
                      </div>
                    </div>

                    {/* Rest of your Detection insights section remains the same */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-slate-800">Detection insights</h3>
                        {liveActive && (
                          <span className="text-xs text-slate-400">Auto-refreshing</span>
                        )}
                      </div>
                      {liveActive && hasLiveDetections ? (
                        <div className="space-y-3">
                          {liveDetections.slice(0, 10).map((d, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                            >
                              <span className="font-medium text-slate-700">
                                {d.class_label || d.label || `Class ${d.class ?? i}`}
                              </span>
                              <span className="text-slate-500">
                                {d.conf ? `${(d.conf * 100).toFixed(1)}%` : "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">
                          {liveActive
                            ? "Waiting for detections..."
                            : "Start your webcam to populate live detection telemetry."}
                        </p>
                      )}
                    </div>
                  </TabsContent>

                </Tabs>
              </div>

              <aside className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Detection insights</h3>
                    <span className="text-xs text-slate-400">Auto-refreshing</span>
                  </div>
                  {currentDetections?.length ? (
                    <div className="mt-4 space-y-4">
                      {detectionSummary.slice(0, 4).map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{item.label}</p>
                            <p className="text-xs text-slate-500">{item.count} detections</p>
                          </div>
                          <Badge variant="secondary">
                            {formatConfidence(item.best)} max
                          </Badge>
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
                    <SparklesIcon className="h-5 w-5 text-indigo-500" />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Confidence metrics</h4>
                      <p className="text-xs text-slate-500">Aggregated from your latest run</p>
                    </div>
                  </div>
                  {confidenceStats ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center">
                        <p className="text-xs text-slate-500">Average</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatConfidence(confidenceStats.avg)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center">
                        <p className="text-xs text-slate-500">Best</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatConfidence(confidenceStats.best)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-5 text-sm text-slate-500">
                      Metrics will populate once detections are available.
                    </p>
                  )}
                </div>
              </aside>
            </div>
          </motion.div>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURE_CARDS.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-slate-900">{feature.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{feature.description}</p>
              </div>
            ))}
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Built by Detects7 Labs · Minimal vision UI for modern inference.</span>
          <div className="flex items-center gap-4 text-slate-400">
            <a className="inline-flex items-center gap-1 hover:text-slate-700" href="https://github.com/your/repo" target="_blank" rel="noreferrer">
              <GithubIcon className="h-4 w-4" /> GitHub
            </a>
            <a className="inline-flex items-center gap-1 hover:text-slate-700" href="https://twitter.com/your_handle" target="_blank" rel="noreferrer">
              <TwitterIcon className="h-4 w-4" /> Twitter
            </a>
            <a className="inline-flex items-center gap-1 hover:text-slate-700" href="https://linkedin.com/in/yourprofile" target="_blank" rel="noreferrer">
              <LinkedinIcon className="h-4 w-4" /> LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
