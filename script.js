const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// Function to append messages
function appendMessage(message, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", `${sender}-message`);

  const avatar = document.createElement("img");
  avatar.src = sender === "user" ? "user-avatar.png" : "bot-avatar.png";
  avatar.alt = sender;

  const content = document.createElement("div");
  content.classList.add("content");
  content.textContent = message;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll to the latest message
}

// Save chat history to localStorage
function saveChatHistory() {
  const messages = Array.from(chatWindow.querySelectorAll(".message")).map((msg) => ({
    sender: msg.classList.contains("user-message") ? "user" : "bot",
    content: msg.querySelector(".content").textContent,
  }));
  localStorage.setItem("chatHistory", JSON.stringify(messages));
}

// Load chat history from localStorage
function loadChatHistory() {
  const chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  chatHistory.forEach(({ sender, content }) => appendMessage(content, sender));
}

// Fetch bot response from OpenAI API
async function fetchBotResponse(userMessage) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `sk-...UWMA`, // Replace with your OpenAI API key
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching bot response:", error);
    return "Sorry, something went wrong.";
  }
}

// Handle user input
async function handleUserInput() {
  const userMessage = userInput.value.trim();
  if (userMessage) {
    // Display user message
    appendMessage(userMessage, "user");

    // Fetch and display bot response
    const botResponse = await fetchBotResponse(userMessage);
    appendMessage(botResponse, "bot");

    // Save chat history
    saveChatHistory();

    // Clear input field
    userInput.value = "";
  }
}

// Event listeners
sendButton.addEventListener("click", handleUserInput);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleUserInput();
});

// Load chat history on page load
document.addEventListener("DOMContentLoaded", loadChatHistory);
