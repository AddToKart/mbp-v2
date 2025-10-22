# MariBot Conversation Memory

## 🧠 How It Works

MariBot now has **conversation memory** - it remembers the entire chat history during each session and maintains context throughout the conversation!

## Features

### ✅ What It Remembers

- **All previous messages** in the current chat session
- **Context from earlier questions** to provide relevant follow-ups
- **Topics discussed** to avoid repeating information
- **User preferences** mentioned during the conversation

### 🔄 How It Works

1. **Session-Based Memory**

   - Memory persists while the chat window stays open
   - Remembers all messages from the current session
   - Can reference previous parts of the conversation

2. **Context Building**

   - Sends full conversation history to Gemini with each new message
   - Gemini uses this context to provide coherent, contextual responses
   - Maintains natural conversation flow

3. **Memory Reset**
   - Memory clears when you close the chat window
   - Fresh start each time you reopen MariBot
   - No data stored between sessions (privacy-first!)

## Example Conversations

### Without Memory (Old Behavior)

```
User: "What are your office hours?"
Bot: "Our municipal office is open Mon-Fri 8AM-5PM."

User: "What about Saturday?"
Bot: "I'd be happy to help! What would you like to know?"
❌ Lost context - doesn't know we were talking about hours
```

### With Memory (New Behavior)

```
User: "What are your office hours?"
Bot: "Our municipal office is open Mon-Fri 8AM-5PM."

User: "What about Saturday?"
Bot: "We're closed on weekends, but you can access online services 24/7!"
✅ Remembers we were discussing office hours!
```

## Technical Implementation

### Conversation History Structure

```typescript
// Each message sent includes full conversation context
{
  contents: [
    { role: "user", parts: [{ text: "System prompt" }] },
    { role: "model", parts: [{ text: "Acknowledgment" }] },
    { role: "user", parts: [{ text: "Previous user message" }] },
    { role: "model", parts: [{ text: "Previous bot response" }] },
    { role: "user", parts: [{ text: "Current user message" }] },
  ];
}
```

### Key Components

1. **Conversation History Builder** (line ~60)

   - Filters out welcome message
   - Converts messages to Gemini format
   - Maintains role alternation (user/model)

2. **System Prompt** (line ~68)

   - Sets MariBot's personality and role
   - Includes instruction to remember context
   - Sent with every request for consistency

3. **Context Integration** (line ~94)
   - Combines system prompt + history + new message
   - Sends to Gemini API
   - Returns contextual response

## Benefits

### For Users 🎯

- **Natural Conversations**: No need to repeat context
- **Follow-up Questions**: Ask "What about..." or "Tell me more"
- **Efficient**: Get better answers faster
- **Intuitive**: Feels like talking to a real person

### For the Municipality 🏛️

- **Better Service**: More accurate, helpful responses
- **Reduced Confusion**: Less back-and-forth clarification
- **Improved UX**: Higher user satisfaction
- **Professional**: Shows attention to detail

## Privacy & Data

### ✅ What's Stored

- **During Chat Session**: Messages stored in browser memory (React state)
- **Sent to API**: Conversation history sent to Gemini for context

### ❌ What's NOT Stored

- **No Database**: Nothing saved to your server
- **No Cookies**: No persistent storage
- **No Long-term Memory**: Cleared when chat closes
- **No Cross-Session**: Each session is independent

### 🔒 Privacy Features

- **Session-only**: Memory only lasts while chat is open
- **Client-side**: Messages stay in user's browser
- **Temporary API**: Gemini processes but doesn't permanently store
- **User Control**: Close chat = clear memory

## Performance Considerations

### Token Usage

- Longer conversations = more tokens sent
- Each message includes full history
- Automatically managed by `maxOutputTokens: 200`

### Optimization

- Welcomes message excluded from history (saves tokens)
- Only includes actual user/bot exchanges
- System prompt reused efficiently

### Limits

- Gemini 2.0 Flash handles long conversations well
- Typical conversation: 10-15 messages = ~2-3K tokens
- Well within API limits (free tier: 1M tokens/day)

## Testing the Memory

Try these conversation patterns:

### 1. Follow-up Questions

```
You: "Do you handle building permits?"
Bot: [Responds about permits]
You: "How long does it take?"
Bot: [Remembers we're discussing permits!]
```

### 2. Topic Continuity

```
You: "I need to pay property tax"
Bot: [Explains process]
You: "What's the deadline?"
Bot: [Knows you mean property tax deadline]
```

### 3. Pronoun References

```
You: "Tell me about the new community center"
Bot: [Describes center]
You: "When does it open?"
Bot: [Knows "it" = community center]
```

### 4. Multi-step Guidance

```
You: "How do I report a pothole?"
Bot: [Gives step 1]
You: "Then what?"
Bot: [Continues with next steps]
```

## Customization

### Adjust Memory Depth

Currently includes all messages. To limit history:

```typescript
// In sendMessageToGemini function, modify:
const conversationHistory = messages
  .filter((msg) => msg.id !== "welcome")
  .slice(-10) // Only last 10 messages
  .map((msg) => ({
    role: msg.sender === "user" ? "user" : "model",
    parts: [{ text: msg.text }],
  }));
```

### Change System Prompt

Update the personality/instructions (line ~71):

```typescript
text: `You are MariBot... [your custom instructions]`;
```

### Clear Memory Button

To add a "Clear History" button, add this to the UI:

```typescript
const clearHistory = () => {
  setMessages([
    {
      id: "welcome",
      text: "👋 Hello! I'm MariBot...",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
};
```

## Troubleshooting

### Memory Seems to Forget

- Check console for API errors
- Verify conversation history is being sent
- Ensure messages array is updating properly

### Responses Seem Off-Context

- Review system prompt clarity
- Check if history is being filtered correctly
- Verify role alternation (user/model/user/model)

### Performance Issues

- Consider limiting history to last N messages
- Monitor token usage in API console
- Check network tab for request sizes

## Future Enhancements

Possible improvements:

- **Persistent Memory**: Store in localStorage for cross-session
- **Export Chat**: Download conversation as text/PDF
- **Smart Summarization**: Compress old messages
- **Topic Detection**: Track conversation themes
- **Suggested Follow-ups**: AI-generated next questions

---

**MariBot now remembers! Enjoy natural, contextual conversations!** 🧠✨
