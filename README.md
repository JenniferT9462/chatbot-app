# 🤖 How to Build Your Own AI Chatbot

Ready to build your own chatbot, image generator, and story writer? We'll use HTML, CSS, and JavaScript to make an app that talks to a powerful AI model.

-----

## Step 1: The Building Blocks (Your Files)

First, you need to create all the files that make up your project. 

1.  **`index.html`**: This is your webpage's foundation. It tells the browser what to display.
2.  **`style.css`**: This file makes your webpage look good.
3.  **`chatbot.js`**: This is the "brain" of your app, where all the magic happens. It handles what your buttons do.
4.  **`helpers-full.js`**: This is a toolbox of pre-written code that makes building your app easier.
5.  **`secret-variables.js`**: This file will hold your secret AI key. It's important to keep this private\!
6.  **`.gitignore`**: This file tells Git (a tool for saving your code) to ignore your secret key file.

-----

## Step 2: Designing Your App (`index.html`)

Open `index.html` and paste in the HTML code. Here's a quick look at what some of the key parts do.

**The Chatbot Section**

This code creates the main chatbot area. We use **IDs** like `submit-btn` and `chatbot-input` to give each element a unique name. This is how our JavaScript knows what to control.

```html
<h2>Ask a question...</h2>

<input id="chatbot-input" type="text" />
<button id="submit-btn">Submit</button>

<pre id="chatbot-reply">
  Type a question in the input area...
</pre>
```


**Linking the Files**

At the very bottom of your `index.html`, you link your JavaScript files. The order is important\!

```html
<script src="helpers-full.js"></script>
<script src="secret-variables.js"></script>
<script src="chatbot.js"></script>
```

We load the **helpers** first because the **chatbot logic** needs them. And we load the **secrets** before the **chatbot** so the key is ready when needed.

-----

## Step 3: Making It Look Good (`style.css`)

This part is easy. The CSS makes sure the AI's response keeps its original line breaks, which is important for things like markdown formatting.

```css
#chatbot-reply {
  white-space: pre-wrap;
}
```

-----

## Step 4: Your Secret Key (`secret-variables.js` & `.gitignore`)

To use the AI, you need a special code called an **API key**. Go to Hugging Face, sign up for an account, and get a **free access token**.

1.  Create a file named `secret-variables.js`.
2.  Inside it, paste this code, replacing `YOUR_API_KEY_HERE` with your actual token.
```js
const HF_TOKEN = "YOUR_API_KEY_HERE";
```

**Why is this a separate file?** Because you never want to accidentally share your private key. If you use Git to save your code, create a `.gitignore` file and type `secret-variables.js` inside it. This tells Git to ignore that file.

-----

## Step 5: The Brains of the App (`chatbot.js`)

This is the most important part\! Open `chatbot.js` and paste in the code. Let's break down what the different parts do.

### **The Chatbot Code**

1.  **Event Handler**: This code waits for someone to click the `submit-btn`. When they do, the function runs.

    ```javascript
    onEvent("submit-btn", "click", function () {
      let userPrompt = getValue("chatbot-input"); // Get the text from the input box.
      // ... (code to check if the input is empty)
      sendToModel(); // Send the user's text to the AI.
    });
    ```

    The `onEvent` and `getValue` functions come from `helpers-full.js`.

2.  **`sendToModel()` Function**: This function does the heavy lifting.

    ```javascript
    function sendToModel() {
      // The actual API call to Hugging Face
      async function query(data) {
        const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
          headers: { Authorization: `Bearer ${HF_TOKEN}` },
          method: "POST",
          body: JSON.stringify(data),
        });
        const result = await response.json();
        return result;
      }

      query({
        messages: [ { role: "user", content: userPrompt }],
        model: "meta-llama/Llama-3.1-8B-Instruct:fireworks-ai",
      }).then((response) => {
        let botReply = response.choices[0].message.content;
        setText("chatbot-reply", botReply); // Show the reply on the screen.
      });
    }
    ```
The `query()` function sends data to the AI. The `messages` array is like a conversation script: we tell the AI its **role** (system) and then give it the user's question (user). The AI processes this and sends back a response, which we then display on the page.

---

## Extra Challenges

### Adding different roles to the fetch call:
- Add this to your chatbot area in your `index.html`, so the user can select different ways they want the output to be for their question:
```html
<!-- Get user to select role based prompts -->
<select id="role-select">
    <option value="friendly">Friendly Teacher</option>
    <option value="emoji">Emoji Bot</option>
    <option value="oneword">One-Word Answer</option>
    <option value="markdown">Markdown Formatter</option>
</select>
```
- In `chatbot.js` make a global variable for the system prompt: `let systemPrompt = "";` 
- Inside `sendToModel` function declare a variable for the user's role choice:
```js
 // Get Selected role
  let roleChoice = getValue("role-select");
```
- Now we want to use a different role based on the user's choice. We will need to add conditionals to decide the prompt based on what the user chooses:
```js
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
```
- Finally, we need to incorporate the system prompt to the fetch, we add this under the `query()` of our `sendToModel` right above the user prompt:
```js
    {
        role: "system",
        content: systemPrompt,
    },
```
---

### The Mad Libs Section

This part is for the Mad Libs game. We have three input areas: one for a `name`, one for an `activity`, and a dropdown for the `mood`.

```html
<h3>Mad Lib Generator</h3>
<input id="name-input" placeholder="Enter a name" />
<input id="activity-input" placeholder="Enter an activity" />
<select id="mood-select">
  <option value="happy">Happy</option>
  <option value="scary">Scary</option>
  <option value="funny">Funny</option>
</select>
<button id="madlib-btn">Generate Story</button>

<pre id="madlib-output"></pre>
```

**The Mad Libs Code**

1.  **Event Handler**: This listens for the `madlib-btn` click.

    ```javascript
    onEvent("madlib-btn", "click", function () {
      getMadlib();
    });
    ```

2.  **`getMadlib()` Function**:

    ```javascript
    function getMadlib() {
      let name = getValue("name-input");
      let activity = getValue("activity-input");
      let mood = getValue("mood-select");

      // A 'template literal' to build the prompt.
      let userPrompt = `Write a short ${mood} story about ${name} who loves to ${activity}.`;

      // Call the AI and get the story back.
      // (The query() function is the same as the chatbot's)
      // ... (code to make the API call and display the story)
    }
    ```

    We use a **template literal** (the backticks `` ` ``) to easily put the user's answers (`${name}`, `${activity}`, etc.) directly into a sentence to send to the AI.

---

### Combining Madlibs and different styles

- We can add conditionals to determine what style to use based on the user's mood choice. Add this to the `getMadlib()` function after getting the values of the inputs:
```js
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
```
---

### **The Image Generator Code**
With the image generator, you will need to search for a text-to-image model on Hugging Face. Then, get the javaScript -> fetch...code snippet like we did for the text generation model. You will then add that to your event handler for the image button. 

1. **HTML**
```html
<!-- Image Generator -->
  <div class="container-fluid mb-4">
    <h2>Generate an Image </h2>
    <input id="img-prompt" type="text" placeholder="Describe an image..." />
    <button id="img-btn" class="btn btn-info btn-sm">Generate Image</button>
        <br />

    <div
      class="card shadow border mb-4 rounded-2 text-secondary p-3 shadow"
        >
      <div class="card-body">
        <h5 class="card-title">Generated Image...</h5>
        <img
          id="output-img"
          class="card-img"
          src=""
          style="max-width: 300px; margin-top: 10px"
        />
            
      </div>
    </div>
```
        
2.  **Event Handler**: This waits for the `img-btn` to be clicked.

    ```javascript
    onEvent("img-btn", "click", async function () {
      let imagePrompt = getValue("img-prompt");
      // ... (code to call the image API)
    });
    ```

2.  **Displaying the Image**: The response from the AI is a **Base64 string**, which is a long string of letters and numbers that represents the image data. The code in the `.then()` part converts this string into an actual image that your browser can display. This is what worked for me:
```js
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
```

    
And that's it\! When you're done, save all your files and open `index.html` in your web browser to see your project in action.