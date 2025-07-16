     1 // netlify/functions/optimize-amazon-search.js
     2
     3 exports.handler = async function(event, context) {
     4   console.log("Function optimize-amazon-search started.");
     5   if (event.httpMethod !== "POST") {
     6     return { statusCode: 405, body: "Method Not Allowed" };
     7   }
     8
     9   const { amazonKeywords } = JSON.parse(event.body);
    10
    11   if (!amazonKeywords || !Array.isArray(amazonKeywords) || amazonKeywords.length === 0) {
    12     return { statusCode: 400, body: "Missing or invalid amazonKeywords" };
    13   }
    14
    15   const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    16   const OPENROUTER_MODEL = "google/gemma-3-27b-it:free"; // Modelo gratuito de OpenRouter.ai (Gemma 3)
    17
    18   if (!OPENROUTER_API_KEY) {
    19     return { statusCode: 500, body: "OpenRouter API Key not configured." };
    20   }
    21
    22   const promptMessages = [
    23     {
    24       role: "system",
    25       content: `Actúa como un estratega de monetización experto en productos de Amazon. Tu tarea es analizar un término
       geek/friki y determinar qué productos de Amazon serían los más relevantes y monetizables para ese término. Si existen
       productos muy relevantes, responde con una cadena de búsqueda optimizada que un usuario real escribiría en Amazon para
       encontrar esos productos. La cadena debe contener entre 2 y 5 palabras, sin comas, sin signos de puntuación, sin conectores
       ni símbolos, solo palabras clave separadas por espacios. No uses categorías amplias o genéricas.
    26
    27 Tu respuesta debe ser SIEMPRE un objeto JSON con este formato exacto:
    28 - Si hay productos relevantes: {"relevant": true, "optimizedSearchString": "tu cadena de búsqueda optimizada"}
    29 - Si NO hay productos relevantes: {"relevant": false}
    30
    31 No añadas ningún otro texto, explicación ni formato Markdown.
    32
    33 Ejemplos:
    34 - Término: "Manga" → {"relevant": true, "optimizedSearchString": "manga shonen coleccion"}
    35 - Término: "Distopía" → {"relevant": false}
    36 - Término: "Cosplay" → {"relevant": true, "optimizedSearchString": "disfraces cosplay anime mujer"}
    37 - Término: "Fan Fiction" → {"relevant": true, "optimizedSearchString": "libros fanfiction escritura"}
    38 - Término: "Lore" → {"relevant": true, "optimizedSearchString": "libros lore fantasia universo"}
    39 - Término: "NPC" → {"relevant": true, "optimizedSearchString": "figuras npc videojuegos"}
    40 - Término: "Ninja" → {"relevant": true, "optimizedSearchString": "disfraz ninja infantil"}
    41
    42 Si no estás seguro de la relevancia, responde {"relevant": false}.`
    43     },
    44     {
    45       role: "user",
    46       // Esta línea ha sido simplificada para evitar SyntaxError
    47       content: `Analiza el término: ${amazonKeywords[0]}. Palabras clave originales: ${amazonKeywords.join(', ')}`
    48     }
    49   ];
    50
    51   try {
    52     // Usamos global.fetch para asegurar que se usa la función global de Node.js
    53     const response = await global.fetch("https://openrouter.ai/api/v1/chat/completions", {
    54       method: "POST",
    55       headers: {
    56         "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
    57         "Content-Type": "application/json",
    58         "HTTP-Referer": "https://geek-glossary.netlify.app", // ¡REEMPLAZA ESTO CON LA URL REAL DE TU SITIO NETLIFY!
    59         "X-Title": "Geek Glossary Amazon Optimizer",
    60       },
    61       body: JSON.stringify({
    62         model: OPENROUTER_MODEL,
    63         messages: promptMessages,
    64         max_tokens: 50,
    65         response_format: { type: "json_object" }, // Solicitar salida JSON
    66       }),
    67     });
    68
    69     if (!response.ok) {
    70       const errorBody = await response.text();
    71       throw new Error(`OpenRouter API error! status: ${response.status}, body: ${errorBody}`);
    72     }
    73
    74     const result = await response.json();
    75     const generatedText = result.choices[0]?.message?.content || "";
    76
    77     let parsedResponse;
    78     try {
    79       parsedResponse = JSON.parse(generatedText.trim());
    80     } catch (jsonError) {
    81       console.error("Error parsing AI response JSON:", jsonError);
    82       // Fallback si la IA no devuelve JSON perfecto
    83       const jsonMatch = generatedText.match(/\{[^]*\}/);
    84       if (jsonMatch) {
    85         parsedResponse = JSON.parse(jsonMatch[0]);
    86       } else {
    87         throw new Error("AI response was not valid JSON and could not be extracted.");
    88       }
    89     }
    90
    91     return {
    92       statusCode: 200,
    93       body: JSON.stringify(parsedResponse),
    94     };
    95   } catch (error) {
    96     console.error("Error calling OpenRouter API:", error);
    97     return {
    98       statusCode: 500,
    99       body: JSON.stringify({ error: "Failed to optimize search string", details: error.message }),
   100     };
   101   }
   102 };