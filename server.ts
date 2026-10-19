import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory simulation state for MikroTik Hotspot session
let sessionState = {
  isLoggedIn: false,
  username: 'USER-1234',
  speed: '256k/700k',
  updateOption: '_Uon',
  bytesIn: 14680064,
  bytesOut: 58720256,
  remainBytes: 536870912,
  startTime: Date.now(),
  ip: '192.168.88.25',
  mac: '64:6E:97:A1:B2:C3',
};

// Periodic simulated traffic increments if logged in
setInterval(() => {
  if (sessionState.isLoggedIn) {
    sessionState.bytesIn += Math.floor(Math.random() * 45000) + 5000;
    sessionState.bytesOut += Math.floor(Math.random() * 95000) + 15000;
    if (sessionState.remainBytes > 0) {
      sessionState.remainBytes = Math.max(0, sessionState.remainBytes - 120000);
    }
  }
}, 2000);

// Helper to format uptime into Arabic-friendly / Hotspot-friendly string
function getUptimeString(startTime: number): string {
  const diffSecs = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(diffSecs / 3600);
  const minutes = Math.floor((diffSecs % 3600) / 60);
  const seconds = diffSecs % 60;
  if (hours > 0) return `${hours}h${minutes}m${seconds}s`;
  if (minutes > 0) return `${minutes}m${seconds}s`;
  return `${seconds}s`;
}



// Helper function to dynamically inject a Developer Preview Path Navigator into HTML responses
// This keeps all MikroTik template files 100% clean and untouched on disk!
function injectDevNavigator(html: string): string {
  const navigatorSnippet = `
<!-- DEV PREVIEW URL & PATH NAVIGATOR (Injected in server.ts only - Not stored in template files) -->
<div id="ais-dev-navigator" style="all: initial; position: relative; z-index: 2147483647; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Cairo', Tahoma, sans-serif; direction: rtl; text-align: right;">
  <style>
    #ais-dev-navigator * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: inherit;
    }
    .ais-nav-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(11, 17, 33, 0.95);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(59, 130, 246, 0.35);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
      padding: 6px 12px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      color: #f1f5f9;
      font-size: 13px;
      z-index: 2147483647;
      transition: transform 0.25s ease, opacity 0.25s ease;
    }
    .ais-nav-bar.ais-collapsed {
      transform: translateY(-100%);
      opacity: 0;
      pointer-events: none;
    }
    .ais-nav-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .ais-nav-btn {
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 5px 9px;
      font-size: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      text-decoration: none;
      transition: all 0.15s ease;
      white-space: nowrap;
      user-select: none;
    }
    .ais-nav-btn:hover {
      background: rgba(59, 130, 246, 0.25);
      border-color: rgba(59, 130, 246, 0.5);
      color: #ffffff;
    }
    .ais-nav-btn-primary {
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color: #ffffff;
      border: none;
      font-weight: 600;
      padding: 5px 14px;
    }
    .ais-nav-btn-primary:hover {
      background: linear-gradient(135deg, #1d4ed8, #2563eb);
      box-shadow: 0 0 10px rgba(37, 99, 235, 0.5);
    }
    .ais-nav-input-wrapper {
      flex: 1;
      min-width: 220px;
      display: flex;
      align-items: center;
      background: rgba(4, 7, 16, 0.9);
      border: 1px solid rgba(59, 130, 246, 0.4);
      border-radius: 6px;
      padding: 2px 8px;
    }
    .ais-nav-input-wrapper:focus-within {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
    .ais-nav-prefix {
      color: #64748b;
      font-size: 11px;
      padding-left: 6px;
      direction: ltr;
      user-select: none;
    }
    .ais-nav-input {
      flex: 1;
      background: transparent;
      border: none;
      color: #38bdf8;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 13px;
      padding: 4px 6px;
      outline: none;
      direction: ltr;
      text-align: left;
    }
    .ais-nav-quick {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-wrap: wrap;
    }
    .ais-nav-badge {
      background: rgba(255, 255, 255, 0.06);
      color: #94a3b8;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 3px 10px;
      font-size: 11px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .ais-nav-badge:hover, .ais-nav-badge.active {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      border-color: rgba(59, 130, 246, 0.4);
    }
    .ais-nav-badge.active {
      font-weight: 700;
      border-color: #3b82f6;
    }
    .ais-nav-toggle-btn {
      position: fixed;
      top: 8px;
      left: 12px;
      z-index: 2147483647;
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(8px);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.4);
      border-radius: 20px;
      padding: 5px 12px;
      font-size: 12px;
      cursor: pointer;
      display: none;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      transition: all 0.2s ease;
      direction: rtl;
    }
    .ais-nav-toggle-btn:hover {
      background: #0284c7;
      color: #ffffff;
      transform: scale(1.04);
    }
    .ais-nav-toggle-btn.ais-show {
      display: inline-flex;
    }
    /* Add top spacing to body so the bar doesn't overlay top content */
    body {
      padding-top: 48px !important;
    }
    body.ais-body-unpadded {
      padding-top: 0 !important;
    }
  </style>

  <!-- Minimized Floating Button -->
  <button id="ais-nav-reopen-btn" class="ais-nav-toggle-btn" title="فتح شريط المسارات والتنقل" onclick="toggleAisDevBar(true)">
    <span>🧭</span>
    <span>شريط المسارات</span>
  </button>

  <!-- Full Navigation Bar -->
  <div id="ais-nav-main-bar" class="ais-nav-bar">
    <!-- Back/Forward/Reload Controls -->
    <div class="ais-nav-controls">
      <button class="ais-nav-btn" title="رجوع للخلف" onclick="window.history.back()">⬅️</button>
      <button class="ais-nav-btn" title="للأمام" onclick="window.history.forward()">➡️</button>
      <button class="ais-nav-btn" title="إعادة تحميل الصفحة" onclick="window.location.reload()">🔄</button>
    </div>

    <!-- URL Input and Go Button -->
    <div class="ais-nav-input-wrapper">
      <span class="ais-nav-prefix">مسار:</span>
      <input id="ais-nav-url-input" class="ais-nav-input" type="text" placeholder="/dash.html أو /mobasher.html..." onkeydown="if(event.key==='Enter')aisNavigateToInput();" />
    </div>
    <button class="ais-nav-btn ais-nav-btn-primary" onclick="aisNavigateToInput()">انتقال ↵</button>

    <!-- Quick Page Jump Badges -->
    <div class="ais-nav-quick">
      <span style="font-size: 11px; color: #64748b;">صفحات سريعة:</span>
      <a class="ais-nav-badge" href="/" title="الرئيسية / صفحة الدخول">🏠 الرئيسية</a>
      <a class="ais-nav-badge" href="/dash.html" title="لوحة التحكم والإعدادات">⚙️ لوحة التحكم</a>
      <a class="ais-nav-badge" href="/mobasher.html" title="بث مباشر">📺 بث مباشر</a>
      <a class="ais-nav-badge" href="/status.html" title="حالة الهوتسبوت">📊 الحالة</a>
      <a class="ais-nav-badge" href="/logout.html" title="تسجيل الخروج">🚪 خروج</a>
    </div>

    <!-- Utility buttons: Open in New Tab + Minimize -->
    <div style="margin-right: auto; display: flex; align-items: center; gap: 6px;">
      <button class="ais-nav-btn" title="فتح في تبويب مستقل للمتصفح" onclick="window.open(window.location.href, '_blank')">
        <span>↗️</span>
        <span style="font-size: 11px;">تبويب خارجي</span>
      </button>
      <button class="ais-nav-btn" title="تصغير شريط المسارات" onclick="toggleAisDevBar(false)" style="padding: 5px 8px; color: #94a3b8;">
        <span>▲</span>
        <span style="font-size: 11px;">إخفاء</span>
      </button>
    </div>
  </div>

  <script>
    (function() {
      var currentPath = window.location.pathname + window.location.search;
      var input = document.getElementById('ais-nav-url-input');
      if (input) {
        input.value = currentPath || '/';
      }

      // Highlight active badge
      var badges = document.querySelectorAll('.ais-nav-badge');
      badges.forEach(function(b) {
        var href = b.getAttribute('href');
        if (href === currentPath || (href === '/' && (currentPath === '/' || currentPath === '/index.html'))) {
          b.classList.add('active');
        }
      });

      // Restore collapsed state if saved
      var isCollapsed = localStorage.getItem('ais_dev_bar_collapsed') === '1';
      if (isCollapsed) {
        setBarState(true);
      }

      window.aisNavigateToInput = function() {
        var val = (document.getElementById('ais-nav-url-input').value || '').trim();
        if (!val) return;
        if (!val.startsWith('/') && !val.startsWith('http')) {
          val = '/' + val;
        }
        window.location.href = val;
      };

      window.toggleAisDevBar = function(show) {
        setBarState(!show);
        localStorage.setItem('ais_dev_bar_collapsed', show ? '0' : '1');
      };

      function setBarState(collapsed) {
        var bar = document.getElementById('ais-nav-main-bar');
        var reopenBtn = document.getElementById('ais-nav-reopen-btn');
        if (collapsed) {
          bar.classList.add('ais-collapsed');
          reopenBtn.classList.add('ais-show');
          document.body.classList.add('ais-body-unpadded');
        } else {
          bar.classList.remove('ais-collapsed');
          reopenBtn.classList.remove('ais-show');
          document.body.classList.remove('ais-body-unpadded');
        }
      }
    })();
  </script>
</div>
`;

  if (html.includes('</body>')) {
    return html.replace('</body>', `${navigatorSnippet}\n</body>`);
  }
  return html + navigatorSnippet;
}

// Helper to serve an HTML file with the dev bar injected
function serveInjectedHtml(res: express.Response, filename: string) {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Not Found');
  }
  const content = fs.readFileSync(filePath, 'utf8');
  res.type('html').send(injectDevNavigator(content));
}

// MikroTik Hotspot /login endpoint
app.get('/login', (req, res) => {
  const isCallBack = req.query.var === 'callBack';
  const username = req.query.username as string;
  const domain = (req.query.domain as string) || '256k/700k';

  if (isCallBack) {
    if (username) {
      // User is logging in
      sessionState.isLoggedIn = true;
      sessionState.username = username;
      sessionState.speed = domain.split('_')[0] || '256k/700k';
      sessionState.updateOption = domain.includes('_Uoff') ? '_Uoff' : '_Uon';
      sessionState.startTime = Date.now();

      return res.json({
        logged_in: 'yes',
        username: sessionState.username,
        mac: sessionState.mac,
        link_login_only: '/login',
        sspeed: `${sessionState.speed}_`,
        update: sessionState.updateOption,
        ip: sessionState.ip,
        bytes_in: String(sessionState.bytesIn),
        bytes_out: String(sessionState.bytesOut),
        remain_bytes_total: String(sessionState.remainBytes),
        session_time_left: '4h30m',
        uptime: getUptimeString(sessionState.startTime),
        session_time_left_secs: '16200',
        uptime_secs: '300',
        trial: 'no',
        login_by: 'username',
        action: 'onLoggedIn',
      });
    }

    // Initial check (before login submitted)
    return res.json({
      logged_in: sessionState.isLoggedIn ? 'yes' : 'no',
      link_login_only: '/login',
      link_logout: '/logout',
      link_status: '/status',
      nas_id: 'TunisNet-MikroTik',
      ip: sessionState.ip,
      mac: sessionState.mac,
      trial: 'no',
      username: sessionState.isLoggedIn ? sessionState.username : '',
      action: 'onLoginStart',
    });
  }

  // Regular direct request
  serveInjectedHtml(res, 'index.html');
});

// MikroTik Hotspot /status endpoint
app.get('/status', (req, res) => {
  const isCallBack = req.query.var === 'callBack';

  if (isCallBack) {
    const rawToken = `m056fd9fdfdsffsdffdfd1697455${sessionState.username}dsfd6571fgfgfgfgdf53sdfdsfgsd14`;

    return res.json({
      logged_in: sessionState.isLoggedIn ? 'yes' : 'no',
      mac: sessionState.mac,
      sspeed: `${sessionState.speed}_`,
      update: sessionState.updateOption,
      ip: sessionState.ip,
      bytes_in: String(sessionState.bytesIn),
      bytes_out: String(sessionState.bytesOut),
      remain_bytes_total: String(sessionState.remainBytes),
      session_time_left: '4h15m',
      uptime: getUptimeString(sessionState.startTime),
      bytesm: rawToken,
      trial: 'no',
      username: sessionState.username,
      action: 'onStatusQuery',
    });
  }

  // Direct page request
  serveInjectedHtml(res, 'index.html');
});

// MikroTik Hotspot /logout endpoint
app.get('/logout', (req, res) => {
  sessionState.isLoggedIn = false;
  const isCallBack = req.query.var === 'callBack';

  if (isCallBack) {
    return res.json({
      logged_in: 'no',
      action: 'onLoggedOut',
    });
  }

  res.redirect('/');
});

// Serve static assets from project root and specific subfolders
// Public API endpoints for Notifications / Announcements system
app.get('/api/v1/public/content', (req, res) => {
  res.json({
    success: true,
    data: {
      notifications: [],
      announcements: []
    }
  });
});

// Dynamic ad images discovery endpoint
app.get('/api/v1/ad-images', (req, res) => {
  try {
    const adimgPath = path.join(__dirname, 'adimg');
    if (fs.existsSync(adimgPath)) {
      const files = fs.readdirSync(adimgPath)
        .filter(file => /\.(jpe?g|png|webp|gif|svg)$/i.test(file))
        .sort((a, b) => {
          const numA = parseInt(a, 10);
          const numB = parseInt(b, 10);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return a.localeCompare(b, undefined, { numeric: true });
        });
      return res.json({ success: true, images: files });
    }
    return res.json({ success: true, images: [] });
  } catch (err) {
    return res.json({ success: false, images: [] });
  }
});

// Save config endpoint for dash.html dashboard
app.post('/api/v1/save-config', (req, res) => {
  try {
    const { content } = req.body;
    if (typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ success: false, message: 'محتوى الكود غير صالح' });
    }
    const configPath = path.join(__dirname, 'config', 'config.js');
    fs.writeFileSync(configPath, content, 'utf8');
    return res.json({ success: true, message: 'تم حفظ ملف config.js بنجاح' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'فشل حفظ الملف' });
  }
});

// Read raw config.js endpoint for dash.html dashboard
app.get('/api/v1/load-config', (req, res) => {
  try {
    const configPath = path.join(__dirname, 'config', 'config.js');
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      return res.json({ success: true, content });
    }
    return res.status(404).json({ success: false, message: 'الملف غير موجود' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'فشل قراءة الملف' });
  }
});

// HTML Page Routes with dynamic Developer Preview Bar injection
// (Keeps physical files 100% clean for MikroTik deployment)
app.get(['/', '/index.html'], (req, res) => {
  serveInjectedHtml(res, 'index.html');
});

app.get(['/dash', '/dash.html'], (req, res) => {
  serveInjectedHtml(res, 'dash.html');
});

app.get(['/mobasher', '/mobasher.html'], (req, res) => {
  serveInjectedHtml(res, 'mobasher.html');
});

app.get(['/alogin', '/alogin.html'], (req, res) => {
  serveInjectedHtml(res, 'alogin.html');
});

app.get(['/status.html'], (req, res) => {
  serveInjectedHtml(res, 'status.html');
});

app.get(['/login.html'], (req, res) => {
  serveInjectedHtml(res, 'login.html');
});

app.get(['/logout.html'], (req, res) => {
  serveInjectedHtml(res, 'logout.html');
});

app.get(['/redirect', '/redirect.html'], (req, res) => {
  serveInjectedHtml(res, 'redirect.html');
});

app.use('/fonts', express.static(path.join(__dirname, 'fonts')));
app.use('/adimg', express.static(path.join(__dirname, 'adimg')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/config', express.static(path.join(__dirname, 'config')));
app.use('/2024', express.static(path.join(__dirname, '2024')));
app.use(express.static(__dirname));

// Fallback route: smart handler for any requested html or default to index.html
app.get('*', (req, res) => {
  const reqPath = req.path.replace(/^\//, '');
  if (reqPath) {
    const candidate = reqPath.endsWith('.html') ? reqPath : `${reqPath}.html`;
    const targetFile = path.join(__dirname, candidate);
    if (fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) {
      return serveInjectedHtml(res, candidate);
    }
  }
  serveInjectedHtml(res, 'index.html');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Hotspot Server] Running on http://0.0.0.0:${PORT}`);
});
