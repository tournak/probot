const chatMessages = document.getElementsByClassName("messages")[0];
const thinkingMessage = document.getElementsByClassName("thinking")[0];
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");

const WEBHOOK_URL = "https://probot.keegant.dev/webhook/033400de-aace-4432-8096-63dce19044a4";
const SESSION_ID = Date.now();

function addMessage(text, userMessage) {
    const message = document.createElement("div");
    message.classList.add("message");
    message.classList.add(userMessage ? "user-message" : "bot-message");
    message.innerHTML = text;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function fetchBotResponse(userMessage) {
    const thinking = document.createElement("div");
    thinking.classList.add("thinking");
    thinking.textContent = "thinking ...";
    chatMessages.appendChild(thinking);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                sessionId: SESSION_ID,
                action: "sendMessage",
                chatInput: userMessage,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP Error - Status: ${response.status}`);
        }

        const data = await response.json();

        thinking.remove();

        const message = marked.parse(data.output);
        addMessage(message, false);

    } catch (error) {
        console.error("Error fetching response:", error);
        addMessage("Sorry, I had trouble connecting to the servers. Check the console for details.", false);
    } finally {
        thinkingMessage.style.display = "none";
    }
}

function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText === "") return;

    addMessage(messageText, true);

    messageInput.value = "";

    fetchBotResponse(messageText);
}

sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});
