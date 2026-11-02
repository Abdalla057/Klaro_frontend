import type { UserRole } from "../../../types/auth";

const SESSION_KEY = "activation_session";

export interface ActivationSession {
  telephone: string;
  token: string;
  role: UserRole;
  expiresAt: number;
}

export function buildActivationSession(
  telephone: string,
  token: string,
  role: UserRole,
  expireDansMinutes: number,
): ActivationSession {
  return {
    telephone,
    token,
    role,
    expiresAt: Date.now() + expireDansMinutes * 60 * 1000,
  };
}

export const activationSession = {
  save(session: ActivationSession) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // Le jeton reste disponible en mémoire si le stockage de session est bloqué.
    }
  },

  get(): ActivationSession | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;

      const session = JSON.parse(raw) as ActivationSession;
      if (!session.token || !session.telephone || session.expiresAt <= Date.now()) {
        activationSession.clear();
        return null;
      }
      return session;
    } catch {
      activationSession.clear();
      return null;
    }
  },

  clear() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Rien à nettoyer si le stockage de session est indisponible.
    }
  },
};
