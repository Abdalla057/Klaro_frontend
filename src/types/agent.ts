export interface CollecteEncaissementRequest {
  client: number;
  montant: string;
  commentaire?: string;
}

export interface ConfirmationEncaissementCodeRequest {
  code: string;
}

export interface AgentDashboardStats {
  totalEncaissements: number;
  confirmes: number;
  enAttente: number;
  annules: number;
  montantConfirme: number;
  montantEnAttente: number;
  decaissementsAConfirmer: number;
  mesRecouvrements: number;
  montantCollecte: number;
  clientsActifs: number;
}
