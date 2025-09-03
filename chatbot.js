console.log("Hello from chatbot.js");
setText("chatbot-reply", "Test Message");

onEvent("submit-btn", "click", function() {
    console.log("Submit Button Clicked!");
    const input = getValue("chatbot-input");
    console.log(input);

    if(input === "") {
        setText("chatbot-reply", "⚠️ Please enter something!");
        setProperty("chatbot-reply", "color", "red");
    } else {
        setText("chatbot-reply", "Thinking...");
        setProperty("chatbot-reply", "color", "green");
    }
})