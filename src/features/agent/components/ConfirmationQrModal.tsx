import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { Camera, CheckCircle2, QrCode, RotateCcw, ScanLine, ShieldCheck } from "lucide-react";
import { confirmerEncaissementParCode } from "../../../services/encaissementService";
import { getApiError } from "../../../services/apiError";
import type { Encaissement } from "../../../types/fournisseur";
import { formatMoney } from "../../../shared/utils/format";
import { Alert } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button/button";
import { Input } from "../../../shared/ui/input";
import { Modal } from "../../../shared/ui/modal";

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

function extractCode(value: string): string {
  const match = value.match(UUID_PATTERN);
  return (match?.[0] ?? value).trim();
}

export function ConfirmationQrModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (encaissement: Encaissement) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanKey, setScanKey] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<Encaissement | null>(null);

  useEffect(() => {
    if (!open || result) return;

    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    let controls: IScannerControls | undefined;
    const reader = new BrowserQRCodeReader();

    setScanning(true);
    setScanError(null);

    reader
      .decodeFromVideoDevice(undefined, video, (decoded, _error, scannerControls) => {
        if (cancelled || !decoded) return;
        cancelled = true;
        scannerControls.stop();
        setCode(extractCode(decoded.getText()));
        setScanning(false);
      })
      .then((scannerControls) => {
        controls = scannerControls;
        if (cancelled) scannerControls.stop();
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setScanning(false);
        setScanError(
          error instanceof Error
            ? error.message
            : "Impossible d'accéder à la caméra. Utilisez la saisie manuelle.",
        );
      });

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [open, scanKey, result]);

  const resetScan = () => {
    setCode("");
    setScanError(null);
    setFormError(null);
    setResult(null);
    setSubmitting(false);
    setScanKey((key) => key + 1);
  };

  const handleClose = () => {
    setCode("");
    setScanError(null);
    setFormError(null);
    setResult(null);
    setSubmitting(false);
    setScanKey(0);
    onClose();
  };

  const handleConfirm = async () => {
    const cleanCode = extractCode(code);
    if (!cleanCode) {
      setFormError("Scannez le QR code ou saisissez le code de confirmation.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const encaissement = await confirmerEncaissementParCode({ code: cleanCode });
      setResult(encaissement);
      onSuccess(encaissement);
    } catch (error) {
      setFormError(getApiError(error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Confirmer par QR code"
      description="Scannez le QR code affiché par le client ou saisissez son code de confirmation."
      size="lg"
    >
      <div className="space-y-5">
        {result ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-3 text-base font-semibold text-emerald-900">
              Encaissement confirmé
            </h3>
            <p className="mt-1 text-sm text-emerald-700">
              Le paiement #{result.id} de {formatMoney(result.montant)} a été confirmé.
            </p>
            <div className="mt-4 flex flex-col-reverse justify-center gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={resetScan}>
                <RotateCcw className="h-4 w-4" />
                Scanner un autre code
              </Button>
              <Button type="button" className="bg-brand text-white hover:bg-brand-dark" onClick={handleClose}>
                Terminer
              </Button>
            </div>
          </div>
        ) : (
          <>
            {scanError && (
              <Alert variant="warning" title="Caméra indisponible">
                {scanError} Vous pouvez saisir le code manuellement ci-dessous.
              </Alert>
            )}
            {formError && <Alert variant="error">{formError}</Alert>}

            <div className="relative overflow-hidden rounded-2xl bg-brand-dark">
              <video
                ref={videoRef}
                className="aspect-video w-full object-cover"
                muted
                playsInline
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-48 w-48 rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(8,42,33,0.28)]">
                  <span className="absolute -left-1 -top-1 h-6 w-6 rounded-tl-xl border-l-4 border-t-4 border-emerald-300" />
                  <span className="absolute -right-1 -top-1 h-6 w-6 rounded-tr-xl border-r-4 border-t-4 border-emerald-300" />
                  <span className="absolute -bottom-1 -left-1 h-6 w-6 rounded-bl-xl border-b-4 border-l-4 border-emerald-300" />
                  <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-br-xl border-b-4 border-r-4 border-emerald-300" />
                  {scanning && (
                    <span className="absolute inset-x-3 top-1/2 h-0.5 animate-pulse bg-emerald-300/90" />
                  )}
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/50 to-transparent px-4 pb-3 pt-8 text-xs font-medium text-white/80">
                <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                {scanning ? "Recherche d'un QR code..." : "Placez le QR code dans le cadre"}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-ink">
                <QrCode className="h-4 w-4 text-brand" aria-hidden="true" />
                Code de confirmation
              </div>
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Code détecté ou saisi manuellement"
                className="mt-2 bg-white font-mono text-xs"
              />
              <p className="mt-2 flex items-start gap-1.5 text-xs text-muted">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                La confirmation est définitive et met à jour le solde du client.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" onClick={resetScan}>
                <RotateCcw className="h-4 w-4" />
                Relancer le scan
              </Button>
              <Button
                type="button"
                className="bg-brand text-white hover:bg-brand-dark"
                onClick={handleConfirm}
                disabled={submitting || !code.trim()}
              >
                <ScanLine className="h-4 w-4" />
                {submitting ? "Confirmation..." : "Confirmer l'encaissement"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
