import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button/button";

/**
 * ErrorState
 *
 * Message d'erreur de chargement avec action de nouvelle tentative.
 * Utilisé lorsqu'une ressource principale ne peut pas être affichée.
 */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/70 px-6 py-10 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-red-800">Impossible de charger les données</h3>
      <p className="mt-1 max-w-md text-sm text-red-700">{message}</p>
      {onRetry && (
        <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </Button>
      )}
    </div>
  );
}
