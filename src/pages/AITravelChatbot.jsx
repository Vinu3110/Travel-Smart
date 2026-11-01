
import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  MapPin,
  Bot,
  User,
  Plus,
} from "lucide-react";
import "./AITravelChatbot.css";

const initialMessage = {
  role: "assistant",
  content:
    "Hello! I'm your TravelSmart Assistant. 🌍\n\nI can help you with destinations, trip plans, hotels, packing lists, budgets and travel tips.\n\nWhere would you like to go?",
};

const destinations = {
  ooty: {
    name: "Ooty",
    places: [
      "Ooty Lake",
      "Botanical Garden",
      "Doddabetta Peak",
      "Rose Garden",
      "Nilgiri Mountain Railway",
    ],
    days: [
      "Day 1: Visit Ooty Lake, Botanical Garden and Rose Garden.",
      "Day 2: Explore Doddabetta Peak and enjoy the Nilgiri Mountain Railway.",
      "Day 3: Visit nearby tea gardens and local markets.",
    ],
  },
  kerala: {
    name: "Kerala",
    places: [
      "Munnar",
      "Alleppey Backwaters",
      "Kochi",
      "Wayanad",
      "Thekkady",
    ],
    days: [
      "Day 1: Explore Kochi and its historical attractions.",
      "Day 2: Visit Munnar tea gardens and scenic viewpoints.",
      "Day 3: Enjoy the Alleppey backwaters.",
    ],
  },
  kadapa: {
    name: "Kadapa",
    places: [
      "Gandikota",
      "Belum Caves",
      "Ameen Peer Dargah",
      "Devuni Kadapa",
      "Bhagwan Mahavir Government Museum",
    ],
    days: [
      "Day 1: Explore Gandikota and the Pennar River viewpoint.",
      "Day 2: Visit Belum Caves.",
      "Day 3: Explore local attractions in Kadapa.",
    ],
  },
  goa: {
    name: "Goa",
    places: [
      "Baga Beach",
      "Calangute Beach",
      "Fort Aguada",
      "Anjuna Beach",
      "Dudhsagar Falls",
    ],
    days: [
      "Day 1: Explore Baga and Calangute beaches.",
      "Day 2: Visit Fort Aguada and Anjuna Beach.",
      "Day 3: Explore local markets and nearby attractions.",
    ],
  },
  hyderabad: {
    name: "Hyderabad",
    places: [
      "Charminar",
      "Golconda Fort",
      "Hussain Sagar Lake",
      "Ramoji Film City",
      "Salar Jung Museum",
    ],
    days: [
      "Day 1: Visit Charminar and nearby markets.",
      "Day 2: Explore Golconda Fort and Hussain Sagar Lake.",
      "Day 3: Visit Salar Jung Museum or Ramoji Film City.",
    ],
  },
};

function generateReply(question, previousMessages) {
  const text = question.toLowerCase().trim();

  const destinationNames = Object.keys(destinations);
  const mentionedDestination = destinationNames.find((place) =>
    text.includes(place)
  );

  const previousUserMessages = previousMessages
    .filter((message) => message.role === "user")
    .map((message) => message.content.toLowerCase());

  const previousDestination = destinationNames.find((place) =>
    previousUserMessages.some((message) => message.includes(place))
  );

  const destinationKey = mentionedDestination || previousDestination;
  const destination = destinationKey
    ? destinations[destinationKey]
    : null;

  // Greetings
  if (/^(hi|hello|hey|good morning|good evening)\b/.test(text)) {
    return "Hello! 👋 Welcome to TravelSmart!\n\nWhere are you planning to travel? I can help you with destinations, hotels, itineraries, packing and budgets.";
  }

  // Packing suggestions
  if (
    /pack|packing|suitcase|luggage|carry/.test(text)
  ) {
    return "🎒 **Travel Packing Checklist**\n\nClothing:\n• Comfortable clothes\n• Extra pair of clothes\n• Sleepwear\n• Comfortable shoes\n\nEssentials:\n• Phone and charger\n• ID proof and tickets\n• Wallet and cash\n• Power bank\n\nPersonal care:\n• Toothbrush and toothpaste\n• Shampoo and soap\n• Sunscreen\n• Personal medicines\n\nTravel tip: Check the weather at your destination before packing!";
  }

  // Budget
  if (
    /budget|cost|expense|expenses|money|how much/.test(text)
  ) {
    return "💰 **Travel Budget Planning**\n\nConsider these expenses:\n\n1. Transportation\n2. Hotel accommodation\n3. Food and drinks\n4. Sightseeing and activities\n5. Local transportation\n6. Emergency expenses\n\nTip: Keep around 10–15% of your planned budget aside for unexpected expenses.\n\nTell me your destination, number of days and budget so I can help organize your expenses.";
  }

  // Hotels
  if (
    /hotel|hotels|room|rooms|stay|accommodation|resort/.test(text)
  ) {
    if (destination) {
      return `🏨 **Hotel Suggestions for ${destination.name}**\n\nWhen choosing accommodation, consider:\n\n• Hotels near popular tourist areas\n• Budget guesthouses and homestays\n• Family-friendly hotels\n• Properties with good recent reviews\n\nBefore booking, compare prices, location, facilities and cancellation policies.\n\nI don't have live hotel listings or room availability, so please check a booking website before making a reservation.`;
    }

    return "🏨 **Hotel Booking Tips**\n\nYou can choose from:\n\n• Budget hotels\n• Family-friendly hotels\n• Luxury hotels\n• Resorts\n• Homestays\n\nWhich city or destination do you need a hotel in? Also, consider your budget and travel dates before booking.";
  }

  // Best places
  if (
    /places|attractions|visit|tourist|sightseeing|famous|explore/.test(text)
  ) {
    if (destination) {
      return `📍 **Best Places to Visit in ${destination.name}**\n\n${destination.places
        .map((place, index) => `${index + 1}. ${place}`)
        .join("\n")}\n\nWould you like me to prepare a trip itinerary?`;
    }

    return "🌍 I can suggest tourist attractions for Ooty, Kerala, Kadapa, Goa and Hyderabad.\n\nWhich destination would you like to explore?";
  }

  // Itinerary or trip planning
  if (
    /plan|itinerary|trip|travel|days|day|schedule/.test(text)
  ) {
    if (destination) {
      return `✈️ **${destination.name} Travel Plan**\n\n${destination.days.join("\n\n")}\n\nTravel tip: Adjust the plan according to your travel dates, transport and preferences.\n\nWould you like packing tips or budget suggestions for this trip?`;
    }

    return "✈️ Let's plan your trip!\n\nI can prepare a simple itinerary with sightseeing suggestions.\n\nWhich destination are you planning to visit? How many days will you stay?";
  }

  // Weather
  if (/weather|temperature|climate|rain|season/.test(text)) {
    return "🌤️ **Travel Weather Tips**\n\n• Check the weather forecast before travelling.\n• Carry an umbrella during rainy seasons.\n• Pack warm clothes for cold destinations.\n• Check local weather alerts before outdoor activities.\n\nI don't have live weather information in this chatbot.";
  }

  // Transport
  if (/train|flight|bus|transport|travel by|how to reach/.test(text)) {
    return "🚆 **Transportation Tips**\n\nYou can compare:\n\n• Train journeys\n• Bus services\n• Flights\n• Rental cars and taxis\n\nCompare travel time, ticket prices and convenience before booking. Check the official transport website for current schedules and availability.";
  }

  // Destination information
  if (destination) {
    return `🌍 **Welcome to ${destination.name}!**\n\nHere are some popular attractions:\n\n${destination.places
      .map((place, index) => `${index + 1}. ${place}`)
      .join("\n")}\n\nI can also help you plan an itinerary, estimate a budget or prepare a packing checklist.`;
  }

  // Default response
  return "I'm here to help with your travel plans! 🌍\n\nYou can ask me about:\n\n• Best places to visit\n• Trip itineraries\n• Hotel selection tips\n• Travel packing checklists\n• Budget planning\n• Transportation tips\n\nTry asking: \"Plan a 3-day trip to Ooty\" or \"What should I pack for travelling?\"";
}

function AITravelChatbot() {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = (e, selectedQuestion) => {
    e?.preventDefault();

    const question = (selectedQuestion || input).trim();

    if (!question || loading) return;

    const updatedMessages = [
      ...messages,
      { role: "user", content: question },
    ];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    // Generate a local response without an external API.
    setTimeout(() => {
      const reply = generateReply(question, updatedMessages);

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: reply },
      ]);

      setLoading(false);
    }, 500);
  };

  const startNewChat = () => {
    setMessages([initialMessage]);
    setInput("");
    setLoading(false);
  };

  const suggestions = [
    "Plan a 3-day trip to Ooty",
    "Suggest hotels in Kadapa",
    "What should I pack for travelling?",
    "Best places to visit in Kerala",
  ];

  return (
    <div className="travel-chat-page">
      <div className="travel-chat-container">
        <div className="travel-chat-header">
          <div className="travel-chat-icon">
            <Bot size={25} />
          </div>

          <div className="travel-chat-heading">
            <h2>TravelSmart Assistant</h2>
            <p>
              <span className="chat-online-dot"></span>
              Your personal travel assistant
            </p>
          </div>

          <button
            type="button"
            className="chat-new-button"
            onClick={startNewChat}
            title="Start a new chat"
          >
            <Plus size={17} />
            New chat
          </button>
        </div>

        <div className="travel-chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`travel-chat-message ${
                message.role === "user" ? "user" : "bot"
              }`}
            >
              <div className="travel-chat-avatar">
                {message.role === "user" ? (
                  <User size={19} />
                ) : (
                  <Bot size={19} />
                )}
              </div>

              <div className="travel-chat-bubble">
                {message.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="travel-chat-message bot">
              <div className="travel-chat-avatar">
                <Bot size={19} />
              </div>

              <div className="travel-chat-bubble chat-loading">
                TravelSmart is thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="travel-chat-suggestions">
            <p>Try asking:</p>

            <div className="chat-suggestion-list">
              {suggestions.map((suggestion) => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => sendMessage(null, suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          className="travel-chat-input-area"
          onSubmit={sendMessage}
        >
          <input
            type="text"
            placeholder="Ask anything about travelling..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            <Send size={19} />
          </button>
        </form>

        <p className="travel-chat-hint">
          <MapPin size={14} />
          Ask about any destination around the world.
        </p>
      </div>
    </div>
  );
}

export default AITravelChatbot;
