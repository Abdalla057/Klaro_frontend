import type { InputHTMLAttributes } from "react";
import { Input as BaseInput } from "../../../shared/ui/input";

/**
 * Champ des formulaires d'authentification.
 *
 * Alias du composant partagé afin que tous les écrans (connexion, inscription,
 * activation) bénéficient du même style de focus et des mêmes états d'erreur.
 */
export const Input = BaseInput;

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default Input;
