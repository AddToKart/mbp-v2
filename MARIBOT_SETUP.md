# 🎉 MariBot Chatbot - Quick Setup

## What Was Added

✅ **MariBot** - Your new AI-powered municipal assistant!

- Witty chatbot named "MariBot" (Maria + Bot)
- Powered by Google Gemini AI
- Floating chat button on all pages
- Matches your design system perfectly

## Files Created/Modified

### New Files:

1. `components/MariBot.tsx` - The chatbot component
2. `.env.local.example` - Environment variable template
3. `MARIBOT_README.md` - Detailed documentation

### Modified Files:

1. `components/ClientLayout.tsx` - Added MariBot integration

## 🚀 Setup (3 Easy Steps)

### Step 1: Get Your Gemini API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

### Step 2: Create Environment File

Create a file named `.env.local` in your project root:

```env
NEXT_PUBLIC_GEMINI_API_KEY=paste_your_api_key_here
```

### Step 3: Restart Your Dev Server

```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
```

## ✨ That's It!

You should now see a floating chat button in the bottom-right corner on all pages!

## 🎨 Features

- **Smart AI**: Powered by Google Gemini 2.0 Flash
- **Conversation Memory**: Remembers context during chat sessions
- **Witty Personality**: Friendly and professional
- **Theme Support**: Works with light, dark, and glass themes
- **Smooth Animations**: Beautiful motion effects
- **Responsive**: Works on all devices
- **Always Visible**: Present on every page

## 🔧 Customization

Want to change MariBot's personality? Edit the system prompt in `components/MariBot.tsx` around line 65.

## 📚 More Info

- **`MARIBOT_README.md`** - Detailed documentation and customization
- **`MARIBOT_MEMORY.md`** - Learn how conversation memory works
- **`MARIBOT_TROUBLESHOOTING.md`** - Common issues and solutions
- **`MARIBOT_DESIGN.md`** - Design specifications and UI details

---

**No existing functionality was changed - MariBot was simply added on top!** 🎊
