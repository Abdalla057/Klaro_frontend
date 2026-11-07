import type {
  AbonnementAdmin,
  AbonnementStatut,
  FournisseurSupervision,
  PaiementAbonnement,
  PeriodeStatistique,
  SerieChiffreAffaires,
  StatistiquesFinancieres,
  StatistiquesFinancieresDevise,
} from "../../../types/superAdmin";

/* ------------------------------------------------------------------ */
/* Périodes                                                            */
/* ------------------------------------------------------------------ */

export type PeriodeUI = "semaine" | "mois" | "annee";

export const PERIODES_UI: { value: PeriodeUI; label: string }[] = [
  { value: "semaine", label: "Semaine" },
  { value: "mois", label: "Mois" },
  { value: "annee", label: "Année" },
];

export const PERIODE_API: Record<PeriodeUI, PeriodeStatistique> = {
  semaine: "hebdomadaire",
  mois: "mensuelle",
  annee: "annuelle",
};

/** Granularité demandée au backend : jour pour semaine/mois, mois pour l'année. */
export const GRANULARITE_API: Record<PeriodeUI, "jour" | "mois"> = {
  semaine: "jour",
  mois: "jour",
  annee: "mois",
};

/* ------------------------------------------------------------------ */
/* Dates (calculs en heure locale, sur des chaînes AAAA-MM-JJ)          */
/* ------------------------------------------------------------------ */

function parseJour(valeur: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valeur);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function cleJour(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const jj = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${jj}`;
}

function cleMois(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MOIS_COURT = new Intl.DateTimeFormat("fr-FR", { month: "short" });
const JOUR_SEMAINE = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
const JOUR_MOIS_COURT = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" });
const JOUR_LONG = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const MOIS_LONG = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

function capitaliser(s: string) {
  const nettoye = s.replace(".", "");
  return nettoye.charAt(0).toUpperCase() + nettoye.slice(1);
}

/* ------------------------------------------------------------------ */
/* Série du chiffre d'affaires                                          */
/* ------------------------------------------------------------------ */

export interface PointCA {
  date: string;
  label: string;
  titre: string;
  montant: number;
  paiements: number;
}

export function pointsChiffreAffaires(
  serie: SerieChiffreAffaires | null,
  devise: string | undefined,
  periode: PeriodeUI,
): PointCA[] {
  if (!serie) return [];
  const courbe = serie.devises.find((d) => d.devise === devise) ?? serie.devises[0];
  const parDate = new Map<string, { montant: number; paiements: number }>();
  const mensuel = serie.granularite === "mois";

  for (const p of courbe?.points ?? []) {
    const cle = mensuel ? p.date.slice(0, 7) : p.date.slice(0, 10);
    const ancien = parDate.get(cle) ?? { montant: 0, paiements: 0 };
    parDate.set(cle, {
      montant: ancien.montant + Number(p.montant),
      paiements: ancien.paiements + p.nombre_paiements,
    });
  }

  const debut = parseJour(serie.date_debut);
  const fin = parseJour(serie.date_fin);
  const cles: string[] = [];

  if (debut && fin && fin >= debut) {
    const curseur = new Date(debut.getFullYear(), debut.getMonth(), mensuel ? 1 : debut.getDate());
    while (curseur <= fin && cles.length < 400) {
      cles.push(mensuel ? cleMois(curseur) : cleJour(curseur));
      if (mensuel) curseur.setMonth(curseur.getMonth() + 1);
      else curseur.setDate(curseur.getDate() + 1);
    }
  }
  // Repli : si la plage est inexploitable, on utilise uniquement les dates reçues.
  for (const cle of parDate.keys()) if (!cles.includes(cle)) cles.push(cle);
  cles.sort();

  return cles.map((cle) => {
    const valeur = parDate.get(cle) ?? { montant: 0, paiements: 0 };
    const date = parseJour(mensuel ? `${cle}-01` : cle) ?? new Date();
    let label: string;
    if (mensuel) label = capitaliser(MOIS_COURT.format(date));
    else if (periode === "semaine") label = capitaliser(JOUR_SEMAINE.format(date));
    else label = String(date.getDate());
    return {
      date: cle,
      label,
      titre: capitaliser(mensuel ? MOIS_LONG.format(date) : JOUR_LONG.format(date)),
      montant: valeur.montant,
      paiements: valeur.paiements,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Indicateurs financiers par période                                   */
/* ------------------------------------------------------------------ */

export function indicateursPeriode(
  source: StatistiquesFinancieresDevise | StatistiquesFinancieres | null | undefined,
  periode: PeriodeUI,
) {
  if (!source) return { montant: null as string | null, evolution: null as number | null };
  const montant =
    periode === "semaine"
      ? source.chiffre_affaires_semaine
      : periode === "mois"
        ? source.chiffre_affaires_mois
        : source.chiffre_affaires_annee;
  const brut =
    periode === "semaine"
      ? source.evolution.semaine
      : periode === "mois"
        ? source.evolution.mois
        : source.evolution.annee;
  const nombre = brut === null || brut === undefined ? null : Number(brut);
  return { montant, evolution: nombre === null || Number.isNaN(nombre) ? null : nombre };
}

/* ------------------------------------------------------------------ */
/* Statuts des abonnements par période (calculé depuis la liste réelle)  */
/* ------------------------------------------------------------------ */

export const STATUTS_ORDRE: AbonnementStatut[] = ["ACTIF", "EXPIRE", "SUSPENDU", "ANNULE"];

export const STATUT_COULEUR: Record<AbonnementStatut, string> = {
  ACTIF: "#4a9a81",
  EXPIRE: "#f9cf4a",
  SUSPENDU: "#f2a98b",
  ANNULE: "#b7c4c1",
};

export const STATUT_LIBELLE: Record<AbonnementStatut, string> = {
  ACTIF: "Actifs",
  EXPIRE: "Expirés",
  SUSPENDU: "Suspendus",
  ANNULE: "Annulés",
};

/** Statut réel d'un abonnement (tient compte de l'expiration calculée par le backend). */
export function statutAbonnement(a: Pick<AbonnementAdmin, "statut" | "statut_effectif">): AbonnementStatut {
  const brut = (a.statut_effectif || a.statut || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
  if (brut.includes("EXPIR")) return "EXPIRE";
  if (brut.includes("SUSPEN")) return "SUSPENDU";
  if (brut.includes("ANNUL")) return "ANNULE";
  if (brut.includes("ACTIF")) return "ACTIF";
  return a.statut;
}

export interface BarreStatuts {
  cle: string;
  label: string;
  titre: string;
  ACTIF: number;
  EXPIRE: number;
  SUSPENDU: number;
  ANNULE: number;
  total: number;
  /** Complément jusqu'au maximum : dessine le rail clair derrière chaque barre. */
  piste: number;
}

export function statutsParPeriode(abonnements: AbonnementAdmin[], periode: PeriodeUI): BarreStatuts[] {
  const maintenant = new Date();
  const aujourdhui = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
  const seaux: { debut: Date; fin: Date; label: string; titre: string }[] = [];

  if (periode === "annee") {
    for (let i = 11; i >= 0; i -= 1) {
      const debut = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth() - i, 1);
      const fin = new Date(debut.getFullYear(), debut.getMonth() + 1, 1);
      seaux.push({
        debut,
        fin,
        label: capitaliser(MOIS_COURT.format(debut)).slice(0, 4),
        titre: capitaliser(MOIS_LONG.format(debut)),
      });
    }
  } else if (periode === "mois") {
    // 30 derniers jours, regroupés par tranches de 3 jours.
    for (let i = 9; i >= 0; i -= 1) {
      const fin = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate() - i * 3 + 1);
      const debut = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate() - 3);
      const dernier = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate() - 1);
      seaux.push({
        debut,
        fin,
        label: String(debut.getDate()),
        titre: `${JOUR_MOIS_COURT.format(debut)} – ${JOUR_MOIS_COURT.format(dernier)}`,
      });
    }
  } else {
    for (let i = 6; i >= 0; i -= 1) {
      const debut = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate() - i);
      const fin = new Date(debut.getFullYear(), debut.getMonth(), debut.getDate() + 1);
      seaux.push({
        debut,
        fin,
        label: capitaliser(JOUR_SEMAINE.format(debut)),
        titre: capitaliser(JOUR_LONG.format(debut)),
      });
    }
  }

  const barres: BarreStatuts[] = seaux.map((s) => ({
    cle: cleJour(s.debut),
    label: s.label,
    titre: s.titre,
    ACTIF: 0,
    EXPIRE: 0,
    SUSPENDU: 0,
    ANNULE: 0,
    total: 0,
    piste: 0,
  }));

  for (const abonnement of abonnements) {
    const date = new Date(abonnement.date_debut);
    if (Number.isNaN(date.getTime())) continue;
    const index = seaux.findIndex((s) => date >= s.debut && date < s.fin);
    if (index < 0) continue;
    const statut = statutAbonnement(abonnement);
    if (statut in barres[index]) {
      barres[index][statut] += 1;
      barres[index].total += 1;
    }
  }

  const maximum = Math.max(1, ...barres.map((b) => b.total));
  for (const b of barres) b.piste = maximum - b.total;

  return barres;
}

/* ------------------------------------------------------------------ */
/* Alertes                                                              */
/* ------------------------------------------------------------------ */

export const SEUIL_EXPIRATION_JOURS = 7;

export interface AlerteAdmin {
  id: string;
  niveau: "warning" | "danger" | "info";
  titre: string;
  detail: string;
  nombre: number;
  to: string;
}

export function calculerAlertes(
  abonnements: AbonnementAdmin[],
  paiements: PaiementAbonnement[],
  fournisseurs: FournisseurSupervision[],
): AlerteAdmin[] {
  const alertes: AlerteAdmin[] = [];

  const bientotExpires = abonnements.filter(
    (a) =>
      statutAbonnement(a) === "ACTIF" &&
      a.jours_restants >= 0 &&
      a.jours_restants <= SEUIL_EXPIRATION_JOURS,
  );
  if (bientotExpires.length) {
    alertes.push({
      id: "expiration",
      niveau: "warning",
      titre: "Abonnements bientôt expirés",
      detail: `${bientotExpires.length} abonnement(s) expirent dans ${SEUIL_EXPIRATION_JOURS} jours ou moins`,
      nombre: bientotExpires.length,
      to: "/admin/abonnements?filtre=expiration",
    });
  }

  const suspendus = abonnements.filter((a) => statutAbonnement(a) === "SUSPENDU");
  if (suspendus.length) {
    alertes.push({
      id: "suspendus",
      niveau: "danger",
      titre: "Abonnements suspendus",
      detail: `${suspendus.length} abonnement(s) suspendu(s)`,
      nombre: suspendus.length,
      to: "/admin/abonnements?statut=SUSPENDU",
    });
  }

  const enAttente = paiements.filter((p) => p.statut === "EN_ATTENTE");
  if (enAttente.length) {
    alertes.push({
      id: "paiements",
      niveau: "warning",
      titre: "Paiements en attente",
      detail: `${enAttente.length} paiement(s) à confirmer ou refuser`,
      nombre: enAttente.length,
      to: "/admin/paiements?statut=EN_ATTENTE",
    });
  }

  const attention = fournisseurs.filter(
    (f) => f.est_suspendu || !f.abonnement || !f.abonnement.est_actif,
  );
  if (attention.length) {
    alertes.push({
      id: "fournisseurs",
      niveau: "info",
      titre: "Fournisseurs à surveiller",
      detail: `${attention.length} fournisseur(s) suspendu(s) ou sans abonnement actif`,
      nombre: attention.length,
      to: "/admin/fournisseurs?filtre=attention",
    });
  }

  return alertes;
}
