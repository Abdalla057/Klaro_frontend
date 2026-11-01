import axios from "axios";

type ApiErrorResult = {
  message: string;
  fields: Record<string, string>;
  status?: number;
  code?: string;
};

type ApiErrorOptions = {
  unauthorizedMessage?: string;
};

function toText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(" ");
  return "";
}

export function getApiError(error: unknown, options: ApiErrorOptions = {}): ApiErrorResult {
  if (!axios.isAxiosError(error)) {
    return { message: "Une erreur inattendue est survenue.", fields: {} };
  }

  if (error.code === "ECONNABORTED") {
    return { message: "Le serveur met trop de temps à répondre. Réessayez.", fields: {} };
  }

  if (!error.response) {
    return { message: "Impossible de joindre le serveur. Vérifiez votre connexion.", fields: {} };
  }

  const status = error.response.status;
  const data = error.response.data;

  if (status === 401) {
    return {
      message: options.unauthorizedMessage ?? "Votre session a expiré. Reconnectez-vous.",
      fields: {},
      status,
    };
  }

  if (typeof data === "string" && data.trim()) {
    return { message: data, fields: {}, status };
  }

  if (data && typeof data === "object") {
    const fields: Record<string, string> = {};
    let message = "";
    let code: string | undefined;

    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const text = toText(value);
      if (!text) continue;

      if (key === "detail" || key === "non_field_errors" || key === "message") {
        message ||= text;
      } else if (key === "code") {
        code = text;
      } else {
        fields[key] = text;
      }
    }

    if (message || Object.keys(fields).length) {
      return {
        message: message || Object.values(fields)[0],
        fields,
        status,
        code,
      };
    }
  }

  if (status === 403) {
    return {
      message: "Vous n'avez pas les droits nécessaires pour cette action.",
      fields: {},
      status,
    };
  }

  if (status === 404) {
    return { message: "La ressource demandée est introuvable.", fields: {}, status };
  }

  if (status >= 500) {
    return {
      message: "Le serveur rencontre un problème. Réessayez plus tard.",
      fields: {},
      status,
    };
  }

  return { message: "La requête n'a pas pu être traitée.", fields: {}, status };
}
