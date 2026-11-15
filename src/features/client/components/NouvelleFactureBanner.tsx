import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Printer, ReceiptText } from "lucide-react";
import { Button } from "../../../shared/ui/button/button";
import { getApiError } from "../../../services/apiError";
import {
  getAllNotifications,
  marquerNotificationLue,
  ouvrirFacturePdf,
} from "../../../services/commerceService";
import type { NotificationClient } from "../../../types/commerce";

export function NouvelleFactureBanner() {
  const [notification, setNotification] = useState<NotificationClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getAllNotifications()
      .then((result) => {
        if (cancelled) return;
        const latest = result.items.find(
          (item) => !item.lue && item.type_notification === "NOUVELLE_FACTURE",
        );
        setNotification(latest ?? null);
      })
      .catch(() => {
        if (!cancelled) setNotification(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const marquerLue = () => {
    if (!notification || notification.lue) return;
    void marquerNotificationLue(notification.id).catch(() => undefined);
  };

  const handleImprimer = async () => {
    if (!notification?.facture) return;
    marquerLue();
    setPdfLoading(true);
    setError(null);

    try {
      await ouvrirFacturePdf(notification.facture);
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading || !notification) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-brand/15 bg-brand-soft/50 p-5 shadow-card">
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-brand/10 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
            <ReceiptText className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
              NOUVELLE FACTURE DISPONIBLE
            </p>
            <p className="mt-1 text-sm font-medium text-ink">
              {notification.facture_numero ?? notification.titre}
            </p>
            <p className="mt-0.5 text-sm text-muted">{notification.message}</p>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/client/factures" onClick={marquerLue}>
              Consulter ma facture
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            type="button"
            onClick={handleImprimer}
            disabled={pdfLoading || !notification.facture}
          >
            <Printer className="h-4 w-4" />
            {pdfLoading ? "Ouverture..." : "Imprimer ma facture"}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default NouvelleFactureBanner;
