



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
  const OPENROUTER_MODEL = "mistralai/mistral-7b-instruct-v0.2"; // Modelo gratuito de OpenRouter.ai (cambiado a Mistral)

  if (!OPENROUTER_API_KEY) {
    return { statusCode: 500, body: "OpenRouter API Key not configured." };
  }

  const promptMessages = [
    {
      role: "system",
      content: "Actúa como un estratega de monetización experto en productos de Amazon. Tu tarea es analizar un término geek/friki y determinar qué productos de Amazon serían los más relevantes y monetizables para ese término. Si SÍ hay productos muy relevantes, genera una cadena de búsqueda optimizada y concisa (máximo 5 palabras) que un usuario real usaría para encontrar esos productos específicos en Amazon. Si NO hay productos directamente relevantes o monetizables, indica que no es relevante. Responde SIEMPRE con un objeto JSON de la forma {"relevant": true, "optimizedSearchString": "tu cadena de búsqueda optimizada"} o {"relevant": false}. No incluyas ningún otro texto ni Markdown. Ejemplos: Término: "Manga" Salida: {"relevant": true, "optimizedSearchString": "manga shonen coleccion"}. Término: "Distopía" Salida: {"relevant": false}. Término: "Cosplay" Salida: {"relevant": true, "optimizedSearchString": "disfraces cosplay anime"}."
    },
    {
      role: "user",
      content: `Término: "${amazonKeywords[0]}" (Palabras clave originales: ${amazonKeywords.join(', ')})`
    }
  ];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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