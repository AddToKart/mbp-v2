# MariBot Troubleshooting Guide

## ✅ Fix Applied: Updated to Gemini 2.0 Flash

The API endpoint has been updated to use the latest **Gemini 2.0 Flash** model for better performance and reliability.

## Changes Made

### 1. Updated API Endpoint

**Old:** `gemini-pro:generateContent`
**New:** `gemini-2.0-flash-exp:generateContent`

### 2. Enhanced Configuration

Added proper generation config parameters:

- `temperature: 0.7` - Controls randomness
- `maxOutputTokens: 200` - Response length (increased from 150)
- `topP: 0.95` - Nucleus sampling
- `topK: 40` - Top-K sampling

### 3. Better Error Handling

Now logs detailed error information to console for easier debugging.

## Testing Your Setup

### 1. Verify API Key

Check your `.env.local` file:

```env
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...
```

**Common Issues:**

- Missing `NEXT_PUBLIC_` prefix
- Extra spaces or quotes around the key
- File named incorrectly (should be `.env.local` not `.env.local.txt`)

### 2. Restart Your Dev Server

After adding/changing the API key:

```bash
# Press Ctrl+C to stop the server
npm run dev
```

### 3. Check Browser Console

Open DevTools (F12) and look for:

- ✅ No errors = Working properly
- ❌ "Failed to get response" = API key issue
- ❌ CORS errors = API key restrictions

## Common Errors & Solutions

### Error: "Failed to get response from Gemini"

**Possible Causes:**

1. **Invalid API Key**

   - Solution: Double-check your key at https://makersuite.google.com/app/apikey
   - Ensure it's not expired or restricted

2. **API Key Restrictions**

   - Solution: In Google AI Studio, check API key restrictions
   - Make sure HTTP referrers include your domain (localhost for dev)

3. **Network Issues**
   - Solution: Check your internet connection
   - Try again in a few moments

### Error: "Unable to connect to knowledge base"

**Cause:** API key not found in environment variables

**Solution:**

1. Create `.env.local` file in project root
2. Add: `NEXT_PUBLIC_GEMINI_API_KEY=your_key_here`
3. Restart dev server

### Chat Button Not Visible

**Solutions:**

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh page (Ctrl+Shift+R)
3. Check if JavaScript is enabled
4. Try a different browser

### Messages Not Appearing

**Solutions:**

1. Check browser console for errors
2. Ensure you're typing a message
3. Try clicking the send button instead of Enter
4. Refresh the page

## API Key Setup Checklist

- [ ] Created account at https://makersuite.google.com
- [ ] Generated API key
- [ ] Created `.env.local` file (not `.env.local.txt`)
- [ ] Added `NEXT_PUBLIC_GEMINI_API_KEY=your_key`
- [ ] No extra spaces or quotes around key
- [ ] Restarted development server
- [ ] Cleared browser cache
- [ ] Tested chat button

## Verify Installation

1. **See the floating chat button?** ✅ Frontend working
2. **Can open chat window?** ✅ UI working
3. **See welcome message?** ✅ State management working
4. **Type and send message?** ✅ Input working
5. **Get AI response?** ✅ API working

If you can do all 5, MariBot is fully operational! 🎉

## Still Having Issues?

### Check These Files:

1. `components/MariBot.tsx` - Main component
2. `components/ClientLayout.tsx` - Integration point
3. `.env.local` - Environment variables

### Debug Mode

Add this to see API responses in console:

In `MariBot.tsx`, after line 98, add:

```typescript
console.log("Gemini Response:", data);
```

### Get Help

- Check the console (F12) for error messages
- Review the full error stack trace
- Verify API key permissions in Google AI Studio
- Check network tab in DevTools for failed requests

## Model Information

**Current Model:** Gemini 2.0 Flash (Experimental)

- **Endpoint:** `gemini-2.0-flash-exp`
- **Best for:** Fast, conversational responses
- **Response time:** ~1-3 seconds
- **Cost:** Free tier available

**Alternative Models:**

- `gemini-2.0-flash`: Stable version
- `gemini-1.5-flash`: Previous generation
- `gemini-1.5-pro`: More detailed responses (slower)

To change model, update line 57 in `MariBot.tsx`:

```typescript
`https://generativelanguage.googleapis.com/v1beta/models/MODEL_NAME:generateContent?key=${apiKey}`;
```

---

**Everything should work now with Gemini 2.0 Flash!** 🚀
