# GhostGuard - API Testing Guide

## 🧪 **Test Each API One by One**

Let's systematically test each scanning API to see which works best!

---

## 📱 **STEP 1: Test Offline + PhishTank (NO SIGNUP NEEDED!)**

### **What's Active:**
- ✅ Offline Heuristics (always on)
- ✅ PhishTank (automatic, no API key)

### **How to Test:**

1. **Reload the app** (shake phone → Reload)

2. **Open Link Scanner:**
   - Tap hamburger menu (☰)
   - Tap "Link Scanner"

3. **Test URL #1 - Safe Site:**
   ```
   https://google.com
   ```
   - Tap "Scan Now"
   - **Expected:** ✅ SAFE
   - **Should show:** "Scanned by: Offline Heuristics, PhishTank"

4. **Test URL #2 - Suspicious Pattern:**
   ```
   https://free-virus-scan.tk/login
   ```
   - Tap "Scan Now"
   - **Expected:** ⚠️ THREAT DETECTED
   - **Why:** .tk domain + "login" keyword

5. **Test URL #3 - IP Address:**
   ```
   http://192.168.1.1/admin
   ```
   - Tap "Scan Now"
   - **Expected:** ⚠️ THREAT DETECTED (suspicious IP)

### **What to Check:**
- ✅ Does it scan instantly?
- ✅ Are results accurate?
- ✅ Can you see which engines scanned?
- ✅ Is the UI nice and clear?

### **Score PhishTank + Offline:**
**Speed:** ⭐⭐⭐⭐⭐ (Instant!)  
**Accuracy:** ⭐⭐⭐ (Basic)  
**Free Tier:** ⭐⭐⭐⭐⭐ (Unlimited!)  

---

## 📱 **STEP 2: Add URLScan.io**

### **Get API Key (2 minutes):**

1. Go to: **https://urlscan.io/user/signup**
2. Enter email + password
3. Verify email
4. Go to: **https://urlscan.io/user/profile/**
5. **Copy API key** (shows immediately!)

### **Add to App:**

1. Open GhostGuard
2. Hamburger menu → Settings
3. Scroll to "API Configuration"
4. Paste in **"URLScan.io API Key"** field
5. It auto-saves!

### **Test Again:**

1. **Go to Link Scanner**

2. **Test URL #1:**
   ```
   https://github.com
   ```
   - **Expected:** ✅ SAFE
   - **Should now show:** "Scanned by: Offline Heuristics, PhishTank, URLScan.io"

3. **Test URL #2:**
   ```
   https://malware-test-site.example
   ```
   - Wait ~5 seconds (URLScan is slower)
   - Check results

### **What to Check:**
- ✅ Do you see "URLScan.io" in sources?
- ✅ Are results more detailed?
- ✅ Is it worth the extra wait?

### **Score URLScan.io:**
**Speed:** ⭐⭐⭐ (5-10 seconds)  
**Accuracy:** ⭐⭐⭐⭐ (Good!)  
**Free Tier:** ⭐⭐⭐⭐⭐ (1000/day)  

---

## 📱 **STEP 3: Add VirusTotal**

### **Get API Key (3 minutes):**

1. Go to: **https://www.virustotal.com/gui/join-us**
2. Sign up
3. Verify email
4. Go to profile → API Key
5. **Copy key**

### **Add to App:**

1. Settings → "VirusTotal API Key"
2. Paste key
3. Auto-saves!

### **Test Again:**

1. **Go to Link Scanner**

2. **Test URL #1:**
   ```
   https://example.com
   ```
   - **Should now show:** "Scanned by: Offline Heuristics, PhishTank, URLScan.io, VirusTotal"

3. **Test URL #2 - Known Malware:**
   ```
   http://malware.wicar.org/data/eicar.com
   ```
   - **Expected:** ⚠️ THREAT (VirusTotal should catch this!)

### **What to Check:**
- ✅ Do you see "VirusTotal" in sources?
- ✅ How many engines flagged it?
- ✅ Is the detection better?

### **Score VirusTotal:**
**Speed:** ⭐⭐⭐⭐ (Fast)  
**Accuracy:** ⭐⭐⭐⭐⭐ (60+ engines!)  
**Free Tier:** ⭐⭐⭐⭐ (500/day)  

---

## 📱 **STEP 4: (Optional) Add Google Safe Browsing**

### **Get API Key (5 minutes):**

1. https://console.cloud.google.com
2. Create project
3. Enable Safe Browsing API
4. Create API key

### **Add to App:**

1. Settings → "Google Safe Browsing API Key"
2. Paste key

### **Test:**
- Same process as above
- Should see Google in sources

### **Score Google Safe Browsing:**
**Speed:** ⭐⭐⭐⭐ (Fast)  
**Accuracy:** ⭐⭐⭐⭐⭐ (Google's database!)  
**Free Tier:** ⭐⭐⭐⭐⭐ (10,000/day!)  

---

## 📊 **COMPARISON TABLE**

After testing, fill this out:

| API | Speed | Accuracy | Free Limit | Easy Setup | Your Rating |
|-----|-------|----------|------------|------------|-------------|
| **Offline Heuristics** | ⚡ Instant | ⭐⭐⭐ | ∞ | ✅ Auto | _/5 |
| **PhishTank** | ⚡ Instant | ⭐⭐⭐ | ∞ | ✅ Auto | _/5 |
| **URLScan.io** | 🐌 5-10s | ⭐⭐⭐⭐ | 1000/day | ✅ Easy | _/5 |
| **VirusTotal** | ⚡ 1-2s | ⭐⭐⭐⭐⭐ | 500/day | ✅ Easy | _/5 |
| **Google SB** | ⚡ 1-2s | ⭐⭐⭐⭐⭐ | 10000/day | ⚠️ Medium | _/5 |

---

## 🎯 **Test URLs to Try:**

### **Safe URLs:**
```
https://google.com
https://github.com
https://microsoft.com
https://example.com
```

### **Suspicious (Heuristic Detection):**
```
https://suspicious-site.tk/login
http://192.168.1.1/crack.exe
https://free-download.ga/keygen
```

### **Known Malware (For VirusTotal):**
```
http://malware.wicar.org/data/eicar.com
```

---

## ✅ **Testing Checklist:**

### **Test 1: Offline Only**
- [ ] Scan google.com
- [ ] Result: SAFE
- [ ] Speed: Instant
- [ ] Sources shown: 2 (Offline + PhishTank)

### **Test 2: + URLScan.io**
- [ ] Add URLScan.io API key
- [ ] Scan github.com
- [ ] Result: SAFE
- [ ] Speed: ~5 seconds
- [ ] Sources shown: 3

### **Test 3: + VirusTotal**
- [ ] Add VirusTotal API key
- [ ] Scan example.com
- [ ] Result: SAFE
- [ ] Speed: ~2 seconds
- [ ] Sources shown: 4
- [ ] Check detailed results section

### **Test 4: Malware Detection**
- [ ] Scan: http://malware.wicar.org/data/eicar.com
- [ ] Result: THREAT DETECTED
- [ ] Which APIs caught it?
- [ ] How many engines flagged it?

---

## 🏆 **My Recommendation After Testing:**

**Best Combination:**
1. ✅ **PhishTank** (free, automatic)
2. ✅ **VirusTotal** (60+ engines, fast)
3. ⚪ **URLScan.io** (optional, if you want deep analysis)

**Why:**
- PhishTank catches phishing instantly
- VirusTotal has 60+ engines for comprehensive checking
- URLScan is slower but very detailed

---

## 📝 **Your Results:**

After testing, answer:

**Which API was fastest?** ________________

**Which API was most accurate?** ________________

**Which API do you like best?** ________________

**Which APIs will you use?** 
- [ ] Offline Heuristics (always on)
- [ ] PhishTank (always on)
- [ ] URLScan.io
- [ ] VirusTotal
- [ ] Google Safe Browsing

---

## 🚀 **Quick Start Testing Now:**

1. **Reload app** (shake → Reload)
2. **Go to Link Scanner** (☰ menu)
3. **Scan:** `https://google.com`
4. **Check results** - see "Scanned by: ..."
5. **Try suspicious URL:** `https://test.tk/login`
6. **See the difference!**

Then add APIs one by one and test again! 🎯


