import { useState, useEffect, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import {
  Files, Search, Settings, ChevronRight, FileCode, X,
  Menu, MoreHorizontal, Play, Laptop, Smartphone, Tablet,
  Terminal as TerminalIcon, Download, Trash2, Edit2, Plus,
  Monitor, RefreshCw, Command, CornerDownLeft, SearchCode,
  ArrowRight, FolderOpen, PanelBottomClose, PanelBottomOpen,
  Maximize2, FolderPlus, ToggleLeft, ToggleRight
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// --- CUSTOM ICONS (VS Code Style) ---
const HtmlIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.686 28.5L2.357 2.357h27.286L27.314 28.5 16 31.643 4.686 28.5z" fill="#E34F26" />
    <path d="M16 29.357l9.464-2.614 1.893-21.243H16v23.857z" fill="#EF652A" />
    <path d="M16 13.214H10.5l.357 3.964H16v3.75l-4.75-1.286-.321-3.536H7.107l.536 6.25L16 24.643v-3.75l.036-.01V13.213zM16 9.393H7.036L6.643 5.357H16v4.036z" fill="#fff" />
  </svg>
);

const CssIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.686 28.5L2.357 2.357h27.286L27.314 28.5 16 31.643 4.686 28.5z" fill="#1572B6" />
    <path d="M16 29.357l9.464-2.614 1.893-21.243H16v23.857z" fill="#33A9DC" />
    <path d="M16 13.929h4.964l-.536 5.821L16 20.893V24.6l4.75-1.321.25-2.607.571-6.75H16v-4.571h10.464l.143-1.607H16v6.179zM16 9.357h-5.964l-.321-3.643H16V9.356zM10.929 17.571L10.5 13.071H16v4.5H10.929z" fill="#fff" />
  </svg>
);

const JsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fill="#F7DF1E" d="M0 0h32v32H0V0z" />
    <path d="M22.034 24.368c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zM13.051 17.123h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" fill="#000" />
  </svg>
);

// --- TYPES ---
interface FileTab {
  id: string;
  name: string;
  language: 'html' | 'css' | 'javascript';
  content: string;
  modified: boolean;
  isOpen: boolean;
}

// --- UTILS ---
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const CTRL_KEY = isMac ? '⌘' : 'Ctrl';

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>iOS 17</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <div class="device">
        <div class="status-bar">
            <span class="time" id="status-time">9:41</span>
            <div class="dynamic-island"><i class="fa-solid fa-lock" id="lock-icon"></i></div>
            <div class="status-right">
                <i class="fa-solid fa-signal"></i>
                <i class="fa-solid fa-wifi"></i>
                <i class="fa-solid fa-battery-full"></i>
            </div>
        </div>

        <div id="lock-screen" class="screen active">
            <div class="lock-content">
                <h1 class="clock-large" id="lock-time">9:41</h1>
                <p class="date-large" id="lock-date">Tuesday, September 10</p>
                <p class="swipe-hint">Swipe up to unlock</p>
            </div>
            <div class="lock-actions">
                <div class="action-btn" onclick="toggleFlash()"><i class="fa-solid fa-bolt"></i></div>
                <div class="action-btn" onclick="openCamera()"><i class="fa-solid fa-camera"></i></div>
            </div>
            <div class="home-bar" id="swipe-bar"></div>
        </div>

        <div id="home-screen" class="screen">
            <div class="app-grid">
                <div class="app-item" onclick="openApp('messages')"><div class="app-icon" style="background:linear-gradient(180deg,#65D66A,#2DC84D)"><i class="fa-solid fa-message"></i></div><span>Messages</span></div>
                <div class="app-item" onclick="openApp('camera')"><div class="app-icon" style="background:linear-gradient(180deg,#6E6E73,#3A3A3C)"><i class="fa-solid fa-camera"></i></div><span>Camera</span></div>
                <div class="app-item" onclick="openApp('photos')"><div class="app-icon" style="background:linear-gradient(180deg,#fff,#f0f0f0);color:#333"><i class="fa-solid fa-image"></i></div><span>Photos</span></div>
                <div class="app-item" onclick="openApp('maps')"><div class="app-icon" style="background:linear-gradient(180deg,#63DA6A,#4CD964)"><i class="fa-solid fa-location-dot"></i></div><span>Maps</span></div>
                <div class="app-item" onclick="openApp('weather')"><div class="app-icon" style="background:linear-gradient(180deg,#5AC8FA,#007AFF)"><i class="fa-solid fa-cloud-sun"></i></div><span>Weather</span></div>
                <div class="app-item" onclick="openApp('clock')"><div class="app-icon" style="background:#000"><i class="fa-solid fa-clock"></i></div><span>Clock</span></div>
                <div class="app-item" onclick="openApp('calculator')"><div class="app-icon" style="background:#000"><i class="fa-solid fa-calculator"></i></div><span>Calculator</span></div>
                <div class="app-item" onclick="openApp('notes')"><div class="app-icon" style="background:linear-gradient(180deg,#FFCC00,#FF9500)"><i class="fa-solid fa-note-sticky"></i></div><span>Notes</span></div>
                <div class="app-item" onclick="openApp('reminders')"><div class="app-icon" style="background:#fff;color:#000"><i class="fa-solid fa-list-check"></i></div><span>Reminders</span></div>
                <div class="app-item" onclick="openApp('facetime')"><div class="app-icon" style="background:linear-gradient(180deg,#32D74B,#30D158)"><i class="fa-solid fa-video"></i></div><span>FaceTime</span></div>
                <div class="app-item" onclick="openApp('mail')"><div class="app-icon" style="background:linear-gradient(180deg,#5AC8FA,#007AFF)"><i class="fa-solid fa-envelope"></i></div><span>Mail</span></div>
                <div class="app-item" onclick="openApp('settings')"><div class="app-icon" style="background:linear-gradient(180deg,#8E8E93,#636366)"><i class="fa-solid fa-gear"></i></div><span>Settings</span></div>
            </div>
            <div class="dock-container">
               <div class="dock">
                  <div class="app-item" onclick="openApp('phone')"><div class="app-icon" style="background:linear-gradient(180deg,#65D66A,#2DC84D)"><i class="fa-solid fa-phone"></i></div></div>
                  <div class="app-item" onclick="openApp('safari')"><div class="app-icon" style="background:linear-gradient(180deg,#5AC8FA,#007AFF)"><i class="fa-solid fa-compass"></i></div></div>
                  <div class="app-item" onclick="openApp('messages')"><div class="app-icon" style="background:linear-gradient(180deg,#65D66A,#2DC84D)"><i class="fa-solid fa-message"></i></div></div>
                  <div class="app-item" onclick="openApp('music')"><div class="app-icon" style="background:linear-gradient(180deg,#FC3C44,#FB2C36)"><i class="fa-solid fa-music"></i></div></div>
               </div>
            </div>
            <div class="home-bar dark"></div>
        </div>

        <div id="app-view" class="screen">
           <div id="app-content-container"></div>
           <div class="home-bar dark"></div>
        </div>
        
        <div id="camera-view" class="screen">
           <video id="camera-feed" autoplay playsinline></video>
           <div class="camera-controls">
               <div class="cam-btn" onclick="goHome()"><i class="fa-solid fa-images"></i></div>
               <div class="shutter-btn" onclick="takePhoto()"></div>
               <div class="cam-btn" onclick="switchCamera()"><i class="fa-solid fa-rotate"></i></div>
           </div>
           <div class="home-bar"></div>
        </div>
    </div>
</body>
</html>`;

const DEFAULT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

* { box-sizing: border-box; user-select: none; -webkit-tap-highlight-color: transparent; }

html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    background: #000;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
    color: white;
    overflow: hidden;
}

.device {
    width: 100%;
    height: 100%;
    position: relative;
    background: url('https://cdn.beebom.com/content/2025/09/iPhone-17-Pro-Wallpapers-Orange-Dark.jpg') center/cover no-repeat;
    overflow: hidden;
}

.status-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 54px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 28px;
    z-index: 100;
    font-weight: 600;
    font-size: 16px;
}

.dynamic-island {
    width: 126px;
    height: 37px;
    background: #000;
    border-radius: 50px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    box-shadow: 0 0 0 4px rgba(0,0,0,0.3);
}

.status-right { display: flex; gap: 6px; font-size: 15px; }

/* Screens */
.screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    opacity: 0;
    pointer-events: none;
    transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.4s;
    transform: scale(0.96);
}

.screen.active {
    opacity: 1;
    pointer-events: auto;
    transform: scale(1);
}

/* Lock Screen */
#lock-screen {
    justify-content: flex-start;
    padding-top: 120px;
    align-items: center;
    background: rgba(0,0,0,0.1);
}

.lock-content {
    text-align: center;
}

.clock-large {
    font-size: 86px;
    font-weight: 700;
    margin: 0;
    line-height: 1;
    text-shadow: 0 4px 30px rgba(0,0,0,0.3);
    font-feature-settings: "tnum";
}

.date-large {
    font-size: 22px;
    font-weight: 500;
    margin-top: 6px;
    opacity: 0.9;
    text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.lock-actions {
    position: absolute;
    bottom: 40px;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 40px;
    pointer-events: auto;
}

.action-btn {
    width: 50px;
    height: 50px;
    background: rgba(40,40,40,0.7);
    backdrop-filter: blur(20px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    cursor: pointer;
    transition: transform 0.15s, background 0.2s;
}
.action-btn:active { transform: scale(0.92); background: rgba(255,255,255,0.25); }

/* Home Screen */
#home-screen {
    padding: 70px 20px 100px;
    justify-content: flex-start;
    background: rgba(0,0,0,0.25);
    backdrop-filter: blur(15px);
}

.widgets-area {
    margin-bottom: 20px;
}

.widget {
    background: rgba(255,255,255,0.92);
    border-radius: 22px;
    padding: 14px 16px;
    color: black;
    width: 160px;
    height: 160px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.cal-header { color: #ff3b30; font-weight: 600; text-transform: uppercase; font-size: 13px; }
.cal-number { font-size: 48px; font-weight: 300; margin: 4px 0; }
.cal-events { font-size: 13px; color: #666; font-weight: 500; margin-top: 8px; }

.app-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px 12px;
}

.app-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: transform 0.1s;
}

.app-item:active { transform: scale(0.9); }

.app-icon {
    width: 60px;
    height: 60px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    background: #333;
    color: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}

.app-item span { font-size: 11px; font-weight: 500; text-shadow: 0 1px 4px rgba(0,0,0,0.5); }

.green { background: linear-gradient(135deg, #34c759, #30d158); }
.maps-color { background: linear-gradient(135deg, #5ac8fa, #34aadc); }
.photos-color { background: linear-gradient(135deg, #fff, #f0f0f0); color: #333; }
.weather-color { background: linear-gradient(180deg, #47bfff, #007aff); }
.clock-color { background: #000; border: 1px solid #333; }
.mail-color { background: linear-gradient(135deg, #5ac8fa, #007aff); }
.music-color { background: linear-gradient(135deg, #fc5c7d, #fc3d39); }
.grey { background: linear-gradient(135deg, #8e8e93, #636366); }
.safari-color { background: linear-gradient(135deg, #5ac8fa, #007aff); }
.spotify-color { background: linear-gradient(135deg, #1ed760, #1db954); }

.dock-container {
    position: absolute;
    bottom: 30px;
    left: 0;
    width: 100%;
    padding: 0 12px;
}

.dock {
    width: 100%;
    height: 90px;
    background: rgba(255,255,255,0.18);
    backdrop-filter: blur(40px);
    border-radius: 32px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 14px;
}

.home-bar {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 134px;
    height: 5px;
    background: white;
    border-radius: 10px;
    z-index: 200;
}
.home-bar.dark { background: rgba(255,255,255,0.5); bottom: 10px; }

#gesture-area {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 34px;
    z-index: 999;
    cursor: pointer;
}

/* App View */
#app-view {
    background: #f2f2f7;
    color: black;
    z-index: 50;
}

#app-content-container { flex: 1; overflow-y: auto; background: #f2f2f7; }

/* App Styles */
.messages-app { padding: 20px; background: white; height: 100%; }
.msg-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; }
.msg-avatar { width: 60px; height: 60px; background: #007aff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; margin-bottom: 8px; font-size: 24px; font-weight: 600; }
.bubble { max-width: 75%; padding: 12px 16px; border-radius: 18px; margin-bottom: 8px; font-size: 16px; line-height: 1.35; }
.bubble.left { background: #e5e5ea; color: black; align-self: flex-start; border-bottom-left-radius: 4px; }
.bubble.right { background: #007aff; color: white; align-self: flex-end; border-bottom-right-radius: 4px; margin-left: auto; }

.phone-recents { background: white; height: 100%; }
.recent-row { display: flex; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid #f0f0f0; }
.r-name { font-weight: 600; font-size: 17px; }
.r-type { font-size: 14px; color: #8e8e93; margin-top: 2px; }
.r-time { color: #8e8e93; font-size: 15px; }
.name-highlight { color: #ff3b30; }

.weather-card {
    background: linear-gradient(180deg, #47bfff 0%, #007aff 100%);
    height: 100%; color: white; padding: 40px 20px;
    text-align: center;
}
.weather-temp { font-size: 96px; font-weight: 200; }
.weather-city { font-size: 34px; font-weight: 500; }

.settings-list { background: white; }
.settings-item { display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-bottom: 1px solid #f0f0f0; }
.settings-icon { width: 30px; height: 30px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 16px; color: white; }
.settings-label { font-size: 17px; }

.swipe-hint { font-size: 14px; opacity: 0.6; margin-top: 40px; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }

#camera-view { background: #000; }
#camera-feed { width: 100%; height: 100%; object-fit: cover; }
.camera-controls { position: absolute; bottom: 40px; left: 0; width: 100%; display: flex; justify-content: space-around; align-items: center; padding: 0 40px; }
.shutter-btn { width: 70px; height: 70px; background: white; border-radius: 50%; border: 4px solid rgba(255,255,255,0.3); cursor: pointer; }
.shutter-btn:active { transform: scale(0.9); }
.cam-btn { width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; color: white; cursor: pointer; }

.calc-display { background: #000; color: white; text-align: right; padding: 20px; font-size: 60px; font-weight: 300; }
.calc-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; padding: 12px; background: #000; }
.calc-btn { height: 70px; border-radius: 35px; display: flex; align-items: center; justify-content: center; font-size: 28px; cursor: pointer; }
.calc-btn.num { background: #333; color: white; }
.calc-btn.op { background: #ff9f0a; color: white; }
.calc-btn.fn { background: #a5a5a5; color: black; }
`;

const DEFAULT_JS = `// State
let currentScreen = 'lock-screen';
let cameraStream = null;
let facingMode = 'environment';
const screens = { lock: document.getElementById('lock-screen'), home: document.getElementById('home-screen'), app: document.getElementById('app-view'), camera: document.getElementById('camera-view') };

// Update time
function updateTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2,'0');
    const m = now.getMinutes().toString().padStart(2,'0');
    document.getElementById('lock-time').textContent = h + ':' + m;
    document.getElementById('status-time').textContent = h + ':' + m;
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    document.getElementById('lock-date').textContent = days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate();
}
updateTime(); setInterval(updateTime, 1000);

// Swipe gesture (touch)
let startY = 0;
document.addEventListener('touchstart', e => startY = e.touches[0].clientY, {passive:true});
document.addEventListener('touchend', e => {
    if(startY - e.changedTouches[0].clientY > 60) handleSwipeUp();
}, {passive:true});

// Mouse gesture for desktop
let mouseDown = false, mouseStartY = 0;
document.addEventListener('mousedown', e => { mouseDown = true; mouseStartY = e.clientY; });
document.addEventListener('mouseup', e => { if(mouseDown && mouseStartY - e.clientY > 60) handleSwipeUp(); mouseDown = false; });

function handleSwipeUp() {
    if(currentScreen === 'lock-screen') unlockPhone();
    else if(currentScreen !== 'home-screen') goHome();
}

document.querySelectorAll('.home-bar').forEach(bar => bar.addEventListener('click', handleSwipeUp));

function unlockPhone() {
    document.getElementById('lock-icon').style.display = 'none';
    screens.lock.classList.remove('active');
    setTimeout(() => screens.home.classList.add('active'), 50);
    currentScreen = 'home-screen';
}

window.goHome = function() {
    if(cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
    Object.values(screens).forEach(s => s?.classList.remove('active'));
    setTimeout(() => screens.home.classList.add('active'), 50);
    currentScreen = 'home-screen';
};

window.openApp = (name) => {
    if(name === 'camera') { openCamera(); return; }
    screens.home.classList.remove('active');
    setTimeout(() => { screens.app.classList.add('active'); renderApp(name); }, 50);
    currentScreen = 'app-screen';
};

window.openCamera = async function() {
    screens.lock.classList.remove('active');
    screens.home.classList.remove('active');
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
        document.getElementById('camera-feed').srcObject = cameraStream;
        screens.camera.classList.add('active');
        currentScreen = 'camera-screen';
    } catch(e) { alert('Camera access denied'); goHome(); }
};

window.switchCamera = async function() {
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    if(cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); }
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
    document.getElementById('camera-feed').srcObject = cameraStream;
};

window.takePhoto = function() {
    const video = document.getElementById('camera-feed');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;background:white;z-index:9999;animation:flash 0.3s forwards';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
};

window.toggleFlash = function() { alert('Flashlight toggled'); };

let calcDisplay = '0';
window.calcInput = function(val) {
    if(calcDisplay === '0' && val !== '.') calcDisplay = val;
    else calcDisplay += val;
    document.getElementById('calc-display').textContent = calcDisplay;
};
window.calcOp = function(op) { calcDisplay += ' ' + op + ' '; document.getElementById('calc-display').textContent = calcDisplay; };
window.calcClear = function() { calcDisplay = '0'; document.getElementById('calc-display').textContent = '0'; };
window.calcEquals = function() {
    try { calcDisplay = eval(calcDisplay.replace(/×/g,'*').replace(/÷/g,'/')).toString(); }
    catch(e) { calcDisplay = 'Error'; }
    document.getElementById('calc-display').textContent = calcDisplay;
};

function renderApp(name) {
    const c = document.getElementById('app-content-container');
    if(name === 'messages') { c.innerHTML = '<div class="messages-app" style="display:flex;flex-direction:column"><div class="msg-header"><div class="msg-avatar">O</div><div style="font-weight:600">Olivia</div><div style="font-size:12px;color:#888">iMessage</div></div><div class="bubble left">Hey! Are we still on for dinner?</div><div class="bubble right">Yes! 7 PM at the Italian place 🍝</div><div class="bubble left">Perfect! See you there! 😊</div></div>'; }
    else if(name === 'calculator') { c.innerHTML = '<div style="height:100%;display:flex;flex-direction:column;background:#000"><div id="calc-display" class="calc-display">0</div><div class="calc-grid"><div class="calc-btn fn" onclick="calcClear()">AC</div><div class="calc-btn fn">±</div><div class="calc-btn fn">%</div><div class="calc-btn op" onclick="calcOp(\\\'÷\\\')">÷</div><div class="calc-btn num" onclick="calcInput(\\\'7\\\')">7</div><div class="calc-btn num" onclick="calcInput(\\\'8\\\')">8</div><div class="calc-btn num" onclick="calcInput(\\\'9\\\')">9</div><div class="calc-btn op" onclick="calcOp(\\\'×\\\')">×</div><div class="calc-btn num" onclick="calcInput(\\\'4\\\')">4</div><div class="calc-btn num" onclick="calcInput(\\\'5\\\')">5</div><div class="calc-btn num" onclick="calcInput(\\\'6\\\')">6</div><div class="calc-btn op" onclick="calcOp(\\\'-\\\')">−</div><div class="calc-btn num" onclick="calcInput(\\\'1\\\')">1</div><div class="calc-btn num" onclick="calcInput(\\\'2\\\')">2</div><div class="calc-btn num" onclick="calcInput(\\\'3\\\')">3</div><div class="calc-btn op" onclick="calcOp(\\\'+\\\')">+</div><div class="calc-btn num" style="grid-column:span 2" onclick="calcInput(\\\'0\\\')">0</div><div class="calc-btn num" onclick="calcInput(\\\'.\\\')">.</div><div class="calc-btn op" onclick="calcEquals()">=</div></div></div>'; }
    else if(name === 'maps') { c.innerHTML = '<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=77.1,28.5,77.3,28.7&layer=mapnik" style="width:100%;height:100%;border:none"></iframe>'; }
    else if(name === 'weather') { c.innerHTML = '<div class="weather-card"><div class="weather-city">Delhi, India</div><div class="weather-temp">28°</div><div style="font-size:22px;opacity:0.9">Hazy</div><div style="margin-top:24px;font-size:17px">H: 32° L: 18°</div></div>'; }
    else if(name === 'clock') { const now = new Date(); c.innerHTML = '<div style="height:100%;background:#000;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="font-size:14px;color:#ff9500;font-weight:600;margin-bottom:10px">WORLD CLOCK</div><div style="font-size:72px;font-weight:200">' + now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0') + '</div><div style="font-size:16px;color:#8e8e93;margin-top:10px">Delhi, India</div></div>'; }
    else if(name === 'notes') { c.innerHTML = '<div style="background:#f2f2f7;height:100%;padding:20px"><div style="font-size:32px;font-weight:700;margin-bottom:20px">Notes</div><div style="background:white;border-radius:12px;padding:16px;min-height:200px" contenteditable="true" style="outline:none">Tap here to start typing...</div></div>'; }
    else if(name === 'reminders') { c.innerHTML = '<div style="background:#f2f2f7;height:100%;padding:20px"><div style="font-size:32px;font-weight:700;margin-bottom:20px">Reminders</div><div style="background:white;border-radius:12px"><div style="padding:14px 16px;border-bottom:1px solid #f0f0f0;display:flex;gap:12px;align-items:center"><div style="width:22px;height:22px;border:2px solid #007aff;border-radius:50%"></div>Buy groceries</div><div style="padding:14px 16px;border-bottom:1px solid #f0f0f0;display:flex;gap:12px;align-items:center"><div style="width:22px;height:22px;border:2px solid #007aff;border-radius:50%"></div>Call dentist</div><div style="padding:14px 16px;display:flex;gap:12px;align-items:center"><div style="width:22px;height:22px;background:#007aff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:14px">✓</div><span style="text-decoration:line-through;color:#8e8e93">Finish project</span></div></div></div>'; }
    else if(name === 'facetime') { c.innerHTML = '<div style="height:100%;background:#1c1c1e;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white"><i class="fa-solid fa-video" style="font-size:60px;color:#32D74B;margin-bottom:20px"></i><div style="font-size:24px;font-weight:600">FaceTime</div><div style="font-size:14px;color:#8e8e93;margin-top:8px">No recent calls</div></div>'; }
    else if(name === 'phone') { c.innerHTML = '<div class="phone-recents"><div style="padding:16px 20px;font-size:32px;font-weight:700">Recents</div><div class="recent-row"><div><div class="r-name name-highlight">Mom</div><div class="r-type">mobile • Missed</div></div><div class="r-time">Yesterday</div></div><div class="recent-row"><div><div class="r-name">Jason</div><div class="r-type">home</div></div><div class="r-time">11:15 AM</div></div></div>'; }
    else if(name === 'mail') { c.innerHTML = '<div style="background:#f2f2f7;height:100%"><div style="padding:16px 20px;font-size:32px;font-weight:700;background:white">Inbox</div><div style="background:white;margin-top:20px"><div style="padding:14px 20px;border-bottom:1px solid #f0f0f0"><div style="font-weight:600">Apple</div><div style="color:#8e8e93;font-size:14px">Your receipt from Apple...</div></div><div style="padding:14px 20px"><div style="font-weight:600">GitHub</div><div style="color:#8e8e93;font-size:14px">[GitHub] New security alert...</div></div></div></div>'; }
    else if(name === 'music') { c.innerHTML = '<div style="background:#000;height:100%;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px"><div style="width:200px;height:200px;background:linear-gradient(135deg,#fc5c7d,#6a82fb);border-radius:12px;margin-bottom:30px"></div><div style="text-align:center"><h2 style="margin:0;font-size:22px">Blinding Lights</h2><p style="color:#aaa;margin:6px 0 0 0;font-size:16px">The Weeknd</p></div><div style="display:flex;justify-content:center;gap:40px;width:100%;padding:40px 20px;align-items:center"><i class="fa-solid fa-backward-step" style="font-size:28px;opacity:0.7"></i><div style="width:60px;height:60px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center"><i class="fa-solid fa-play" style="font-size:24px;color:black;margin-left:4px"></i></div><i class="fa-solid fa-forward-step" style="font-size:28px;opacity:0.7"></i></div></div>'; }
    else if(name === 'settings') { c.innerHTML = '<div class="settings-list"><div style="padding:16px 20px;font-size:32px;font-weight:700">Settings</div><div class="settings-item"><div class="settings-icon" style="background:#007aff"><i class="fa-solid fa-wifi"></i></div><span class="settings-label">Wi-Fi</span></div><div class="settings-item"><div class="settings-icon" style="background:#007aff"><i class="fa-brands fa-bluetooth-b"></i></div><span class="settings-label">Bluetooth</span></div><div class="settings-item"><div class="settings-icon" style="background:#ff9500"><i class="fa-solid fa-bell"></i></div><span class="settings-label">Notifications</span></div><div class="settings-item"><div class="settings-icon" style="background:#34c759"><i class="fa-solid fa-battery-three-quarters"></i></div><span class="settings-label">Battery</span></div></div>'; }
    else if(name === 'safari') { c.innerHTML = '<div style="height:100%;background:white;display:flex;flex-direction:column"><div style="padding:12px;background:#f8f8f8;border-bottom:1px solid #e5e5e5"><div style="background:#e5e5e5;border-radius:10px;padding:10px 16px;font-size:16px;color:#8e8e93">Search or enter website</div></div><div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#8e8e93"><i class="fa-solid fa-compass" style="font-size:60px;margin-bottom:16px;color:#007aff"></i><div style="font-size:18px">Welcome to Safari</div></div></div>'; }
    else if(name === 'photos') { c.innerHTML = '<div style="padding:20px;background:#f2f2f7"><div style="font-size:32px;font-weight:700;margin-bottom:20px">Photos</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px"><div style="aspect-ratio:1;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:4px"></div><div style="aspect-ratio:1;background:linear-gradient(135deg,#f093fb,#f5576c);border-radius:4px"></div><div style="aspect-ratio:1;background:linear-gradient(135deg,#4facfe,#00f2fe);border-radius:4px"></div><div style="aspect-ratio:1;background:linear-gradient(135deg,#43e97b,#38f9d7);border-radius:4px"></div><div style="aspect-ratio:1;background:linear-gradient(135deg,#fa709a,#fee140);border-radius:4px"></div><div style="aspect-ratio:1;background:linear-gradient(135deg,#a18cd1,#fbc2eb);border-radius:4px"></div></div></div>'; }
    else { c.innerHTML = '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#8e8e93;font-size:20px;text-transform:capitalize">' + name + '</div>'; }
}
`;


export default function EditorPage() {
  const isMobile = useIsMobile();
  const monaco = useMonaco();

  // --- STATE ---
  const [activeActivity, setActiveActivity] = useState<'explorer' | 'search' | 'settings'>('explorer');

  // Initialize files from localStorage or default
  const [files, setFiles] = useState<FileTab[]>(() => {
    try {
      const saved = localStorage.getItem('mobilecode_files');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load files", e);
    }
    return [
      { id: '1', name: 'index.html', language: 'html', content: DEFAULT_HTML, modified: false, isOpen: true },
      { id: '2', name: 'styles.css', language: 'css', content: DEFAULT_CSS, modified: false, isOpen: true },
      { id: '3', name: 'script.js', language: 'javascript', content: DEFAULT_JS, modified: false, isOpen: true },
    ];
  });

  const [activeFileId, setActiveFileId] = useState('1');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewDevice, setPreviewDevice] = useState<'responsive' | 'mobile' | 'tablet'>('mobile');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newFileDialogOpen, setNewFileDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ fileId: string, line: number, text: string }[]>([]);
  const [isResizing, setIsResizing] = useState(false);

  // Settings State
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('mobilecode_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return {
      fontSize: 14,
      wordWrap: 'off',
      minimap: false,
      formatOnSave: false,
      theme: 'Dark Modern'
    };
  });

  // Persist Settings
  useEffect(() => {
    localStorage.setItem('mobilecode_settings', JSON.stringify(settings));
  }, [settings]);

  // Terminal State
  const [terminalHistory, setTerminalHistory] = useState(['MobileCode v2.5.0 initialized...', 'Ready to code.']);
  const [terminalInput, setTerminalInput] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ ln: 1, col: 1 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeFile = files.find(f => f.id === activeFileId);
  const editorRef = useRef<any>(null);

  // --- EFFECTS ---

  // Initialize Monaco Theme
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('vscode-dark-custom', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: { 'editor.background': '#1e1e1e' }
      });
      monaco.editor.setTheme('vscode-dark-custom');
    }
  }, [monaco]);

  // Persist files
  useEffect(() => {
    localStorage.setItem('mobilecode_files', JSON.stringify(files));
  }, [files]);

  // Handle Ctrl+S and Ctrl+`
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Toggle Terminal
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setTerminalOpen(prev => !prev);
      }
      // New File
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setNewFileDialogOpen(true);
      }
      // Open/Import File (Ctrl+O)
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        setUploadDialogOpen(true);
      }
      // Close Tab (Ctrl+W)
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        if (activeFileId) handleCloseTab(activeFileId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [files, activeFileId]);

  // Live Preview Logic
  useEffect(() => {
    if (files.length === 0) {
      setPreviewUrl('about:blank');
      return;
    }
    const html = files.find(f => f.language === 'html')?.content || '';
    const css = files.find(f => f.language === 'css')?.content || '';
    const js = files.find(f => f.language === 'javascript')?.content || '';

    const combinedSource = `
      <html><head><style>${css}</style></head>
      <body>${html}<script>try{${js}}catch(e){console.error(e)}<\/script></body>
      </html>`;

    const blob = new Blob([combinedSource], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [files]);

  // --- ACTIONS ---

  const handleFileChange = (value: string | undefined) => {
    if (value === undefined) return;
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: value, modified: true } : f));
  };

  const handleSave = () => {
    setFiles(prev => prev.map(f => ({ ...f, modified: false })));
    toast({ title: "Saved", description: "All changes persisted.", className: "bg-[#252526] text-white" });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }
    const results: typeof searchResults = [];
    files.forEach(f => {
      const lines = f.content.split('\n');
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
          results.push({ fileId: f.id, line: idx + 1, text: line.trim() });
        }
      });
    });
    setSearchResults(results);
  };

  const handleCloseTab = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const file = files.find(f => f.id === id);
    if (!file) return;

    // If closing active file, switch to another open one
    if (activeFileId === id) {
      const openFiles = files.filter(f => f.isOpen && f.id !== id);
      if (openFiles.length > 0) {
        setActiveFileId(openFiles[openFiles.length - 1].id);
      } else {
        setActiveFileId('');
      }
    }

    setFiles(prev => prev.map(f => f.id === id ? { ...f, isOpen: false } : f));
  };

  const handleDeleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (activeFileId === id) {
      const remaining = files.filter(f => f.id !== id && f.isOpen);
      if (remaining.length > 0) setActiveFileId(remaining[remaining.length - 1].id);
      else setActiveFileId('');
    }
  };

  const handleCreateFile = () => {
    let name = newFileName.trim();
    if (!name) return;

    // Strict validation - only allow .html, .css, .js
    const ext = name.split('.').pop()?.toLowerCase();
    if (!ext || !['html', 'css', 'js'].includes(ext)) {
      toast({ title: "Invalid File Type", description: "Only .html, .css, and .js files are allowed.", variant: "destructive", className: "bg-red-900 border-red-800 text-white" });
      return;
    }

    let lang: 'html' | 'css' | 'javascript' = 'javascript';
    if (ext === 'html') lang = 'html';
    if (ext === 'css') lang = 'css';

    const newFile: FileTab = {
      id: Date.now().toString(),
      name: name,
      language: lang,
      content: '',
      modified: false,
      isOpen: true
    };

    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setNewFileDialogOpen(false);
    setNewFileName('');
    toast({ title: "File Created", description: `${name} created successfully.`, className: "bg-[#252526] text-white" });
  };

  const handleOpenFile = (id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, isOpen: true } : f));
    setActiveFileId(id);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;
    Array.from(uploadedFiles).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const ext = file.name.split('.').pop()?.toLowerCase();
        let lang: 'html' | 'css' | 'javascript' | null = null;
        if (ext === 'html' || ext === 'htm') lang = 'html';
        else if (ext === 'css') lang = 'css';
        else if (ext === 'js') lang = 'javascript';
        if (lang) {
          const newFile = { id: Date.now().toString() + Math.random().toString(), name: file.name, language: lang, content, modified: true, isOpen: true };
          setFiles(prev => [...prev, newFile]);
          setActiveFileId(newFile.id);
        }
      };
      reader.readAsText(file);
    });
    setUploadDialogOpen(false);
  };

  // --- ICONS HELPER ---
  const getFileIcon = (lang: string, className?: string) => {
    if (lang === 'html') return <HtmlIcon className={className} />;
    if (lang === 'css') return <CssIcon className={className} />;
    return <JsIcon className={className} />;
  };

  return (
    <div className="h-screen w-screen bg-[#1e1e1e] flex flex-col text-[#cccccc] overflow-hidden font-sans">

      {/* 1. Menubar */}
      <div className="h-[35px] bg-[#323233] flex items-center px-2 select-none border-b border-[#2b2b2b] justify-between z-50">
        <div className="flex items-center">
          <Link href="/" className="mr-4 ml-2">
            <img src="/favicon.ico" className="w-5 h-5 grayscale opacity-80 hover:opacity-100 transition-opacity" alt="logo" onError={(e) => e.currentTarget.style.display = 'none'} />
          </Link>

          <Menubar className="border-none bg-transparent h-auto p-0 space-x-1">
            <MenubarMenu>
              <MenubarTrigger className="text-[13px] text-[#cccccc] hover:bg-[#3c3c3c] hover:text-white px-2 py-0.5 h-auto rounded-sm cursor-pointer">File</MenubarTrigger>
              <MenubarContent className="bg-[#252526] border-[#454545] text-[#cccccc]">
                <MenubarItem onClick={() => setUploadDialogOpen(true)}>Open File... <MenubarShortcut>{CTRL_KEY}O</MenubarShortcut></MenubarItem>
                <MenubarSeparator className="bg-[#454545]" />
                <MenubarItem onClick={handleSave}>Save <MenubarShortcut>{CTRL_KEY}S</MenubarShortcut></MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger className="text-[13px] text-[#cccccc] hover:bg-[#3c3c3c] hover:text-white px-2 py-0.5 h-auto rounded-sm cursor-pointer">View</MenubarTrigger>
              <MenubarContent className="bg-[#252526] border-[#454545] text-[#cccccc]">
                <MenubarItem onClick={() => setTerminalOpen(!terminalOpen)}>Toggle Terminal <MenubarShortcut>{CTRL_KEY}`</MenubarShortcut></MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </div>

      {/* 2. Main Workbench */}
      <div className="flex-1 flex overflow-hidden">

        {/* Activity Bar */}
        <div className="w-[48px] bg-[#333333] flex flex-col items-center py-2 gap-4 flex-shrink-0 z-20 hidden md:flex">
          <div onClick={() => setActiveActivity('explorer')} className={cn("p-3 cursor-pointer border-l-2 transition-all", activeActivity === 'explorer' ? "border-white text-white" : "border-transparent text-[#858585] hover:text-white")}>
            <Files className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div onClick={() => setActiveActivity('search')} className={cn("p-3 cursor-pointer border-l-2 transition-all", activeActivity === 'search' ? "border-white text-white" : "border-transparent text-[#858585] hover:text-white")}>
            <Search className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div className="flex-1" />
          <div onClick={() => setActiveActivity('settings')} className={cn("p-3 cursor-pointer border-l-2 transition-all", activeActivity === 'settings' ? "border-white text-white" : "border-transparent text-[#858585] hover:text-white")}>
            <Settings className="w-6 h-6" strokeWidth={1.5} />
          </div>
        </div>

        <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"}>

          {/* Sidebar (Explorer / Search) */}
          {!isMobile && (
            <>
              <ResizablePanel defaultSize={20} maxSize={30} minSize={10} className="bg-[#252526] border-r border-[#2b2b2b] flex flex-col">
                {activeActivity === 'explorer' && (
                  <>
                    <ContextMenu>
                      <ContextMenuTrigger className="w-full h-full flex flex-col">
                        <div className="px-5 h-[35px] flex items-center justify-between text-[11px] font-bold text-[#bbbbbb] tracking-wide uppercase group cursor-pointer hover:text-white">
                          <span>EXPLORER</span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                            <FolderPlus className="w-4 h-4 cursor-pointer hover:text-white" onClick={(e) => { e.stopPropagation(); toast({ title: "New Folder", description: "Folder creation is simulated in this web view.", className: "bg-[#252526] text-white my-2" }); }} />
                            <Plus className="w-4 h-4 cursor-pointer hover:text-white" onClick={(e) => { e.stopPropagation(); setNewFileDialogOpen(true); }} />
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto pt-2">
                          {/* ALL FILES */}
                          <div className="px-3 py-1 text-[11px] font-bold text-blue-400 flex items-center gap-1 hover:bg-[#2a2d2e] cursor-pointer">MOBILECODE-PRO</div>
                          {files.map(f => (
                            <ContextMenu key={f.id}>
                              <ContextMenuTrigger>
                                <div onClick={() => handleOpenFile(f.id)} className={cn("flex items-center px-4 py-1 cursor-pointer text-[13px] border-l-2 border-transparent gap-2 hover:bg-[#2a2d2e] group", activeFileId === f.id ? "bg-[#37373d] text-white border-blue-400" : "text-[#cccccc]")}>
                                  {getFileIcon(f.language, "w-4 h-4")}
                                  <span className="flex-1 truncate">{f.name}</span>
                                  {f.modified && <span className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                              </ContextMenuTrigger>
                              <ContextMenuContent className="bg-[#252526] border-[#454545] text-[#cccccc]">
                                <ContextMenuItem onClick={() => handleSave()}><Download className="w-4 h-4 mr-2" /> Save</ContextMenuItem>
                                <ContextMenuItem onClick={() => handleDeleteFile(f.id)} className="text-red-400"><Trash2 className="w-4 h-4 mr-2" /> Delete</ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenu>
                          ))}
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="bg-[#252526] border-[#454545] text-[#cccccc]">
                        <ContextMenuItem onClick={() => setNewFileDialogOpen(true)}>New File...</ContextMenuItem>
                        <ContextMenuItem onClick={() => setUploadDialogOpen(true)}>Import Files...</ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  </>
                )}
                {activeActivity === 'search' && (
                  <>
                    <div className="px-5 h-[35px] flex items-center text-[11px] font-bold text-[#bbbbbb] tracking-wide uppercase">SEARCH</div>
                    <div className="p-4">
                      <div className="relative">
                        <Input
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          placeholder="Search"
                          className="bg-[#3c3c3c] border-transparent text-white h-8 text-xs focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="mt-4 text-xs text-[#cccccc]">
                        {searchResults.length} results found
                      </div>
                      <div className="mt-2 space-y-1">
                        {searchResults.map((res, i) => {
                          const f = files.find(file => file.id === res.fileId);
                          return (
                            <div key={i} onClick={() => setActiveFileId(res.fileId)} className="cursor-pointer hover:bg-[#37373d] p-1 rounded">
                              <div className="font-bold flex items-center gap-1">{getFileIcon(f!.language, "w-3 h-3")} {f?.name}</div>
                              <div className="pl-4 text-[#858585] truncate">{res.text}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
                {activeActivity === 'settings' && (
                  <>
                    <div className="px-5 h-[35px] flex items-center text-[11px] font-bold text-[#bbbbbb] tracking-wide uppercase">SETTINGS</div>
                    <div className="p-4 space-y-4">
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-[#cccccc]">Font Size</div>
                        <Input
                          type="number"
                          value={settings.fontSize}
                          onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) || 14 })}
                          className="bg-[#3c3c3c] border-transparent text-white h-7 text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-[#cccccc]">Word Wrap</div>
                        <div className="flex items-center gap-2">
                          <Button variant={settings.wordWrap === 'on' ? "secondary" : "ghost"} size="sm" onClick={() => setSettings({ ...settings, wordWrap: 'on' })} className="h-6 text-xs bg-[#3c3c3c] hover:bg-[#4c4c4c] text-white">On</Button>
                          <Button variant={settings.wordWrap === 'off' ? "secondary" : "ghost"} size="sm" onClick={() => setSettings({ ...settings, wordWrap: 'off' })} className="h-6 text-xs hover:bg-[#3c3c3c] text-[#cccccc]">Off</Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-[#cccccc]">Minimap</div>
                          <div onClick={() => setSettings({ ...settings, minimap: !settings.minimap })} className={cn("w-8 h-4 rounded-full cursor-pointer relative transition-colors", settings.minimap ? "bg-[#007acc]" : "bg-[#3c3c3c]")}>
                            <div className={cn("w-2 h-2 rounded-full bg-white absolute top-1 transition-all", settings.minimap ? "left-5" : "left-1")} />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-[#cccccc]">Format On Save</div>
                          <div onClick={() => setSettings({ ...settings, formatOnSave: !settings.formatOnSave })} className={cn("w-8 h-4 rounded-full cursor-pointer relative transition-colors", settings.formatOnSave ? "bg-[#007acc]" : "bg-[#3c3c3c]")}>
                            <div className={cn("w-2 h-2 rounded-full bg-white absolute top-1 transition-all", settings.formatOnSave ? "left-5" : "left-1")} />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-[#cccccc]">Theme</div>
                        <div className="text-xs text-[#858585]">{settings.theme}</div>
                      </div>
                      <div className="border-t border-[#3c3c3c] pt-4">
                        <div className="text-xs text-[#858585]">MobileCode Pro v1.0.0</div>
                      </div>
                    </div>
                  </>
                )}
              </ResizablePanel>
              <ResizableHandle className="bg-[#2b2b2b] hover:bg-[#007acc] w-[1px]" />
            </>
          )}

          {/* Middle + Terminal */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <ResizablePanelGroup direction="vertical">

              {/* Editor or Welcome Screen */}
              <ResizablePanel defaultSize={terminalOpen ? 70 : 100} minSize={30}>
                <div className="h-full flex flex-col bg-[#1e1e1e]">
                  {activeFileId ? (
                    <>
                      <div className="flex bg-[#252526] border-b border-[#2b2b2b] overflow-x-auto no-scrollbar flex-shrink-0 w-full min-h-[35px] max-w-[100vw]">
                        {files.filter(f => f.isOpen).map(f => (
                          <div key={f.id} onClick={() => setActiveFileId(f.id)} className={cn("px-3 py-2 text-[13px] border-r border-[#2b2b2b] flex items-center gap-2 min-w-[120px] max-w-[200px] cursor-pointer select-none relative group h-full", activeFileId === f.id ? "bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc]" : "bg-[#2d2d2d] text-[#969696]")}>
                            {getFileIcon(f.language, "w-3.5 h-3.5")}
                            <span className="truncate flex-1">{f.name}</span>
                            <span className={cn("absolute right-2 top-2.5", f.modified ? "block" : "hidden group-hover:block")}>
                              {f.modified ? <div className="w-2 h-2 rounded-full bg-white" /> : <X className="w-4 h-4 p-0.5 rounded hover:bg-[#4a4a4a]" onClick={(e) => handleCloseTab(f.id, e)} />}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex-1 relative">
                        <Editor
                          height="100%"
                          theme="vscode-dark-custom"
                          path={activeFile?.name}
                          defaultLanguage={activeFile?.language}
                          value={activeFile?.content}
                          onChange={handleFileChange}
                          onMount={(editor) => {
                            editorRef.current = editor;
                            editor.onDidChangeCursorPosition((e) => {
                              setCursorPosition({ ln: e.position.lineNumber, col: e.position.column });
                            });
                          }}
                          options={{ fontSize: settings.fontSize, wordWrap: settings.wordWrap as any, minimap: { enabled: settings.minimap }, fontFamily: "JetBrains Mono, Menlo, monospace", formatOnType: true, autoClosingBrackets: 'always' }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#858585]">
                      <div className="mb-8">
                        <FileCode className="w-32 h-32 opacity-10 text-[#cccccc]" strokeWidth={0.5} />
                      </div>
                      <div className="text-2xl font-light text-[#cccccc] mb-6">MobileCode Pro</div>
                      <div className="space-y-2 w-64">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#3794ff] cursor-pointer hover:underline" onClick={() => setUploadDialogOpen(true)}>Open File...</span>
                          <span>{CTRL_KEY}O</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#3794ff] cursor-pointer hover:underline" onClick={() => setNewFileDialogOpen(true)}>New File...</span>
                          <span>{CTRL_KEY}N</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ResizablePanel>

              {/* Terminal Panel (Toggleable) */}
              {terminalOpen && (
                <>
                  <ResizableHandle className="bg-[#2b2b2b] hover:bg-[#007acc] h-[1px]" />
                  <ResizablePanel defaultSize={30} minSize={10} className="bg-[#1e1e1e]">
                    <div className="flex items-center px-4 h-8 bg-[#1e1e1e] border-b border-[#2b2b2b] gap-4 justify-between">
                      <div className="flex gap-4">
                        <span className="text-[11px] font-bold text-white border-b border-white py-1 uppercase cursor-pointer">Terminal</span>
                        <span className="text-[11px] font-bold text-[#858585] hover:text-[#cccccc] uppercase cursor-pointer">Output</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PanelBottomClose className="w-4 h-4 cursor-pointer hover:text-white" onClick={() => setTerminalOpen(false)} />
                        <X className="w-4 h-4 cursor-pointer hover:text-white" onClick={() => setTerminalOpen(false)} />
                      </div>
                    </div>
                    <div className="p-4 font-mono text-sm text-[#cccccc] h-[calc(100%-32px)] overflow-y-auto">
                      {terminalHistory.map((line, i) => <div key={i} className="mb-1">{line}</div>)}
                      <div className="flex items-center gap-2">
                        <span className="text-[#61c554]">➜</span>
                        <input type="text" value={terminalInput} onChange={(e) => setTerminalInput(e.target.value)} onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const cmd = terminalInput.trim();
                            setTerminalHistory(prev => [...prev, `➜  ~ ${cmd}`]);
                            if (cmd === 'clear') setTerminalHistory([]);
                            setTerminalInput('');
                          }
                        }} className="bg-transparent border-none outline-none flex-1 text-[#cccccc]" />
                      </div>
                    </div>
                  </ResizablePanel>
                </>
              )}

            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle className="bg-[#2b2b2b] hover:bg-[#007acc] w-[1px]" onDragging={setIsResizing} />
          <ResizablePanel defaultSize={30} minSize={20} className="bg-[#1e1e1e]">
            <div className={cn("w-full h-full flex flex-col bg-[#1e1e1e]", isResizing && "pointer-events-none select-none")}>
              <div className="h-[35px] bg-[#252526] border-b border-[#2b2b2b] flex items-center px-2 justify-between pointer-events-auto">
                <div className="flex gap-1 bg-[#1e1e1e] p-1 rounded-md">
                  <Button variant="ghost" size="icon" className={cn("h-6 w-6 rounded-sm", previewDevice === 'responsive' && "bg-[#37373d] text-white")} onClick={() => setPreviewDevice('responsive')}><Monitor className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className={cn("h-6 w-6 rounded-sm", previewDevice === 'mobile' && "bg-[#37373d] text-white")} onClick={() => setPreviewDevice('mobile')}><Smartphone className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className={cn("h-6 w-6 rounded-sm", previewDevice === 'tablet' && "bg-[#37373d] text-white")} onClick={() => setPreviewDevice('tablet')}><Tablet className="w-3.5 h-3.5" /></Button>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { const iframe = document.getElementById('preview-frame') as HTMLIFrameElement; if (iframe) iframe.src = iframe.src; }}><RefreshCw className="w-3.5 h-3.5" /></Button>
              </div>

              <div className={cn("w-full h-[calc(100%-35px)] bg-[#1e1e1e] flex items-center justify-center overflow-auto relative", previewDevice === 'responsive' ? "p-0" : "p-4")}>
                {files.length > 0 ? (
                  <div className={cn("transition-all duration-300 bg-white shadow-2xl overflow-hidden relative", previewDevice === 'responsive' && "w-full h-full rounded-none", previewDevice === 'mobile' && "w-[375px] h-[667px] rounded-[3rem] border-8 border-[#111]", previewDevice === 'tablet' && "w-[768px] h-[1024px] rounded-2xl border-8 border-[#111]")}>
                    <iframe id="preview-frame" src={previewUrl} className="w-full h-full border-none bg-white" title="Live Preview" />
                    {isResizing && <div className="absolute inset-0 z-50 bg-transparent" />}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#333] gap-4">
                    <Smartphone className="w-16 h-16 opacity-20" />
                    <div className="text-sm font-medium opacity-40">No Active Preview</div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>

      {/* 3. Status Bar */}
      <div className="h-[22px] bg-[#007acc] text-white flex items-center justify-between px-3 text-[11px] select-none z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 hover:bg-[#1f8ad2] px-1 rounded cursor-pointer">
            <div className="w-3 h-3 rounded-full border border-white flex items-center justify-center text-[8px] font-bold pb-0.5">/</div>
            <span>main*</span>
          </div>
          <div className="flex items-center gap-1 hover:bg-[#1f8ad2] px-1 rounded cursor-pointer">
            <RefreshCw className="w-3 h-3" />
            <span>0</span>
            <span className="opacity-50">|</span>
            <span>0</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hover:bg-[#1f8ad2] px-1 rounded cursor-pointer">Ln {cursorPosition.ln}, Col {cursorPosition.col}</div>
          <div className="hover:bg-[#1f8ad2] px-1 rounded cursor-pointer hidden md:block">Spaces: 2</div>
          <div className="hover:bg-[#1f8ad2] px-1 rounded cursor-pointer hidden md:block">UTF-8</div>
          <div className="hover:bg-[#1f8ad2] px-1 rounded cursor-pointer font-medium">{activeFile ? activeFile.language.toUpperCase() : 'TXT'}</div>
          <div className="hover:bg-[#1f8ad2] px-1 rounded cursor-pointer bg-[#1f8ad2]"><i className="fa-solid fa-bell"></i></div>
        </div>
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="bg-[#252526] border-[#454545] text-white">
          <DialogHeader><DialogTitle>Import Files</DialogTitle></DialogHeader>
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-[#454545] rounded-lg cursor-pointer hover:bg-[#2a2d2e]" onClick={() => fileInputRef.current?.click()}>
            <input ref={fileInputRef} type="file" className="hidden" multiple accept=".html,.css,.js" onChange={handleFileUpload} />
            <div className="text-center">
              <Files className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <span className="text-sm text-gray-400">Click to Import Files</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={newFileDialogOpen} onOpenChange={setNewFileDialogOpen}>
        <DialogContent className="bg-[#252526] border-[#454545] text-white">
          <DialogHeader><DialogTitle>New File</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs text-[#858585]">Filename</div>
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="e.g., script.js"
                className="bg-[#3c3c3c] border-transparent text-white focus:ring-1 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
              />
              <div className="text-[10px] text-[#858585]">Supported types: .js, .html, .css (defaults to .js)</div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setNewFileDialogOpen(false)} className="text-[#cccccc] hover:text-white">Cancel</Button>
              <Button onClick={handleCreateFile} className="bg-[#007acc] hover:bg-[#0062a3] text-white">Create File</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}
