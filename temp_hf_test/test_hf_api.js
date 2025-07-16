const HF_MODEL = "google/flan-t5-xxl"; // Cambiado a Flan-T5-XXL

async function testHuggingFaceAPI() {
  console.log("--- INICIO DEL SCRIPT ---");
  const HF_API_TOKEN = "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"; // ¡REEMPLAZA ESTO CON TU TOKEN REAL!
  const HF_MODEL = "HuggingFaceH4/zephyr-7b-beta"; // O "google/flan-t5-xxl" si quieres probar ese

  if (HF_API_TOKEN === "TU_TOKEN_DE_HUGGING_FACE" || !HF_API_TOKEN) {
    console.error("ERROR: Por favor, reemplaza 'TU_TOKEN_DE_HUGGING_FACE' con tu token real de Hugging Face.");
    console.log("--- FIN DEL SCRIPT (ERROR DE TOKEN) ---");
    return;
  }

  const samplePrompt = `Actúa como un estratega de monetización experto en productos de Amazon.
  Analiza las siguientes palabras clave relacionadas con un término geek/friki: "videojuegos, rol, fantasía".

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

  Palabras clave: ["videojuegos", "rol", "fantasía"]
  Salida:`;

  console.log(`Intentando llamar a Hugging Face API con el modelo: ${HF_MODEL}`);
  console.log("Enviando prompt:\n", samplePrompt);

  try {
    console.log("Realizando la llamada fetch...");
    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      headers: { Authorization: `Bearer ${HF_API_TOKEN}` },
      method: "POST",
      body: JSON.stringify({ inputs: samplePrompt, parameters: { max_new_tokens: 50, return_full_text: false } }),
    });
    console.log("Llamada fetch completada. Procesando respuesta...");

    const responseBody = await response.text(); // Leer el cuerpo como texto primero

    if (!response.ok) {
      console.error(`ERROR: Hugging Face API responded with status ${response.status}`);
      console.error("Response Body:", responseBody);
      throw new Error(`Hugging Face API error! status: ${response.status}, body: ${responseBody}`);
    }

    const result = JSON.parse(responseBody); // Intentar parsear el texto como JSON
    const generatedText = result[0]?.generated_text || "";

    console.log("\n--- RESPUESTA DE LA IA ---");
    console.log("Texto generado:", generatedText);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(generatedText.trim());
      console.log("JSON parseado:", parsedResponse);
    } catch (jsonError) {
      console.error("ERROR: La respuesta de la IA no es un JSON válido o completo.");
      console.error("Error al parsear JSON:", jsonError);
      const jsonMatch = generatedText.match(/\{[^]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
        console.log("JSON extraído y parseado:", parsedResponse);
      } else {
        console.error("No se pudo extraer JSON de la respuesta.");
      }
    }

  } catch (error) {
    console.error("\n--- ERROR GENERAL ---");
    console.error("Error durante la llamada a la API:", error);
  } finally {
    console.log("--- FIN DEL SCRIPT ---");
  }
}

testHuggingFaceAPI();