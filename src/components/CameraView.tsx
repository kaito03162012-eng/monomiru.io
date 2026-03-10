import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Camera,
  Zap,
  MapPin,
  Settings,
  Flashlight,
  FlashlightOff,
  Image as ImageIcon,
  Clock,
} from "lucide-react";

interface CameraViewProps {
  onCapture: (imageSrc: string, savingsMode: boolean) => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  defaultSavingsMode: boolean;
}

export default function CameraView({
  onCapture,
  onOpenSettings,
  onOpenHistory,
  defaultSavingsMode,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [savingsMode, setSavingsMode] = useState(defaultSavingsMode);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }

      // Check for flash
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      if (capabilities.torch) {
        setHasFlash(true);
      }
    } catch (err) {
      setError(
        "カメラへのアクセスに失敗しました。権限が許可されているか確認してください。",
      );
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  const toggleFlash = async () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      try {
        await track.applyConstraints({
          advanced: [{ torch: !flashOn }],
        } as any);
        setFlashOn(!flashOn);
      } catch (err) {
        console.error("Failed to toggle flash", err);
      }
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL("image/jpeg", 0.8);
        onCapture(imageSrc, savingsMode);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onCapture(e.target.result as string, savingsMode);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative h-full w-full bg-black flex flex-col">
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-50 text-red-600 p-4 rounded-xl z-50 shadow-sm border border-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        <div className="absolute top-6 left-0 right-0 px-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium">
            <MapPin className="w-4 h-4" />
            <span>周辺の店舗を検索</span>
          </div>

          <div className="flex items-center gap-3">
            {hasFlash && (
              <button
                onClick={toggleFlash}
                className={`p-2.5 rounded-full backdrop-blur-md transition-colors ${flashOn ? "bg-white text-black" : "bg-black/40 text-white hover:bg-black/60"}`}
              >
                {flashOn ? (
                  <Flashlight className="w-5 h-5" />
                ) : (
                  <FlashlightOff className="w-5 h-5" />
                )}
              </button>
            )}
            <button
              onClick={onOpenSettings}
              className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white pb-10 pt-6 px-6 relative z-20 rounded-t-3xl -mt-6">
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={() => setSavingsMode(!savingsMode)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-200 text-sm font-medium ${
              savingsMode
                ? "bg-blue-50 text-blue-600 border border-blue-200"
                : "bg-gray-50 text-gray-600 border border-gray-200"
            }`}
          >
            <Zap className={`w-4 h-4 ${savingsMode ? "fill-blue-600" : ""}`} />
            <span>AI 節約モード {savingsMode ? "ON" : "OFF"}</span>
          </button>

          <div className="flex items-center justify-center gap-8 w-full">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <ImageIcon className="w-6 h-6" />
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />

            <button
              onClick={capture}
              disabled={!isStreaming}
              className="w-20 h-20 rounded-full border-4 border-gray-200 p-1 relative group disabled:opacity-50 transition-transform active:scale-95 flex-shrink-0"
            >
              <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </button>

            <button
              onClick={onOpenHistory}
              className="p-4 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Clock className="w-6 h-6" />
            </button>
          </div>

          <p className="text-gray-400 text-xs font-medium">
            タップしてアイテムを特定
          </p>
        </div>
      </div>
    </div>
  );
}
