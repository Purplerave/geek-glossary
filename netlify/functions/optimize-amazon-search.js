

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { amazonKeywords } = JSON.parse(event.body);

  if (!amazonKeywords || !Array.isArray(amazonKeywords) || amazonKeywords.length === 0) {
    return { statusCode: 400, body: "Missing or invalid amazonKeywords" };
  }

  const HF_API_TOKEN = process.env.HF_API_TOKEN;
  const HF_MODEL = "HuggingFaceH4/zephyr-7b-beta"; // Modelo de LLM en Hugging Face (cambiado)

  if (!HF_API_TOKEN) {
    return { statusCode: 500, body: "Hugging Face API Token not configured." };
  }

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
    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        headers: { Authorization: `Bearer ${HF_API_TOKEN}` },
        method: "POST",
        body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 50, return_full_text: false } }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Hugging Face API error! status: ${response.status}, body: ${errorBody}`);
    }

    const result = await response.json();
    const generatedText = result[0]?.generated_text || "";

    // Intentar parsear el JSON. La IA puede añadir texto extra.
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(generatedText.trim());
    } catch (jsonError) {
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
    console.error("Error calling Hugging Face API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to optimize search string", details: error.message }),
    };
  }
};