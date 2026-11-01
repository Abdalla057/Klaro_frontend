import { useState } from "react";
import { Check, Copy, KeyRound } from "lucide-react";
import { Alert } from "../../../shared/ui/alert";
import { Button } from "../../../shared/ui/button/button";
import { Modal } from "../../../shared/ui/modal";

export function ActivationCodeModal({
  telephone,
  code,
  role,
  onClose,
}: {
  telephone: string;
  code: string | null;
  role: "client" | "agent";
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Code d'activation"
      description={`Compte ${role === "client" ? "client" : "agent"} : ${telephone}`}
      size="sm"
    >
      <div className="space-y-4">
        <Alert variant="info">
          Communiquez ce code manuellement. Le destinataire doit ouvrir la page « Activer mon
          compte » et choisir son mot de passe. Le code est valable 10 minutes et ne sera plus
          affiché après la fermeture de cette fenêtre.
        </Alert>

        {code ? (
          <div className="rounded-2xl border border-brand/15 bg-brand-soft px-5 py-6 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wider text-brand">
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              Code à 6 chiffres
            </div>
            <p className="mt-2 text-4xl font-semibold tracking-[0.35em] text-brand">{code}</p>
          </div>
        ) : (
          <Alert variant="warning">
            Le code a été généré, mais il n'a pas été retourné par le serveur. Demandez un
            nouveau code.
          </Alert>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button
            type="button"
            onClick={handleCopy}
            disabled={!code}
            className="bg-brand text-white hover:bg-brand-dark"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copié" : "Copier le code"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
