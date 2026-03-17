// Sidebar logic for Study Sidebar Notes

class StudySidebar {
  constructor() {
    this.currentDomain = '';
    this.currentUrl = '';
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.currentTool = 'pen';
    this.ctx = null;
    this.canvas = null;
    this.theme = 'dark';
    
    this.initializeElements();
    this.attachEventListeners();
    this.loadTheme();
    this.initializeCanvas();
    this.setupMessageListener();
    this.loadSavedData();
  }
  
  initializeElements() {
    // Notes elements
    this.notesTextarea = document.getElementById('notesTextarea');
    this.domainIndicator = document.querySelector('.domain-text');
    this.themeToggle = document.getElementById('themeToggle');
    this.minimizeBtn = document.getElementById('minimizeBtn');
    this.closeBtn = document.getElementById('closeBtn');
    this.downloadNotesBtn = document.getElementById('downloadNotesBtn');
    this.downloadDrawingBtn = document.getElementById('downloadDrawingBtn');
    
    // Drawing elements
    this.canvas = document.getElementById('drawingCanvas');
    this.colorPicker = document.getElementById('colorPicker');
    this.brushSize = document.getElementById('brushSize');
    this.sizeValue = document.getElementById('sizeValue');
    this.penTool = document.getElementById('penTool');
    this.eraserTool = document.getElementById('eraserTool');
    this.clearCanvas = document.getElementById('clearCanvas');
    
    // Tab buttons
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.tabContents = document.querySelectorAll('.tab-content');
  }
  
  attachEventListeners() {
    // Notes auto-save
    this.notesTextarea.addEventListener('input', () => this.saveNotes());
    
    // Theme toggle
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
    
    // Sidebar controls
    this.minimizeBtn.addEventListener('click', () => this.minimizeSidebar());
    this.closeBtn.addEventListener('click', () => this.closeSidebar());
    
    // Download buttons
    this.downloadNotesBtn.addEventListener('click', () => this.downloadNotes());
    this.downloadDrawingBtn.addEventListener('click', () => this.downloadDrawing());
    
    // Tab switching
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });
    
    // Drawing controls
    this.colorPicker.addEventListener('change', () => this.updateBrush());
    this.brushSize.addEventListener('input', (e) => {
      this.sizeValue.textContent = e.target.value + 'px';
      this.updateBrush();
    });
    
    this.penTool.addEventListener('click', () => this.setTool('pen'));
    this.eraserTool.addEventListener('click', () => this.setTool('eraser'));
    this.clearCanvas.addEventListener('click', () => this.clearDrawing());
    
    // Canvas drawing events
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseout', () => this.stopDrawing());
    
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => this.startDrawing(e));
    this.canvas.addEventListener('touchmove', (e) => this.draw(e));
    this.canvas.addEventListener('touchend', () => this.stopDrawing());
  }
  
  initializeCanvas() {
    this.ctx = this.canvas.getContext('2d');
    this.ctx.strokeStyle = this.colorPicker.value;
    this.ctx.lineWidth = this.brushSize.value;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // Set canvas size with proper scaling
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }
  
  resizeCanvas() {
    const container = this.canvas.parentElement;
    const width = container.clientWidth - 20;
    const height = Math.min(400, window.innerHeight * 0.4);
    
    // Store current drawing
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    
    // Resize canvas
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Restore drawing
    this.ctx.putImageData(imageData, 0, 0);
    this.updateBrush();
  }
  
  updateBrush() {
    if (this.currentTool === 'eraser') {
      this.ctx.strokeStyle = '#ffffff';
    } else {
      this.ctx.strokeStyle = this.colorPicker.value;
    }
    this.ctx.lineWidth = this.brushSize.value;
  }
  
  setTool(tool) {
    this.currentTool = tool;
    
    // Update UI
    this.penTool.classList.toggle('active', tool === 'pen');
    this.eraserTool.classList.toggle('active', tool === 'eraser');
    
    // Update brush
    if (tool === 'eraser') {
      this.ctx.strokeStyle = '#ffffff';
    } else {
      this.ctx.strokeStyle = this.colorPicker.value;
    }
  }
  
  startDrawing(e) {
    e.preventDefault();
    this.isDrawing = true;
    
    const pos = this.getCanvasCoordinates(e);
    this.lastX = pos.x;
    this.lastY = pos.y;
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
  }
  
  draw(e) {
    e.preventDefault();
    if (!this.isDrawing) return;
    
    const pos = this.getCanvasCoordinates(e);
    const currentX = pos.x;
    const currentY = pos.y;
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(currentX, currentY);
    this.ctx.stroke();
    
    this.lastX = currentX;
    this.lastY = currentY;
  }
  
  stopDrawing() {
    this.isDrawing = false;
    this.ctx.closePath();
    this.saveDrawing();
  }
  
  getCanvasCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    let clientX, clientY;
    
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    return {
      x: Math.max(0, Math.min(this.canvas.width, x)),
      y: Math.max(0, Math.min(this.canvas.height, y))
    };
  }
  
  clearDrawing() {
    if (confirm('Are you sure you want to clear the drawing?')) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.saveDrawing();
    }
  }
  
  setupMessageListener() {
    window.addEventListener('message', (event) => {
      if (event.data.action === 'urlChanged') {
        this.currentUrl = event.data.url;
        this.currentDomain = event.data.domain;
        this.domainIndicator.textContent = this.currentDomain;
        this.loadSavedData();
      }
    });
    
    // Request current URL
    window.parent.postMessage({ action: 'getCurrentUrl' }, '*');
  }
  
  loadSavedData() {
    if (!this.currentDomain) return;
    
    chrome.storage.local.get([this.currentDomain], (result) => {
      const data = result[this.currentDomain] || {};
      
      // Load notes
      if (data.notes) {
        this.notesTextarea.value = data.notes;
      }
      
      // Load drawing
      if (data.drawing) {
        const img = new Image();
        img.onload = () => {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        };
        img.src = data.drawing;
      }
    });
  }
  
  saveNotes() {
    if (!this.currentDomain) return;
    
    const notes = this.notesTextarea.value;
    chrome.storage.local.get([this.currentDomain], (result) => {
      const data = result[this.currentDomain] || {};
      data.notes = notes;
      chrome.storage.local.set({ [this.currentDomain]: data });
    });
  }
  
  saveDrawing() {
    if (!this.currentDomain) return;
    
    const drawing = this.canvas.toDataURL('image/png');
    chrome.storage.local.get([this.currentDomain], (result) => {
      const data = result[this.currentDomain] || {};
      data.drawing = drawing;
      chrome.storage.local.set({ [this.currentDomain]: data });
    });
  }
  
  downloadNotes() {
    const notes = this.notesTextarea.value;
    const blob = new Blob([notes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${this.currentDomain || 'study'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  downloadDrawing() {
    const url = this.canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `drawing-${this.currentDomain || 'study'}.png`;
    a.click();
  }
  
  switchTab(tabId) {
    // Update tab buttons
    this.tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    // Update tab content
    this.tabContents.forEach(content => {
      content.classList.toggle('active', content.id === tabId + 'Tab');
    });
  }
  
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('theme', this.theme);
    
    // Update icon
    this.updateThemeIcon();
  }
  
  loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    this.theme = savedTheme;
    document.documentElement.setAttribute('data-theme', this.theme);
    this.updateThemeIcon();
  }
  
  updateThemeIcon() {
    const icon = this.themeToggle.querySelector('.theme-icon');
    if (this.theme === 'dark') {
      icon.innerHTML = '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>';
    } else {
      icon.innerHTML = '<path d="M20 12a8 8 0 11-16 0 8 8 0 0116 0z"/><path d="M12 5v14M5 12h14"/>';
    }
  }
  
  minimizeSidebar() {
    window.parent.postMessage({ action: 'minimizeSidebar' }, '*');
  }
  
  closeSidebar() {
    window.parent.postMessage({ action: 'closeSidebar' }, '*');
    chrome.runtime.sendMessage({ action: 'sidebarClosed' });
  }
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new StudySidebar();
});