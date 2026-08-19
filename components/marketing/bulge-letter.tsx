/**
 * Une lettre du titre qui "gonfle" brièvement à intervalle régulier — utilisé
 * lettre par lettre sur "QualiopiPilote" pour donner l'impression que la
 * sphère de points qui traverse le titre (cf. TravelingSphere) le fait
 * bomber sur son passage. Chaque lettre partage la même animation de 6s
 * (synchronisée avec le trajet de la sphère) mais avec un décalage négatif
 * différent, ce qui crée une vague qui part de "Qualiopi" et va jusqu'à
 * "Pilote". Purement CSS (aucun JavaScript nécessaire pour l'effet).
 */
export function BulgeLetter({ children, index }: { children: string; index: number }) {
  if (children === " ") {
    return <span> </span>;
  }

  return (
    <span
      className="inline-block animate-letter-bulge motion-reduce:animate-none"
      style={{ animationDelay: `${index * -0.35}s` }}
    >
      {children}
    </span>
  );
}
