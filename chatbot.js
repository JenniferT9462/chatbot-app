console.log("Hello from chatbot.js");

// Global Variables
let botReply = "";
let userPrompt = "";
let systemPrompt = "";
let imagePrompt = "";

// setText("chatbot-reply", "Test Message");

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
// onEvent("askModel", "click", function () {
//   sendToModel();
// });

// Fetch from HuggingFace function
function sendToModel() {
  console.log("sendToModel called");

  // Get Selected role
  let roleChoice = getValue("role-select");

  // Decide prompt based on role
  if (roleChoice === "friendly") {
    systemPrompt = "You as a kind assistant who explains concepts simply.";
  } else if (roleChoice === "emoji") {
    systemPrompt = "Reply using only emojis that match the user's message.";
  } else if (roleChoice === "oneword") {
    systemPrompt = "Reply with only one word.";
  } else if (roleChoice === "markdown") {
    systemPrompt = "Always reply in Markdown format with bold headings.";
  }

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
      // Step - 32 -  Role-based prompts
      {
        role: "system",
        content: systemPrompt,
      },
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
    setProperty("chatbot-reply","color", "purple");
  });
}

// TODO: Add a custom response display for reply
function displayResponse() {}

//====== MadLib Generator ======
onEvent("madlib-btn", "click", function () {
  console.log("Madlib Button Clicked!");
  getMadlib();
});

// Function to fetch from model for Madlib
function getMadlib() {
  // Get user inputs
  let name = getValue("name-input"); 
  let activity = getValue("activity-input");
  let mood = getValue("mood-select");

  // Change background & text color based on mood
  if (mood === "scary") {
    setProperty("madlib-output", "background", "black");
    setProperty("madlib-output", "color", "orange");
  } else if (mood === "happy") {
    setProperty("madlib-output", "background", "pink");
    setProperty("madlib-output", "color", "purple");
  } else {
    // default styling for other moods
    setProperty("madlib-output", "background", "yellow");
    setProperty("madlib-output", "color", "blue");
  }

  //Template literal for prompt
  userPrompt = `Write a short ${mood} story about ${name} who loves to ${activity}.`;
  console.log("Mad Lib Prompt:", userPrompt);

  // Async function
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

    // Update botReply variable to response content
    story = response.choices[0].message.content;
    console.log(story);

    // Render the reply in the output area
    setText("madlib-output", story);
    
  });
}

//======Image generator functions======

// Event handler for img-btn
onEvent("img-btn", "click", async function () {
  console.log("Generate Image Clicked!");

  imagePrompt = getValue("img-prompt");
  console.log("Image Prompt: ", imagePrompt);

  async function query(data) {
    const response = await fetch(
      "https://router.huggingface.co/together/v1/images/generations",
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    // Check if the response is not a valid image
    if (!response.ok) {
      const errorBody = await response.json();
      console.error("API Error:", errorBody);
      // You can also display this to the user
      alert(
        "Error generating image: " + errorBody.detail ||
          "An unknown error occurred."
      );
      return null;
    }

    // Since the API returns JSON, we parse it as JSON
    const result = await response.json();
    return result;
  }

  query({
    prompt: imagePrompt,
    response_format: "base64",
    model: "black-forest-labs/FLUX.1-dev",
  }).then((result) => {
    // If the API call failed, result will be null
    if (!result) {
      return;
    }

    // Check for the expected data structure
    if (result.data && result.data[0] && result.data[0].b64_json) {
      const base64Image = result.data[0].b64_json;

      // Convert the base64 string back into a Blob
      const byteCharacters = atob(base64Image);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });

      // Use the Blob to create a URL
      const imageUrl = URL.createObjectURL(blob);
      document.getElementById("output-img").src = imageUrl;
    } else {
      console.error("No valid image data found in API response.");
    }
  });
});
