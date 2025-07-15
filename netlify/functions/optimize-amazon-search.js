const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { amazonKeywords } = JSON.parse(event.body);

  if (!amazonKeywords || !Array.isArray(amazonKeywords) || amazonKeywords.length === 0) {
    return { statusCode: 400, body: "Missing or invalid amazonKeywords" };
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Puedes cambiar el modelo si lo deseas

  const prompt = `Actúa como un estratega de monetización experto en productos de Amazon.
  Analiza las siguientes palabras clave relacionadas con un término geek/friki: "${amazonKeywords.join(', ')}".

  Tu tarea es determinar si este término tiene potencial para generar búsquedas de productos relevantes y monetizables en Amazon.

  Si SÍ tiene potencial:
  Genera una cadena de búsqueda optimizada y concisa (máximo 5 palabras) que un usuario real usaría para encontrar productos muy relevantes en Amazon. Piensa en productos específicos o categorías de productos que se asocien directamente con estas palabras clave.
  Formato de salida: {"relevant": true, "optimizedSearchString": "tu cadena de búsqueda optimizada"}

  Si NO tiene potencial (es decir, las palabras clave son demasiado genéricas, abstractas, o no se asocian directamente con productos vendibles en Amazon):
  Formato de salida: {"relevant": false}

  Ejemplos:
  Palabras clave: ["jefes finales", "videojuegos", "desafío"]
  Salida: {"relevant": true, "optimizedSearchString": "figuras de accion boss videojuegos"}

  Palabras clave: ["distopia", "sociedad", "futuro"]
  Salida: {"relevant": false}

  Palabras clave: ["cosplay", "disfraces", "anime"]
  Salida: {"relevant": true, "optimizedSearchString": "disfraces cosplay anime"}

  Palabras clave: "${amazonKeywords.join(', ')}"
  Salida:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Intentar parsear el JSON. A veces la IA puede añadir texto extra.
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text.trim());
    } catch (jsonError) {
      // Si no es JSON puro, intentar extraerlo si la IA lo envolvió
      const jsonMatch = text.match(/\{[^]*\}/);
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
    console.error("Error calling Google AI Studio:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to optimize search string", details: error.message }),
    };
  }
};
