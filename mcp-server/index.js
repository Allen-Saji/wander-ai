import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.MCP_PORT || 3001;

/**
 * Fallback attractions data for when OpenTripMap is unavailable
 * Covers popular destinations with realistic attraction data
 */
const FALLBACK_ATTRACTIONS = {
  tokyo: {
    temples: [
      { name: "Senso-ji Temple", description: "Tokyo's oldest and most famous Buddhist temple in Asakusa, featuring the iconic Thunder Gate.", category: "culture", cost: 0, duration: "1-2 hours" },
      { name: "Meiji Shrine", description: "Serene Shinto shrine surrounded by a tranquil forest, dedicated to Emperor Meiji.", category: "culture", cost: 0, duration: "1 hour" },
      { name: "Zojo-ji Temple", description: "Historic temple with views of Tokyo Tower and rows of Jizo statues.", category: "culture", cost: 0, duration: "1 hour" },
    ],
    food: [
      { name: "Tsukiji Outer Market", description: "Famous market with fresh sushi, street food, and culinary supplies.", category: "food", cost: 20, duration: "2 hours" },
      { name: "Ichiran Ramen", description: "Iconic tonkotsu ramen chain with individual booth seating.", category: "food", cost: 15, duration: "45 minutes" },
      { name: "Omoide Yokocho", description: "Atmospheric alley of tiny yakitori bars near Shinjuku station.", category: "food", cost: 25, duration: "1-2 hours" },
    ],
    nature: [
      { name: "Shinjuku Gyoen", description: "Expansive park with Japanese, French, and English gardens.", category: "nature", cost: 5, duration: "2-3 hours" },
      { name: "Ueno Park", description: "Large public park with museums, temples, and cherry blossoms in spring.", category: "nature", cost: 0, duration: "2-4 hours" },
    ],
    shopping: [
      { name: "Shibuya 109", description: "Iconic fashion department store popular with young shoppers.", category: "shopping", cost: 0, duration: "1-2 hours" },
      { name: "Nakamise Street", description: "Traditional shopping street leading to Senso-ji with souvenirs and snacks.", category: "shopping", cost: 0, duration: "1 hour" },
      { name: "Akihabara Electric Town", description: "Electronics and anime paradise with endless gadget shops.", category: "shopping", cost: 0, duration: "2-3 hours" },
    ],
    nightlife: [
      { name: "Golden Gai", description: "Maze of tiny bars in Shinjuku, each with unique character.", category: "nightlife", cost: 30, duration: "2-3 hours" },
      { name: "Roppongi", description: "Upscale nightlife district with clubs, bars, and late-night dining.", category: "nightlife", cost: 50, duration: "3-4 hours" },
    ],
  },
  kyoto: {
    temples: [
      { name: "Fushimi Inari Shrine", description: "Famous shrine with thousands of orange torii gates winding up the mountain.", category: "culture", cost: 0, duration: "2-3 hours" },
      { name: "Kinkaku-ji (Golden Pavilion)", description: "Stunning Zen temple covered in gold leaf, reflected in a tranquil pond.", category: "culture", cost: 5, duration: "1 hour" },
      { name: "Kiyomizu-dera", description: "Historic temple with a dramatic wooden stage overlooking the city.", category: "culture", cost: 4, duration: "1-2 hours" },
      { name: "Ginkaku-ji (Silver Pavilion)", description: "Elegant Zen temple with beautiful moss gardens.", category: "culture", cost: 5, duration: "1 hour" },
    ],
    food: [
      { name: "Nishiki Market", description: "Traditional food market known as 'Kyoto's Kitchen' with local specialties.", category: "food", cost: 15, duration: "1-2 hours" },
      { name: "Gion District Restaurants", description: "Traditional kaiseki dining in the historic geisha district.", category: "food", cost: 80, duration: "2 hours" },
    ],
    nature: [
      { name: "Arashiyama Bamboo Grove", description: "Magical bamboo forest perfect for a peaceful morning walk.", category: "nature", cost: 0, duration: "1-2 hours" },
      { name: "Philosopher's Path", description: "Scenic canal-side path lined with cherry trees.", category: "nature", cost: 0, duration: "1-2 hours" },
    ],
  },
  paris: {
    culture: [
      { name: "Louvre Museum", description: "World's largest art museum, home to the Mona Lisa.", category: "culture", cost: 17, duration: "3-4 hours" },
      { name: "Musée d'Orsay", description: "Impressionist masterpieces in a stunning former railway station.", category: "culture", cost: 14, duration: "2-3 hours" },
      { name: "Notre-Dame Cathedral", description: "Gothic masterpiece currently under restoration, stunning from outside.", category: "culture", cost: 0, duration: "1 hour" },
    ],
    food: [
      { name: "Le Marais Cafés", description: "Charming neighborhood with authentic Parisian cafés and bakeries.", category: "food", cost: 20, duration: "1-2 hours" },
      { name: "Rue Cler Market Street", description: "Quintessential Parisian food market with cheese, wine, and pastries.", category: "food", cost: 25, duration: "1-2 hours" },
    ],
    shopping: [
      { name: "Champs-Élysées", description: "Famous avenue with luxury boutiques and flagship stores.", category: "shopping", cost: 0, duration: "2-3 hours" },
      { name: "Le Marais Boutiques", description: "Trendy neighborhood with vintage shops and designer stores.", category: "shopping", cost: 0, duration: "2-3 hours" },
    ],
    nightlife: [
      { name: "Montmartre", description: "Bohemian hilltop neighborhood with bars, cabarets, and views.", category: "nightlife", cost: 30, duration: "2-3 hours" },
    ],
  },
  bangkok: {
    temples: [
      { name: "Wat Phra Kaew", description: "Thailand's most sacred temple, housing the Emerald Buddha.", category: "culture", cost: 15, duration: "2 hours" },
      { name: "Wat Pho", description: "Temple of the Reclining Buddha, also famous for traditional massage.", category: "culture", cost: 8, duration: "1-2 hours" },
      { name: "Wat Arun", description: "Iconic riverside temple with a stunning spire covered in porcelain.", category: "culture", cost: 3, duration: "1 hour" },
    ],
    food: [
      { name: "Chatuchak Weekend Market", description: "Massive market with incredible street food options.", category: "food", cost: 10, duration: "3-4 hours" },
      { name: "Yaowarat (Chinatown)", description: "Street food paradise with the best night market dining.", category: "food", cost: 15, duration: "2-3 hours" },
      { name: "Or Tor Kor Market", description: "Premium fresh market known for quality Thai fruits and dishes.", category: "food", cost: 20, duration: "1-2 hours" },
    ],
    shopping: [
      { name: "MBK Center", description: "Sprawling mall famous for electronics and bargain shopping.", category: "shopping", cost: 0, duration: "2-3 hours" },
      { name: "Asiatique The Riverfront", description: "Open-air night market with shops, restaurants, and entertainment.", category: "shopping", cost: 0, duration: "2-3 hours" },
    ],
    nightlife: [
      { name: "Khao San Road", description: "Legendary backpacker street with bars and nightlife.", category: "nightlife", cost: 20, duration: "2-4 hours" },
      { name: "Thonglor", description: "Upscale neighborhood with trendy rooftop bars and clubs.", category: "nightlife", cost: 40, duration: "3-4 hours" },
    ],
  },
  rome: {
    culture: [
      { name: "Colosseum", description: "Iconic ancient amphitheater, symbol of Imperial Rome.", category: "culture", cost: 16, duration: "2-3 hours" },
      { name: "Vatican Museums", description: "Vast art collection including the Sistine Chapel.", category: "culture", cost: 17, duration: "3-4 hours" },
      { name: "Pantheon", description: "Best-preserved ancient Roman temple with remarkable dome.", category: "culture", cost: 0, duration: "1 hour" },
    ],
    food: [
      { name: "Trastevere", description: "Charming neighborhood with authentic Roman trattorias.", category: "food", cost: 25, duration: "2 hours" },
      { name: "Campo de' Fiori Market", description: "Lively morning market with fresh produce and local products.", category: "food", cost: 15, duration: "1 hour" },
    ],
    shopping: [
      { name: "Via del Corso", description: "Main shopping street with fashion stores and boutiques.", category: "shopping", cost: 0, duration: "2-3 hours" },
    ],
  },
};

/**
 * Normalize city name for lookup
 */
function normalizeCity(city) {
  return city.toLowerCase().replace(/[^a-z]/g, "");
}

/**
 * Search attractions from curated data
 */
function searchAttractions(city, category) {
  const normalizedCity = normalizeCity(city);

  // Find city data (partial match)
  let cityData = null;
  let matchedCity = null;
  for (const [key, data] of Object.entries(FALLBACK_ATTRACTIONS)) {
    if (normalizedCity.includes(key) || key.includes(normalizedCity)) {
      cityData = data;
      matchedCity = key.charAt(0).toUpperCase() + key.slice(1);
      break;
    }
  }

  if (!cityData) {
    return {
      city,
      category: category || "all",
      attractions: [],
      source: "wanderai-curated",
      message: `No attraction data available for ${city}. Try Tokyo, Kyoto, Paris, Bangkok, or Rome.`,
    };
  }

  // Get attractions for category or all categories
  let attractions = [];
  if (category && category !== "all") {
    const normalizedCategory = category.toLowerCase();
    // Check direct category match or aliases
    const categoryAliases = {
      temples: ["temples", "culture", "shrines"],
      culture: ["culture", "temples", "museums", "history"],
      food: ["food", "restaurants", "dining"],
      nature: ["nature", "parks", "gardens"],
      shopping: ["shopping", "markets"],
      nightlife: ["nightlife", "bars", "clubs"],
    };

    for (const [key, aliases] of Object.entries(categoryAliases)) {
      if (aliases.some(a => normalizedCategory.includes(a) || a.includes(normalizedCategory))) {
        if (cityData[key]) {
          attractions = [...attractions, ...cityData[key]];
        }
      }
    }

    // Direct key lookup if no alias match
    if (attractions.length === 0 && cityData[normalizedCategory]) {
      attractions = cityData[normalizedCategory];
    }
  } else {
    // Return all attractions
    for (const categoryAttractions of Object.values(cityData)) {
      attractions = [...attractions, ...categoryAttractions];
    }
  }

  console.log(`[WanderAI] Found ${Math.min(attractions.length, 6)} attractions in ${matchedCity}`);

  return {
    city: matchedCity || city,
    category: category || "all",
    attractions: attractions.slice(0, 6),
    source: "wanderai-curated",
    count: Math.min(attractions.length, 6),
  };
}

// MCP Tool definitions
const TOOLS = [
  {
    name: "searchAttractions",
    description:
      "Search for tourist attractions, restaurants, temples, and points of interest in a city. Returns up to 6 attractions with name, description, category, cost, and duration. Use this when the user asks for recommendations, things to do, places to visit, or attractions in a specific city.",
    inputSchema: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "City name to search in (e.g., 'Tokyo', 'Paris', 'Bangkok')",
        },
        category: {
          type: "string",
          description: "Category of attractions: 'temples', 'culture', 'food', 'nature', 'shopping', 'nightlife', or 'all' for everything",
          enum: ["temples", "culture", "food", "nature", "shopping", "nightlife", "all"],
        },
      },
      required: ["city"],
    },
  },
];

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", server: "wanderai-mcp", version: "1.0.0" });
});

// MCP SSE endpoint for listing tools
app.get("/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send initial server info
  const serverInfo = {
    jsonrpc: "2.0",
    method: "notifications/initialized",
    params: { capabilities: { tools: {} } },
  };
  res.write(`data: ${JSON.stringify(serverInfo)}\n\n`);

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(": keepalive\n\n");
  }, 30000);

  req.on("close", () => {
    clearInterval(keepAlive);
  });
});

// MCP HTTP endpoint for tool operations
app.post("/message", (req, res) => {
  const { method, params, id } = req.body;

  if (method === "tools/list") {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: { tools: TOOLS },
    });
  }

  if (method === "tools/call") {
    const { name, arguments: args } = params;

    if (name === "searchAttractions") {
      const { city, category } = args || {};

      if (!city) {
        return res.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify({ error: "City parameter is required" }) }],
          },
        });
      }

      const result = searchAttractions(city, category);
      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: JSON.stringify(result) }],
        },
      });
    }

    return res.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Unknown tool: ${name}` },
    });
  }

  if (method === "initialize") {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        serverInfo: { name: "wanderai-attractions", version: "1.0.0" },
        capabilities: { tools: {} },
      },
    });
  }

  res.json({
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Unknown method: ${method}` },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`WanderAI MCP Server running on http://localhost:${PORT}`);
  console.log(`  Health: http://localhost:${PORT}/health`);
  console.log(`  SSE: http://localhost:${PORT}/sse`);
  console.log(`  Message: http://localhost:${PORT}/message`);
});
