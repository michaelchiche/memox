export function buildKeywordExtractionPrompt(noteContent: string): string {
  return `Extrais les mots-clés et entités importantes de cette transcription.

TRANSCRIPTION:
${noteContent}

INSTRUCTIONS:
1. Identifie les noms propres (personnes, lieux, projets)
2. Identifie les concepts clés (sujets, thèmes)
3. Identifie les actions principales
4. Ignore les mots génériques (le, la, les, de, etc.)

Format de réponse: tableau JSON
["keyword1", "keyword2", "keyword3"]

MOTS-CLÉS:`;
}

export function buildTopicClassificationPrompt(
  keywords: string[],
  existingTopics: string[]
): string {
  const existingList = existingTopics.length > 0 ? existingTopics.join(", ") : "Aucun";
  
  return `Tu es un assistant qui propose des topics pertinents pour organiser des notes.

MOTS-CLÉS EXTRAITS: ${keywords.join(", ")}
TOPICS EXISTANTS: ${existingList}

INSTRUCTIONS:
1. Associe les mots-clés aux topics existants si pertinent (score de confiance >= 50%)
2. Propose des nouveaux topics SPÉCIFIQUES basés sur les mots-clés non couverts
3. Les topics doivent être ACTIONNABLES (permettent de retrouver la note facilement)
4. En français, avec MAJUSCULE sur les mots principaux

CRITÈRES D'UN BON TOPIC:
- Spécifique: "Projet Alpha" > "Projet", "Budget Q2" > "Finance"
- Concis: 1-3 mots max
- Actionnable: Permet de retrouver facilement la note

EXEMPLES:
Keywords: ["Marie", "projet alpha", "appeler", "rapport"]
Topics existants: ["Travail", "Marie"]
✓ Réponse: {"rankedTopics": [{"topicName": "Marie", "confidence": 90}], "suggestedNewTopics": ["Projet Alpha", "Rapport"]}

Keywords: ["courses", "lait", "ce soir"]
Topics existants: ["Maison"]
✓ Réponse: {"rankedTopics": [], "suggestedNewTopics": ["Courses"]}

RÉPONDS EN JSON:
{
  "rankedTopics": [{"topicName": "...", "confidence": 0-100}],
  "suggestedNewTopics": ["Topic 1", "Topic 2"]
}`;
}