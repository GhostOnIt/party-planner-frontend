export interface DietaryRestriction {
  id: string;
  name: string;        // Nom de la restriction (version normalisée)
  count: number;       // Nombre d'invités avec cette restriction
  originalTexts: string[]; // Exemples de textes originaux trouvés
}

/**
 * Normalise un texte pour la comparaison (supprime accents, espaces, etc.)
 */
function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime accents
    .replace(/[^\w\s]/g, '') // Supprime ponctuation
    .replace(/\s+/g, ' ') // Normalise espaces
    .trim();
}

/**
 * Extrait les restrictions individuelles d'un texte
 * Gère les séparateurs: virgule, point-virgule, "et", "ou", saut de ligne
 */
function extractRestrictions(text: string): string[] {
  if (!text || text.trim() === '') return [];
  
  // Séparer par virgules, point-virgules, "et", "ou", sauts de ligne
  const separators = /[,;]|\bet\b|\bou\b|\n/i;
  const parts = text.split(separators);
  
  return parts
    .map(part => part.trim())
    .filter(part => part.length > 2); // Ignorer les fragments trop courts
}

/**
 * Trouve une restriction similaire existante ou retourne null
 * Utilise une comparaison souple pour grouper les variations
 */
function findSimilarRestriction(
  restriction: string,
  existingRestrictions: Map<string, DietaryRestriction>
): string | null {
  const normalized = normalizeForComparison(restriction);
  
  if (normalized.length < 3) return null; // Ignorer les textes trop courts
  
  // Chercher une restriction existante similaire
  for (const [key, existing] of existingRestrictions.entries()) {
    const existingNormalized = normalizeForComparison(existing.name);
    
    // Si les versions normalisées sont identiques
    if (normalized === existingNormalized) {
      return key;
    }
    
    // Si l'une contient l'autre (ex: "sans gluten" contient "gluten")
    if (normalized.includes(existingNormalized) || existingNormalized.includes(normalized)) {
      // Vérifier que c'est vraiment similaire (pas juste un mot commun)
      const words1 = normalized.split(' ').filter(w => w.length > 2);
      const words2 = existingNormalized.split(' ').filter(w => w.length > 2);
      
      if (words1.length === 0 || words2.length === 0) continue;
      
      const commonWords = words1.filter(w => words2.includes(w));
      const minWords = Math.min(words1.length, words2.length);
      
      // Si au moins 50% des mots sont communs, considérer comme similaire
      if (commonWords.length > 0 && commonWords.length >= minWords * 0.5) {
        return key;
      }
      
      // Cas spécial : si une restriction est contenue dans l'autre et qu'elles partagent au moins un mot significatif
      if (commonWords.length > 0 && (normalized.length <= existingNormalized.length * 1.5 || existingNormalized.length <= normalized.length * 1.5)) {
        return key;
      }
    }
  }
  
  return null;
}

/**
 * Choisit le meilleur nom pour une restriction parmi ses variations
 * Préfère la version la plus complète et la mieux formatée
 */
function chooseBestName(variations: string[]): string {
  if (variations.length === 0) return '';
  
  // Trier par longueur décroissante (préférer les versions complètes)
  const sorted = [...variations].sort((a, b) => {
    // Préférer les versions avec majuscules appropriées
    const aHasCapital = /^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß]/.test(a);
    const bHasCapital = /^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞß]/.test(b);
    
    if (aHasCapital && !bHasCapital) return -1;
    if (!aHasCapital && bHasCapital) return 1;
    
    return b.length - a.length;
  });
  
  // Capitaliser la première lettre si nécessaire
  const best = sorted[0].trim();
  if (best.length === 0) return '';
  
  return best.charAt(0).toUpperCase() + best.slice(1).toLowerCase();
}

/**
 * Analyse une liste d'invités et retourne les restrictions les plus fréquentes
 * Sans catégories prédéfinies - basé uniquement sur les données réelles
 */
export function analyzeDietaryRestrictions(
  guests: Array<{ dietary_restrictions: string | null }>,
  minOccurrences: number = 1 // Minimum d'occurrences pour afficher
): DietaryRestriction[] {
  // 1. Extraire toutes les restrictions de tous les invités
  const allRestrictions: string[] = [];
  
  guests.forEach(guest => {
    if (!guest.dietary_restrictions) return;
    const extracted = extractRestrictions(guest.dietary_restrictions);
    allRestrictions.push(...extracted);
  });
  
  if (allRestrictions.length === 0) {
    return [];
  }
  
  // 2. Grouper les restrictions similaires
  const restrictionGroups = new Map<string, DietaryRestriction>();
  
  allRestrictions.forEach(restriction => {
    const similarKey = findSimilarRestriction(restriction, restrictionGroups);
    
    if (similarKey) {
      // Ajouter à un groupe existant
      const existing = restrictionGroups.get(similarKey)!;
      existing.count++;
      
      // Ajouter le texte original s'il est différent
      if (!existing.originalTexts.includes(restriction)) {
        existing.originalTexts.push(restriction);
      }
      
      // Mettre à jour le nom si cette version est meilleure
      const bestName = chooseBestName(existing.originalTexts);
      if (bestName !== existing.name && bestName.length > 0) {
        const oldKey = similarKey;
        existing.name = bestName;
        const newKey = normalizeForComparison(bestName);
        
        // Mettre à jour la clé si nécessaire
        if (oldKey !== newKey) {
          restrictionGroups.delete(oldKey);
          restrictionGroups.set(newKey, existing);
        } else {
          existing.id = newKey;
        }
      }
    } else {
      // Créer un nouveau groupe
      const normalizedKey = normalizeForComparison(restriction);
      restrictionGroups.set(normalizedKey, {
        id: normalizedKey,
        name: restriction.trim(),
        count: 1,
        originalTexts: [restriction],
      });
    }
  });
  
  // 3. Convertir en tableau, filtrer et trier
  const restrictions: DietaryRestriction[] = Array.from(restrictionGroups.values())
    .filter(restriction => restriction.count >= minOccurrences)
    .sort((a, b) => b.count - a.count); // Trier par fréquence décroissante
  
  return restrictions;
}

/**
 * Obtient la couleur du badge selon la fréquence
 * Plus fréquent = couleur plus visible
 */
export function getRestrictionBadgeColor(count: number, maxCount: number): string {
  if (maxCount === 0) return 'bg-gray-100 text-gray-700 border-gray-200';
  
  const percentage = count / maxCount;
  
  // Plus fréquent = couleur plus intense
  if (percentage >= 0.5) {
    return 'bg-blue-100 text-blue-700 border-blue-200'; // Très fréquent (≥50%)
  } else if (percentage >= 0.25) {
    return 'bg-purple-100 text-purple-700 border-purple-200'; // Fréquent (≥25%)
  } else {
    return 'bg-gray-100 text-gray-700 border-gray-200'; // Moins fréquent (<25%)
  }
}
