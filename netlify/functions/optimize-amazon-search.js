// netlify/functions/optimize-amazon-search.js

exports.handler = async function(event, context) {
  console.log("Function optimize-amazon-search started.");

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: "Method Not Allowed"
    };
  }

  let amazonKeywords;
  try {
    const body = JSON.parse(event.body);
    amazonKeywords = body.amazonKeywords;
  } catch (e) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: "Invalid JSON input"
    };
  }

  // Validar keywords limpias
  const cleanKeywords = Array.isArray(amazonKeywords)
    ? amazonKeywords.filter(k => typeof k === 'string' && k.trim() !== '')
    : [];

  if (!cleanKeywords.length) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: "Missing or invalid amazonKeywords"
    };
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const OPENROUTER_MODEL = "google/gemma-3-27b-it:free";

  if (!OPENROUTER_API_KEY) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: "OpenRouter API Key not configured."
    };
  }

  const combinedTerm = cleanKeywords.join(" ");

  const promptMessages = [
    {
      role: "system",
      content: `Actúa como un estratega de monetización experto en productos de Amazon. Tu tarea es analizar un término
geek/friki y determinar qué productos de Amazon serían los más relevantes y monetizables para ese término. Si existen
productos muy relevantes, responde con una cadena de búsqueda optimizada que un usuario real escribiría en Amazon para
encontrar esos productos. La cadena debe contener entre 2 y 5 palabras, sin comas, sin signos de puntuación, sin conectores
ni símbolos, solo palabras clave separadas por espacios. No uses categorías amplias o genéricas.

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

Si no estás seguro de la relevancia, responde {"relevant": false}.`
    },
    {
      role: "user",
      content: `Analiza el término: ${combinedTerm}. Palabras clave originales: ${cleanKeywords.join(', ')}`
    }
  ];

  try {
    const response = await global.fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "Referer": "https://geek-glossary.netlify.app", // <-- Asegúrate de poner tu URL real aquí
        "X-Title": "Geek Glossary Amazon Optimizer"
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: promptMessages,
        max_tokens: 50
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
      const jsonMatch = generatedText.match(/\{[^]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("AI response was not valid JSON and could not be extracted.");
      }
    }

    // Validación extra del objeto resultante
    if (
      typeof parsedResponse.relevant !== "boolean" ||
      (parsedResponse.relevant && typeof parsedResponse.optimizedSearchString !== "string")
    ) {
      throw new Error("AI response is missing required fields.");
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(parsedResponse)
    };

  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ error: "Failed to optimize search string", details: error.message })
    };
  }
};
