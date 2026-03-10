/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import CameraView from "./components/CameraView";
import ResultsView from "./components/ResultsView";
import SettingsView from "./components/SettingsView";
import HistoryView from "./components/HistoryView";
import { analyzeImage, AIResult } from "./services/ai";
import { Loader2 } from "lucide-react";

export interface UserSettings {
  useLocation: boolean;
  defaultSavingsMode: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  imageSrc: string;
  result: AIResult;
  isFavorite: boolean;
  savingsMode: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  useLocation: true,
  defaultSavingsMode: false,
};

export default function App() {
  const [view, setView] = useState<
    "camera" | "loading" | "results" | "settings" | "history"
  >("camera");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);
  const [savingsMode, setSavingsMode] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem("app_settings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem("app_history");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    fetch("/api/history")
      .then(res => {
        if (!res.ok) throw new Error("API not available");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
          localStorage.setItem("app_history", JSON.stringify(data));
        }
      })
      .catch(err => console.warn("Using local storage for history (Backend not available)"));
  }, []);

  useEffect(() => {
    localStorage.setItem("app_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("app_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (settings.useLocation && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
        },
      );
    } else {
      setLocation(null);
    }
  }, [settings.useLocation]);

  const handleCapture = async (img: string, isSavingsMode: boolean) => {
    setImageSrc(img);
    setSavingsMode(isSavingsMode);
    setView("loading");

    try {
      const aiResult = await analyzeImage(
        img,
        settings.useLocation ? location?.lat || null : null,
        settings.useLocation ? location?.lng || null : null,
        isSavingsMode,
      );
      setResult(aiResult);
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageSrc: img,
        result: aiResult,
        isFavorite: false,
        savingsMode: isSavingsMode,
      };
      setHistory(prev => [newItem, ...prev]);
      
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem)
      }).catch(err => console.warn("Failed to save history to backend, saved to local storage"));
      
      setView("results");
    } catch (error: any) {
      console.error("Analysis failed:", error);
      alert(error.message || "画像の解析に失敗しました。もう一度お試しください。");
      setView("camera");
    }
  };

  const handleBack = () => {
    setView("camera");
    setImageSrc(null);
    setResult(null);
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setImageSrc(item.imageSrc);
    setResult(item.result);
    setSavingsMode(item.savingsMode);
    setView("results");
  };

  const handleToggleFavorite = (id: string) => {
    setHistory(prev => {
      const newHistory = prev.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item);
      const item = newHistory.find(i => i.id === id);
      if (item) {
        fetch(`/api/history/${id}/favorite`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isFavorite: item.isFavorite })
        }).catch(err => console.warn("Failed to update favorite on backend"));
      }
      return newHistory;
    });
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    fetch(`/api/history/${id}`, {
      method: "DELETE"
    }).catch(err => console.warn("Failed to delete history on backend"));
  };

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-gray-50 overflow-hidden relative shadow-2xl sm:rounded-[2rem] sm:h-[850px] sm:my-8 sm:border-8 sm:border-gray-200 font-sans text-gray-900">
      {view === "camera" && (
        <CameraView
          onCapture={handleCapture}
          onOpenSettings={() => setView("settings")}
          onOpenHistory={() => setView("history")}
          defaultSavingsMode={settings.defaultSavingsMode}
        />
      )}

      {view === "settings" && (
        <SettingsView
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setView("camera")}
        />
      )}

      {view === "history" && (
        <HistoryView
          history={history}
          onSelect={handleSelectHistory}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDeleteHistory}
          onClose={() => setView("camera")}
        />
      )}

      {view === "loading" && imageSrc && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="relative mb-8">
            <img
              src={imageSrc}
              alt="Analyzing"
              className="w-32 h-32 object-cover rounded-full opacity-80 shadow-md"
            />
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">アイテムを解析中...</h2>
          <p className="text-gray-500 text-sm text-center px-6">
            {savingsMode
              ? "お得な代替品と近くの店舗を探しています"
              : "ブランドを特定し、在庫状況を確認しています"}
          </p>
        </div>
      )}

      {view === "results" && imageSrc && result && (
        <ResultsView
          imageSrc={imageSrc}
          result={result}
          savingsMode={savingsMode}
          onBack={handleBack}
          isFavorite={history.find(h => h.result === result)?.isFavorite || false}
          onToggleFavorite={() => {
            const currentItem = history.find(h => h.result === result);
            if (currentItem) {
              handleToggleFavorite(currentItem.id);
            }
          }}
        />
      )}
      
      <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 z-50 pointer-events-none">
        v3 (キャッシュクリア済)
      </div>
    </div>
  );
}
