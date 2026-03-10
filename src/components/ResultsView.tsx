import React from "react";
import {
  ArrowLeft,
  MapPin,
  Tag,
  ShoppingBag,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Share,
  Star,
  Search,
  Lightbulb,
} from "lucide-react";
import { AIResult } from "../services/ai";
import { motion } from "motion/react";

interface ResultsViewProps {
  imageSrc: string;
  result: AIResult;
  savingsMode: boolean;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function ResultsView({
  imageSrc,
  result,
  savingsMode,
  onBack,
  isFavorite,
  onToggleFavorite,
}: ResultsViewProps) {
  const handleShare = async () => {
    const text =
      savingsMode && result.alternativeItem
        ? `AIが見つけた代替品: ${result.alternativeItem.brand}の${result.alternativeItem.name} (${result.alternativeItem.estimatedPrice})`
        : `AIが見つけたアイテム: ${result.identifiedItem.brand}の${result.identifiedItem.name} (${result.identifiedItem.estimatedPrice})`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "ショッピングアシスタント",
          text: text,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("クリップボードにコピーしました");
    }
  };

  return (
    <div className="h-full w-full bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200 z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-base font-semibold text-gray-900">解析結果</h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleFavorite}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="お気に入り"
          >
            <Star className={`w-5 h-5 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-700"}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="共有"
          >
            <Share className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Image Header */}
        <div className="relative h-64 w-full bg-gray-900">
          <img
            src={imageSrc}
            alt="Captured item"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <span className="inline-block bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-medium mb-2">
              特定アイテム
            </span>
            <h2 className="text-2xl font-bold leading-tight mb-1">
              {result.identifiedItem.name}
            </h2>
            <p className="text-white/80 text-sm">
              {result.identifiedItem.brand}
            </p>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Original Item Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-1">
                  予想価格
                </h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {result.identifiedItem.estimatedPrice}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <Tag className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {result.identifiedItem.description}
            </p>

            {/* AI Advice */}
            {result.identifiedItem.advice && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex gap-3">
                <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-amber-800 mb-1">AIワンポイントアドバイス</h4>
                  <p className="text-sm text-amber-900 leading-relaxed">{result.identifiedItem.advice}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Online Shopping Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 px-1">
              <Search className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900 text-sm">
                オンラインで探す
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://www.amazon.co.jp/s?k=${encodeURIComponent(result.identifiedItem.brand + " " + result.identifiedItem.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Amazon</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>
              <a
                href={`https://search.rakuten.co.jp/search/mall/${encodeURIComponent(result.identifiedItem.brand + " " + result.identifiedItem.name)}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">楽天市場</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            </div>
          </motion.div>

          {/* Savings Mode Alternative */}
          {savingsMode && result.alternativeItem && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-blue-50 rounded-2xl p-5 border border-blue-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Sparkles className="w-32 h-32 text-blue-600" />
              </div>

              <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-blue-900 text-sm">
                  AI 節約オルタナティブ
                </h3>
              </div>

              <div className="relative z-10">
                <h4 className="text-lg font-bold text-gray-900 mb-1">
                  {result.alternativeItem.name}
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  {result.alternativeItem.brand}
                </p>

                <div className="flex items-end gap-3 mb-4">
                  <p className="text-3xl font-semibold text-blue-600">
                    {result.alternativeItem.estimatedPrice}
                  </p>
                  <p className="text-sm text-gray-400 line-through mb-1">
                    {result.identifiedItem.estimatedPrice}
                  </p>
                </div>

                <div className="bg-white/60 rounded-xl p-4 border border-white">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-semibold block mb-1 text-xs text-gray-500">
                      おすすめの理由:
                    </span>
                    {result.alternativeItem.reason}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Nearby Stores */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 px-1">
              <MapPin className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900 text-sm">
                近くの取扱店舗
              </h3>
            </div>

            <div className="space-y-3">
              {result.nearbyStores.map((store, idx) => (
                <a
                  key={idx}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.searchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-gray-300 transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div className="pr-4">
                      <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        {store.name}
                        <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600" />
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {store.reason}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-full group-hover:bg-blue-50 transition-colors flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                    </div>
                  </div>
                </a>
              ))}

              {result.nearbyStores.length === 0 && (
                <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
                  <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    近くに取扱店舗が見つかりませんでした。
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
