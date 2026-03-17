#  Study Sidebar Notes-Extension

A modern Chrome extension that lets you **take notes and draw while browsing any website**.
Perfect for students, developers, and researchers who want to capture ideas without leaving the page.

---

## Features

*  **Sidebar Notes**

  * Write important points while studying
  * Auto-save notes instantly

*  **Drawing Canvas**

  * Smooth freehand drawing
  * Adjustable pen size
  * Color picker
  * Eraser tool
  * Clear canvas

*  **Per-Website Storage**

  * Notes & drawings saved based on website domain
  * Different notes for different sites

*  **Persistent Storage**

  * Uses Chrome local storage
  * Data remains even after closing browser

*  **Download Notes**

  * Export notes as `.txt` file

* **Dark Mode UI**

  * Clean, modern, distraction-free design

*  **Toggle Sidebar**

  * Open/close sidebar with extension icon

---

##  Project Structure

```
study-sidebar-extension/
│
├── manifest.json
├── background.js
├── content.js
├── sidebar.html
├── sidebar.css
├── sidebar.js
└── icons/
    └── icon.png
```

---

##  Installation (Run Locally)

1. Download or clone this repository
2. Open Chrome and go to:

   ```
   chrome://extensions
   ```
3. Enable **Developer Mode** (top right)
4. Click **Load Unpacked**
5. Select the project folder

 Done! Click the extension icon to open the sidebar.

---

##  How It Works

* The extension injects a sidebar into any webpage using a content script
* Notes and drawings are saved using `chrome.storage.local`
* Each website has its own saved data using domain-based keys
* Canvas drawing is stored as an image (base64)

---

##  Use Cases

*  Study notes while reading articles
*  Take notes while watching tutorials
*  Capture ideas instantly
*  Developer scratchpad for coding references

---

##  Future Improvements

*  Cloud sync (Google account / Firebase)
* Voice-to-text notes
*  AI summarizer for webpages

---

## Contributing

Contributions are welcome!
Feel free to fork this repo and improve features or UI.

---


---

##  Support

If you like this project:

* Star ⭐ the repo
* Share with friends
* Give feedback!

---
Made with ❤️ by **Ankit Tripathi**
