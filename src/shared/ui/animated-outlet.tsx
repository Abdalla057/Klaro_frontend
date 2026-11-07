import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocation, useOutlet } from "react-router-dom";
import { EASE_OUT } from "./motion-tokens";

/**
 * AnimatedOutlet
 *
 * Rend la page active avec une transition légère lors des changements de route.
 * L'ancienne page est démontée après son animation de sortie grâce à
 * `AnimatePresence` en mode `wait`. Le key sur le pathname garantit que chaque
 * route possède sa propre animation d'entrée.
 */
export function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();
  const reduce = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 1 } : { opacity: 0, y: -8 }}
        transition={{ duration: 0.24, ease: EASE_OUT }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}
