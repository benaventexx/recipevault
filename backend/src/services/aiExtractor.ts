import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

const PROMPT_PREFIX = `You are a recipe extraction assistant. Given a video transcript or post caption, extract the complete recipe and return it as valid JSON only (no markdown, no explanation, no backticks).

Return this exact structure:
{
  "title": "Recipe name",
  "description": "One sentence description",
  "category": "vegetais|carne|peixe|entradas|sobremesas|massa|sopa|outro",
  "ingredients": [
    { "name": "ingredient name", "amount": "100", "unit": "g" }
  ],
  "steps": [
    { "order": 1, "text": "Step description", "timerSeconds": 300 }
  ],
  "tags": ["tag1", "tag2"],
  "estimatedTimeMinutes": 30,
  "servings": 4
}

Rules:
- timerSeconds only when the step involves waiting/cooking with a specific time
- category must be exactly one of: vegetais, carne, peixe, entradas, sobremesas, massa, sopa, outro
- amounts as strings (e.g. "1/2", "100", "a handful")
- unit can be: g, kg, ml, l, tsp, tbsp, cup, unidade, dente, folha, pitada, or empty string
- If no clear recipe is found, return { "error": "No recipe found" }
- Always respond in the same language as the transcript

Extract the recipe from this content:

`

export async function extractRecipeFromText(text: string) {
  const result = await model.generateContent(PROMPT_PREFIX + text)
  const raw = result.response.text().trim()

  // Strip markdown code blocks if present
  const cleaned = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim()

  try {
    const parsed = JSON.parse(cleaned)
    if (parsed.error) throw new Error('Nenhuma receita encontrada no vídeo.')
    return parsed
  } catch {
    throw new Error('Não foi possível processar a receita. Tenta com outro vídeo.')
  }
}
