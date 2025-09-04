console.log("Hello from chatbot.js");

// Global Variables
let botReply = "";
let userPrompt = "";

setText("chatbot-reply", "Test Message");

// Event Handler for the submit-btn
onEvent("submit-btn", "click", function () {
  console.log("Submit Button Clicked!");
  userPrompt = getValue("chatbot-input");
  if (userPrompt === "") {
    setText("chatbot-reply", "⚠️ Please enter something!");
    setProperty("chatbot-reply", "color", "red");
  } else {
    setText("chatbot-reply", "Thinking...");
    setProperty("chatbot-reply", "color", "green");
  }

  console.log("User Prompt: ", userPrompt);
  sendToModel();
});

// Event Handler for the HuggingFace button
onEvent("askModel", "click", function () {
  sendToModel();
});

// Fetch from HuggingFace function
function sendToModel() {
  console.log("sendToModel called");
  async function query(data) {
    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    return result;
  }

  query({
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    model: "meta-llama/Llama-3.1-8B-Instruct:fireworks-ai",
  }).then((response) => {
    console.log(JSON.stringify(response));
    
    // Step 17 - breaking up the Model response
    console.log(response.choices);
    console.log(response.choices[0]);
    console.log(response.choices[0].message);
    console.log(response.choices[0].message.content);

    // Update botReply variable to response content
    botReply = response.choices[0].message.content;
    console.log(botReply);

    // Render the reply in the output area
    setText("chatbot-reply", botReply);
    setProperty("chatbot-reply", "color", "purple");
  });
}

function displayResponse() {}
