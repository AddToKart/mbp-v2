# MariBot - Santa Maria Municipality AI Assistant

MariBot is a friendly, witty AI-powered chatbot assistant for Santa Maria Municipality, powered by Google's Gemini AI.

## Features

- 🤖 **AI-Powered**: Uses Google Gemini 2.0 Flash for intelligent responses
- 💬 **Conversational**: Natural, friendly, and witty personality
- 🎨 **Design Consistency**: Matches your system's design principles
- 📱 **Responsive**: Works seamlessly on all devices
- 🌓 **Theme Support**: Adapts to light, dark, and glass themes
- ✨ **Smooth Animations**: Beautiful motion effects with Framer Motion

## Setup Instructions

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Environment Variables

1. Create a `.env.local` file in the root directory (copy from `.env.local.example`):

```bash
cp .env.local.example .env.local
```

2. Add your Gemini API key:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

### 3. That's It!

MariBot is now ready to assist your citizens! The chatbot will appear as a floating button on all pages.

## How It Works

- **Floating Button**: A chat icon button appears in the bottom-right corner
- **Click to Open**: Citizens can click the button to open the chat window
- **Ask Questions**: Users can ask about municipal services, announcements, and more
- **AI Responses**: MariBot provides helpful, contextual answers powered by Gemini
- **Always Available**: Present on every page of your website

## Customization

### Change MariBot's Personality

Edit the system prompt in `components/MariBot.tsx` (line ~65):

```typescript
text: `You are MariBot, the friendly and witty virtual assistant for Santa Maria Municipality...`;
```

### Adjust Response Length

Modify the `maxOutputTokens` value in the Gemini API call (around line ~88):

```typescript
generationConfig: {
  temperature: 0.7,
  maxOutputTokens: 200, // Change this value
  topP: 0.95,
  topK: 40,
}
```

### Change Colors

MariBot automatically uses your theme's primary colors. To customize further, edit the Tailwind classes in `components/MariBot.tsx`.

## Troubleshooting

### MariBot isn't responding

- Check that your API key is correctly set in `.env.local`
- Ensure the file is named exactly `.env.local` (not `.env.local.txt`)
- Restart your development server after adding the API key

### API Key errors

- Verify your API key is active at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Check for any typos in your `.env.local` file
- Ensure there are no extra spaces around the API key

### Chat window not appearing

- Clear your browser cache
- Check the browser console for any errors
- Ensure JavaScript is enabled in your browser

## Privacy & Security

- MariBot runs client-side and connects directly to Google's Gemini API
- No messages are stored on your server
- Messages are only sent to Google for processing
- Review [Google's Gemini API Terms](https://ai.google.dev/terms) for data handling policies

## Performance

- Lazy loads with a 1-second delay to not impact initial page load
- Lightweight component (~15KB)
- Optimized animations for smooth performance
- Automatic message history management

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Need Help?

If you encounter any issues with MariBot, please contact the development team or check the Next.js and Gemini API documentation.

---

**Made with ❤️ for Santa Maria Municipality**
