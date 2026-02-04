# 🤖 Making Your AI Chatbot LIVE for Everyone

Your website is currently in **Showcase Mode**. To make the AI chat work for every visitor on the live GitHub URL, follow these simple steps:

### 1. Get your Gemini API Key
If you don't have one, get it for free at: [Google Ai Studio](https://aistudio.google.com/app/apikey)

### 2. Activate the neural link
Open the file: `services/aiService.ts`

Find this section (at the top):
```typescript
// To make the AI work for EVERYONE who visits your website, 
// paste your Gemini API Key in the quotes below.
const PUBLIC_API_KEY = "PASTE_YOUR_KEY_HERE"; 
```

### 3. Save and Push
1. Paste your key inside the quotes.
2. Save the file.
3. Run these commands in your terminal:
   ```bash
   npm run build
   npx gh-pages -d dist
   git add .
   git commit -m "feat: Activate live chat for everyone"
   git push origin master
   ```

---

### 📱 Mobile UI Update
The "Intro Video" has been minimized on mobile. It now appears as a sleek, glass-bordered **Logo Reveal** instead of a full-screen video, giving it a much more premium "App-like" feel.

### 🔐 Security Note
By putting your key in `PUBLIC_API_KEY`, your AI chatbot will become a **Live Assistant** for anyone who visits your site. Note that the key will be visible in the source code to advanced users. For a personal portfolio, this is usually acceptable for the convenience of showing off your AI skills! 🚀🌅
