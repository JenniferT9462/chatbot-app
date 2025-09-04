console.log("Hello from chatbot.js");

// Global Variables
let botReply = "";
let userPrompt = "";

setText("chatbot-reply", "Test Message");

// Event Handler for the submit-btn
onEvent("submit-btn", "click", function () {
  // Proof of Life - submit button
  console.log("Submit Button Clicked!");

  // Get user input
  userPrompt = getValue("chatbot-input");

  // Check if input is empty
  if (userPrompt === "") {
    // Show validation message
    setText("validation-message", "⚠️ Please enter something!");
    setProperty("validation-message", "color", "red");

    // Also show error in reply box
    setText("chatbot-reply", "⚠️ Please enter something!");
    setProperty("chatbot-reply", "color", "red");

    return; //stop here if empty
  } else {
    // Clear validation when input is valid
    setText("validation-message", "");
    setProperty("validation-message", "color", "black");

    // Continue normal flow
    setText("chatbot-reply", "Thinking....");
    setProperty("chatbot-reply", "color", "green");

    //Log userInput and send to model
    console.log("User Prompt: ", userPrompt);
    sendToModel();
  }
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
