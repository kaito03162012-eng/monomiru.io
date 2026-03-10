import React from "react";
import { ArrowLeft, Clock, Trash2, Star, ChevronRight } from "lucide-react";
import { HistoryItem } from "../App";

interface HistoryViewProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function HistoryView({
  history,
  onSelect,
  onToggleFavorite,
  onDelete,
  onClose,
}: HistoryViewProps) {
  return (
    <div className="h-full w-full bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-200 z-20 sticky top-0">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">履歴・お気に入り</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Clock className="w-12 h-12 mb-4 opacity-20" />
            <p>履歴がありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex items-center gap-4 group"
              >
                <button
                  onClick={() => onSelect(item)}
                  className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative"
                >
                  <img
                    src={item.imageSrc}
                    alt={item.result.identifiedItem.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </button>

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onSelect(item)}
                >
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {item.result.identifiedItem.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate mb-1">
                    {item.result.identifiedItem.brand}
                  </p>
                  <p className="text-xs font-medium text-blue-600">
                    {item.result.identifiedItem.estimatedPrice}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className="p-2 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        item.isFavorite
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="p-2 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
