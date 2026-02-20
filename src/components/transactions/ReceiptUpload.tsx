"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Upload, Loader2, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ParsedReceipt {
  amount: number;
  description: string;
  date: string;
  type: "INCOME" | "EXPENSE";
  categoryId: string;
  confidence: number;
}

interface ReceiptUploadProps {
  onParsed: (data: ParsedReceipt) => void;
  onClose: () => void;
}

export function ReceiptUpload({ onParsed, onClose }: ReceiptUploadProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Solo se aceptan imágenes (JPG, PNG, WebP)");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("La imagen es demasiado grande (máx. 10MB)");
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Send to API
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("receipt", file);

        const res = await fetch("/api/receipts/parse", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Error al analizar");
        }

        toast.success(
          `Ticket analizado (${data.confidence}% confianza)`,
          { description: `${data.description} — ${data.amount}€` }
        );

        onParsed(data);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Error al analizar el recibo"
        );
        setPreview(null);
      } finally {
        setLoading(false);
      }
    },
    [onParsed]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) processFile(file);
          break;
        }
      }
    },
    [processFile]
  );

  return (
    <div
      className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 space-y-4 animate-fade-in-up"
      onPaste={handlePaste}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-text-primary">
            Escanear ticket con IA
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-4 h-4 text-text-muted" />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-sm text-text-secondary">
            Analizando imagen con IA...
          </p>
          {preview && (
            <img
              src={preview}
              alt="Receipt preview"
              className="mt-2 max-h-32 rounded-lg opacity-50"
            />
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center py-10 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragOver
              ? "border-emerald-400 bg-emerald-400/[0.05]"
              : "border-white/[0.12] hover:border-white/[0.20] hover:bg-white/[0.02]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFile(file);
            }}
          />

          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-400/[0.10] flex items-center justify-center">
              <Camera className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-400/[0.10] flex items-center justify-center">
              <Upload className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          <p className="text-sm font-medium text-text-primary mb-1">
            Sube una foto del ticket o screenshot
          </p>
          <p className="text-xs text-text-muted text-center">
            Arrastra, haz click, pega (Ctrl+V) o usa la cámara
          </p>
          <p className="text-xs text-text-muted mt-1">
            JPG, PNG, WebP — máx. 10MB
          </p>
        </div>
      )}
    </div>
  );
}
