



const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  console.log("Function optimize-amazon-search started.");
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { amazonKeywords } = JSON.parse(event.body);

  if (!amazonKeywords || !Array.isArray(amazonKeywords) || amazonKeywords.length === 0) {
    return { statusCode: 400, body: "Missing or invalid amazonKeywords" };
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const OPENROUTER_MODEL = "google/gemma-3-27b-it:free"; // Modelo gratuito de OpenRouter.ai (Gemma 3)

  if (!OPENROUTER_API_KEY) {
    return { statusCode: 500, body: "OpenRouter API Key not configured." };
  }

  const promptMessages = [
    {
      role: "system",
      content: `Actúa como un estratega de monetización experto en productos de Amazon. Tu tarea es analizar un término geek/friki y determinar qué productos de Amazon serían los más relevantes y monetizables para ese término. Si existen productos muy relevantes, responde con una cadena de búsqueda optimizada que un usuario real escribiría en Amazon para encontrar esos productos. La cadena debe contener entre 2 y 5 palabras, sin comas, sin signos de puntuación, sin conectores ni símbolos, solo palabras clave separadas por espacios. No uses categorías amplias o genéricas.

Tu respuesta debe ser SIEMPRE un objeto JSON con este formato exacto:
- Si hay productos relevantes: {"relevant": true, "optimizedSearchString": "tu cadena de búsqueda optimizada"}
- Si NO hay productos relevantes: {"relevant": false}

No añadas ningún otro texto, explicación ni formato Markdown.

Ejemplos:
- Término: "Manga" → {"relevant": true, "optimizedSearchString": "manga shonen coleccion"}
- Término: "Distopía" → {"relevant": false}
- Término: "Cosplay" → {"relevant": true, "optimizedSearchString": "disfraces cosplay anime mujer"}
- Término: "Fan Fiction" → {"relevant": true, "optimizedSearchString": "libros fanfiction escritura"}
- Término: "Lore" → {"relevant": true, "optimizedSearchString": "libros lore fantasia universo"}
- Término: "NPC" → {"relevant": true, "optimizedSearchString": "figuras npc videojuegos"}
- Término: "Ninja" → {"relevant": true, "optimizedSearchString": "disfraz ninja infantil"}

Si no estás seguro de la relevancia, responde {"relevant": false}.
    },
    {
      role: "user",
      content: `Término: "${amazonKeywords[0]}" (Palabras clave originales: ${amazonKeywords.join(', ')})`
    }
  ];

  try {
    const response = await global.fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-site-name.netlify.app", // Reemplaza con la URL de tu sitio Netlify
        "X-Title": "Geek Glossary Amazon Optimizer",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: promptMessages,
        max_tokens: 50,
        response_format: { type: "json_object" }, // Solicitar salida JSON
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenRouter API error! status: ${response.status}, body: ${errorBody}`);
    }

    const result = await response.json();
    const generatedText = result.choices[0]?.message?.content || "";

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(generatedText.trim());
    } catch (jsonError) {
      console.error("Error parsing AI response JSON:", jsonError);
      // Fallback si la IA no devuelve JSON perfecto
      const jsonMatch = generatedText.match(/\{[^]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("AI response was not valid JSON and could not be extracted.");
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(parsedResponse),
    };
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to optimize search string", details: error.message }),
    };
  }
};