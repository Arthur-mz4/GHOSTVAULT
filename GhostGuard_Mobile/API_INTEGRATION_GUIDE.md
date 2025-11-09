# GhostGuard - API Integration Guide

## 🎯 **Better Free APIs We're Using**

Instead of VirusTotal (paid), we're integrating these FREE alternatives:

1. **MetaDefender** - File & URL scanning
2. **Hybrid Analysis** - Advanced malware analysis
3. **Xcitium (formerly Comodo)** - Threat intelligence
4. **ClamAV** - Open-source antivirus

---

## 📋 **What You Need to Get (API Keys)**

### **1. MetaDefender API**
**Website:** https://metadefender.opswat.com

**Steps:**
1. Go to https://metadefender.opswat.com
2. Click "Sign Up" (FREE account)
3. Verify your email
4. Go to Dashboard → API Keys
5. **Copy your API key**

**Free Tier:**
- ✅ 100 requests/day
- ✅ File & URL scanning
- ✅ Hash lookup
- ✅ Great for testing!

---

### **2. Hybrid Analysis API**
**Website:** https://www.hybrid-analysis.com

**Steps:**
1. Go to https://www.hybrid-analysis.com
2. Click "Sign Up" (FREE account)
3. Verify your email
4. Go to Profile → API Key
5. Click "Generate New API Key"
6. **Copy your API key**

**Free Tier:**
- ✅ 200 requests/day
- ✅ File analysis
- ✅ URL scanning
- ✅ Detailed reports

---

### **3. Xcitium (Comodo) API**
**Website:** https://verdict.valkyrie.comodo.com

**Steps:**
1. Go to https://verdict.valkyrie.comodo.com
2. Sign up for Valkyrie API
3. Get your API key from dashboard
4. **Copy your API key**

**Free Tier:**
- ✅ File analysis
- ✅ Verdict API
- ✅ Good for hash lookups

---

### **4. ClamAV (No API Key Needed!)**
**Website:** https://www.clamav.net

**How it works:**
- ✅ **Open-source** antivirus
- ✅ **No API key** required
- ✅ Can use signature database
- ✅ We'll use heuristics based on ClamAV rules

**Note:** For mobile, we'll use ClamAV's signature patterns for offline detection.

---

## 🔧 **How to Add Your API Keys to the App**

### **Method 1: Through the App (Easiest)**

1. **Open GhostGuard app**
2. **Go to Settings** (hamburger menu ☰ → Settings)
3. **Scroll down to "API Configuration" section**
4. **Enter your API keys:**
   - MetaDefender API Key
   - Hybrid Analysis API Key
   - Xcitium API Key
   - (ClamAV - No key needed)
5. **Save** - They're stored securely!

### **Method 2: Direct Configuration (Advanced)**

Edit `src/services/apiConfig.js`:
```javascript
export const API_KEYS = {
  metadefender: 'YOUR_METADEFENDER_KEY',
  hybridAnalysis: 'YOUR_HYBRID_ANALYSIS_KEY',
  xcitium: 'YOUR_XCITIUM_KEY',
  // ClamAV doesn't need a key
};
```

---

## 📊 **API Comparison**

| API | Free Limit | Best For | Response Time |
|-----|-----------|----------|---------------|
| **MetaDefender** | 100/day | Files, URLs, Hashes | Fast (1-2s) |
| **Hybrid Analysis** | 200/day | Deep file analysis | Slow (10-30s) |
| **Xcitium** | Varies | Quick verdicts | Fast (1-3s) |
| **ClamAV** | Unlimited | Offline scanning | Instant |

---

## 🔄 **How the App Will Use These APIs**

### **Scanning Strategy (Smart Cascade):**

1. **First: ClamAV Heuristics** (Offline, Instant)
   - Check file signatures
   - Pattern matching
   - No API needed

2. **Second: MetaDefender** (If unclear)
   - Quick hash lookup
   - URL reputation
   - Fast results

3. **Third: Hybrid Analysis** (If still unclear)
   - Deep analysis
   - Sandbox testing
   - Detailed report

4. **Fourth: Xcitium** (Final verdict)
   - Threat intelligence
   - Additional confirmation

### **Smart Features:**
- ✅ **Caches results** - Don't waste API calls
- ✅ **Rate limiting** - Respects free tier limits
- ✅ **Fallback system** - If one fails, use another
- ✅ **Offline mode** - ClamAV works without internet

---

## 🚀 **Quick Setup Checklist**

### **Step 1: Get API Keys**
- [ ] Sign up for MetaDefender
- [ ] Get MetaDefender API key
- [ ] Sign up for Hybrid Analysis
- [ ] Get Hybrid Analysis API key
- [ ] Sign up for Xcitium
- [ ] Get Xcitium API key
- [ ] (ClamAV - no signup needed)

### **Step 2: Add Keys to App**
- [ ] Open GhostGuard
- [ ] Go to Settings
- [ ] Enter MetaDefender key
- [ ] Enter Hybrid Analysis key
- [ ] Enter Xcitium key
- [ ] Save settings

### **Step 3: Test**
- [ ] Scan a test file
- [ ] Scan a test URL
- [ ] Check results
- [ ] Verify API usage in settings

---

## 💡 **API Usage Tips**

### **To Maximize Free Tier:**

1. **Enable Caching** (Settings → Advanced)
   - Reuses results for same files/URLs
   - Saves API calls

2. **Use Offline First** (Settings → Scan Priority)
   - Set to "Offline First"
   - Only uses APIs when needed

3. **Set Scan Levels** (Settings → Scan Level)
   - Quick: ClamAV only
   - Standard: ClamAV + MetaDefender
   - Deep: All APIs

4. **Monitor Usage** (Settings → API Usage)
   - See remaining daily limits
   - Track which API is used most

---

## 🔐 **API Key Security**

### **How Keys Are Stored:**
- ✅ **Encrypted** in secure storage
- ✅ **Never transmitted** except to official APIs
- ✅ **Not logged** or exposed
- ✅ **Can be deleted** anytime

### **Best Practices:**
- 🔒 Never share your API keys
- 🔄 Rotate keys monthly
- 📧 Use dedicated email for API accounts
- ⚠️ Set up alerts for unusual usage

---

## 📝 **Example API Responses**

### **MetaDefender Response:**
```json
{
  "scan_results": {
    "scan_all_result_a": "Clean",
    "total_avs": 30,
    "total_detected_avs": 0
  }
}
```

### **Hybrid Analysis Response:**
```json
{
  "verdict": "malicious",
  "threat_score": 85,
  "av_detect": "15/50"
}
```

### **Xcitium Response:**
```json
{
  "verdict": "trusted",
  "file_type": "PDF",
  "sha256": "abc123..."
}
```

---

## 🆘 **Troubleshooting**

### **Problem: "API Key Invalid"**
**Solution:**
1. Check key is copied correctly (no spaces)
2. Verify account is activated
3. Check API quota not exceeded

### **Problem: "Rate Limit Exceeded"**
**Solution:**
1. Wait for daily reset (usually midnight UTC)
2. Enable caching to reduce calls
3. Use offline mode when possible

### **Problem: "Scan Takes Too Long"**
**Solution:**
1. Some APIs (Hybrid Analysis) are slow
2. Check scan level settings
3. Use Quick Scan for faster results

### **Problem: "No Results"**
**Solution:**
1. Check internet connection
2. Verify API keys are entered
3. Try different scan level

---

## 📈 **Monitoring Your Usage**

### **In the App:**
Settings → API Usage Dashboard

**You'll see:**
- 📊 Requests used today
- 📈 Remaining quota
- 🔄 Reset time
- 📉 Usage history

### **On API Dashboards:**
- MetaDefender: https://metadefender.opswat.com/dashboard
- Hybrid Analysis: https://www.hybrid-analysis.com/my-account
- Xcitium: Check your account portal

---

## ✅ **What You Need to Provide:**

### **Immediately:**
1. ✅ MetaDefender API Key
2. ✅ Hybrid Analysis API Key
3. ✅ Xcitium API Key

### **Optional (For Better Features):**
4. ⚪ Email for API notifications
5. ⚪ Preferred scan priority
6. ⚪ Custom blocklist URLs

---

## 🎯 **Next Steps:**

1. **I'll update the code** to support all these APIs
2. **You get the API keys** from the websites above
3. **Enter keys in Settings** when app is ready
4. **Test scanning** with your keys
5. **Enjoy free, powerful scanning!** 🚀

---

**Questions to Answer:**
1. Have you signed up for these APIs yet?
2. Do you have the API keys ready?
3. Any specific features you want for each API?
4. Should I prioritize one API over others?

Let me know and I'll integrate them all! 🎊


