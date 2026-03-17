import type { Note } from "../types/index.js";

const FRENCH_EDITOR_PROMPT = `Tu es un éditeur de contenu expert spécialisé dans la structuration de transcriptions audio. Je vais te fournir une transcription brute de note vocale contenant plusieurs idées, réflexions ou sujets mélangés de manière désorganisée.

MISSION :
Analyse cette transcription et transforme-la en un document structuré et professionnel en suivant ces étapes :
1. Extraction : Identifie chaque idée, concept ou thème distinct présent dans le texte
2. Classement : Regroupe les idées connexes en chapitres ou parties thématiques logiques
3. Synthèse : Résume et reformule chaque section pour plus de clarté et de concision, sans perdre le sens original
4. Organisation : Réorganise l'ensemble dans un ordre cohérent (chronologique, logique ou par priorité)

FORMAT DE SORTIE (Markdown obligatoire) :
- Titre principal (H1) reflétant le sujet global
- Introduction (2-3 phrases résumant l'essentiel)
- Chapitres/Parties (H2) pour chaque thème majeur identifié
- Sous-sections (H3) si des idées secondaires nécessitent de la profondeur
- Points clés : Listes à puces pour les éléments actionnables ou importants
- Mise en évidence : Texte en gras pour les concepts cruciaux, termes techniques ou conclusions
- Conclusion (optionnelle) : Synthèse finale ou prochaines étapes suggérées

RÈGLES STRICTES :
- Supprime toutes les hésitations verbales ("euh", "ben", "tu vois", "quoi", "en fait", etc.)
- Corrige les tournures de phrase approximatives tout en préservant le ton et l'intention originale de l'orateur
- Si des tâches ou actions sont mentionnées, crée une section "Actions à entreprendre" en fin de document
- Maintiens la langue originale de la transcription
- Ne rajoute pas d'informations absentes du texte source`;

export function buildTranscriptionSummaryPrompt(note: Note): string {
  return `${FRENCH_EDITOR_PROMPT}

Voici la transcription à traiter:

${note.content}`;
}

export function buildChunkSummaryPrompt(chunkContent: string, chunkIndex: number, totalChunks: number): string {
  return `Tu es un éditeur de contenu expert. Tu traites la partie ${chunkIndex + 1} sur ${totalChunks} d'une transcription plus longue.

EXTRAIT DE TRANSCRIPTION:
${chunkContent}

Crée un résumé structuré de cet extrait en identifiant :
- Les thèmes principaux abordés
- Les points clés et décisions
- Les actions éventuellement mentionnées

FORMAT:Utilise des titres H2 pour les thèmes, des listes à puces pour les points importants, et du texte en gras pour les concepts cruciaux.

RÈGLES:
- Supprime les hésitations verbales ("euh", "ben", "tu vois", "quoi", "en fait")
- Corrige les tournures approximatives en préservant l'intention
- Rédige en français

RÉSUMÉ DE L'EXTRAIT:`;
}

export function buildMergeSummariesPrompt(chunkSummaries: string[]): string {
  const summariesList = chunkSummaries.map((s, i) => `--- Partie ${i + 1} ---\n${s}`).join("\n\n");
  
  return `Tu es un éditeur de contenu expert. Tu dois fusionner ${chunkSummaries.length} résumés d'une transcription en un document unique et cohérent.

RÉSUMÉS DES PARTIES:
${summariesList}

Crée un document structuré final en :
1. Identifiant les thèmes transversaux à travers toutes les parties
2. Fusionnant les idées connexes sans répétition
3. Organisant le contenu de manière logique (chronologique ou thématique)

FORMAT DE SORTIE (Markdown obligatoire):
- Titre principal (H1) reflétant le sujet global
- Introduction (2-3 phrases résumant l'essentiel)
- Chapitres (H2) pour chaque thème majeur
- Sous-sections (H3) si nécessaire pour approfondir
- Listes à puces pour les points clés
- Texte en **gras** pour les concepts cruciaux ou conclusions
- Section "Actions à entreprendre" si des tâches ont été mentionnées
- Conclusion (optionnelle)

RÈGLES:
- Évite les répétitions entre les parties
- Préserve tous les points importants
- Rédige en français

DOCUMENT FINAL:`;
}