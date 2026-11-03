'use strict';

const {
  app,
  BrowserWindow,
  Menu,
  dialog,
  protocol,
  screen,
  session,
  shell
} = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const APP_NAME = '序集';
// 兼容旧版：数据目录继续使用「图记」，升级后仍能读到原有 IndexedDB / 图片。
const LEGACY_DATA_NAME = '图记';
const SCHEME = 'app';
const HOST = 'tuji';
const RENDERER_DIR = path.resolve(__dirname, '..', 'renderer');
const DEV = process.argv.includes('--dev');

// Keep the Chromium profile and IndexedDB in a stable, user-writable place.
// 序集沿用 ~/Library/Application Support/图记，改名不迁移、不丢数据。
app.setName(APP_NAME);
try {
  app.setPath('userData', path.join(app.getPath('appData'), LEGACY_DATA_NAME));
} catch (err) {
  // If appData is not available yet, Electron will use the default path.
  console.error('Failed to set userData path:', err);
}

const WINDOW_STATE_FILE = path.join(app.getPath('userData'), 'window-state.json');
const DEFAULT_WINDOW = { width: 1280, height: 840 };
const MIN_WINDOW = { width: 960, height: 640 };

// A standard, secure custom scheme gives the page a stable origin, which is
// important for IndexedDB and localStorage across app updates and moves.
protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
]);

let mainWindow = null;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

function registerAppProtocol() {
  protocol.handle(SCHEME, async (request) => {
    let requestUrl;
    try {
      requestUrl = new URL(request.url);
    } catch (err) {
      return new Response('Bad request', { status: 400 });
    }

    if (requestUrl.host !== HOST) {
      return new Response('Not found', { status: 404 });
    }

    let pathname = decodeURIComponent(requestUrl.pathname || '/');
    if (pathname === '/' || pathname === '') pathname = '/index.html';

    const relative = pathname.replace(/^\/+/, '');
    const filePath = path.resolve(RENDERER_DIR, relative);
    const root = RENDERER_DIR + path.sep;

    if (filePath !== RENDERER_DIR && !filePath.startsWith(root)) {
      return new Response('Forbidden', { status: 403 });
    }

    let stat;
    try {
      stat = await fs.promises.stat(filePath);
    } catch (err) {
      return new Response('Not found', { status: 404 });
    }

    if (!stat.isFile()) {
      return new Response('Not found', { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      // Read through fs (instead of net.fetch) so the same code works both
      // in development and inside an asar archive in the packaged app.
      const data = await fs.promises.readFile(filePath);
      return new Response(data, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        }
      });
    } catch (err) {
      console.error('Failed to serve', filePath, err);
      return new Response('Not found', { status: 404 });
    }
  });
}

function loadWindowState() {
  try {
    const data = JSON.parse(fs.readFileSync(WINDOW_STATE_FILE, 'utf8'));
    const width = Math.round(Number(data.width));
    const height = Math.round(Number(data.height));
    if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
    const work = screen.getPrimaryDisplay().workAreaSize;
    return {
      width: Math.min(Math.max(width, MIN_WINDOW.width), Math.max(MIN_WINDOW.width, work.width)),
      height: Math.min(Math.max(height, MIN_WINDOW.height), Math.max(MIN_WINDOW.height, work.height)),
      maximized: !!data.maximized
    };
  } catch (err) {
    return null;
  }
}

function saveWindowState(win) {
  try {
    if (!win || win.isDestroyed()) return;
    const bounds = win.getNormalBounds ? win.getNormalBounds() : win.getBounds();
    fs.writeFileSync(WINDOW_STATE_FILE, JSON.stringify({
      width: bounds.width,
      height: bounds.height,
      maximized: win.isMaximized()
    }), 'utf8');
  } catch (err) {
    console.error('Failed to save window state:', err);
  }
}

function createWindow() {
  const saved = loadWindowState();
  const devIcon = !app.isPackaged
    ? path.join(__dirname, '..', 'build', 'icon.png')
    : undefined;

  mainWindow = new BrowserWindow({
    width: saved ? saved.width : DEFAULT_WINDOW.width,
    height: saved ? saved.height : DEFAULT_WINDOW.height,
    minWidth: MIN_WINDOW.width,
    minHeight: MIN_WINDOW.height,
    title: APP_NAME,
    icon: devIcon,
    backgroundColor: '#f7f5f0',
    show: false,
    titleBarStyle: 'default',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
      webviewTag: false
    }
  });

  if (saved && saved.maximized) mainWindow.maximize();

  let saveTimer = null;
  const scheduleSave = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveWindowState(mainWindow), 400);
  };
  mainWindow.on('resize', scheduleSave);
  mainWindow.on('move', scheduleSave);
  mainWindow.on('close', () => {
    clearTimeout(saveTimer);
    saveWindowState(mainWindow);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const appPrefix = `${SCHEME}://${HOST}/`;
    if (url.startsWith(appPrefix)) return;
    event.preventDefault();
    if (/^https?:\/\//i.test(url)) {
      shell.openExternal(url);
    }
  });

  mainWindow.loadURL(`${SCHEME}://${HOST}/index.html`);
}

function setupDownloads() {
  session.defaultSession.on('will-download', (event, item) => {
    const filename = item.getFilename() || '序集下载';
    const defaultPath = path.join(app.getPath('downloads'), filename);
    item.setSaveDialogOptions({
      title: '保存文件',
      defaultPath,
      buttonLabel: '保存'
    });
  });
}

function setupPermissions() {
  const allowed = new Set(['clipboard-read', 'clipboard-sanitized-write']);

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(allowed.has(permission));
  });

  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    return allowed.has(permission);
  });
}

function openDataFolder() {
  shell.openPath(app.getPath('userData'));
}

function openDownloadsFolder() {
  shell.openPath(app.getPath('downloads'));
}

function setupMenu() {
  const isMac = process.platform === 'darwin';

  const helpSubmenu = [
    {
      label: '打开数据文件夹',
      click: openDataFolder
    },
    {
      label: '打开下载文件夹',
      click: openDownloadsFolder
    },
    { type: 'separator' },
    {
      label: `关于 ${APP_NAME}`,
      click: () => app.showAboutPanel()
    }
  ];

  const template = [];

  if (isMac) {
    template.push({
      label: app.name,
      submenu: [
        { role: 'about', label: `关于 ${APP_NAME}` },
        { type: 'separator' },
        { role: 'services', label: '服务' },
        { type: 'separator' },
        { role: 'hide', label: `隐藏 ${APP_NAME}` },
        { role: 'hideOthers', label: '隐藏其他' },
        { role: 'unhide', label: '全部显示' },
        { type: 'separator' },
        { role: 'quit', label: `退出 ${APP_NAME}` }
      ]
    });
  } else {
    template.push({
      label: '文件',
      submenu: [
        { label: '打开数据文件夹', click: openDataFolder },
        { label: '打开下载文件夹', click: openDownloadsFolder },
        { type: 'separator' },
        { role: 'quit', label: '退出' }
      ]
    });
  }

  if (isMac) {
    template.push({
      label: '文件',
      submenu: [
        { role: 'close', label: '关闭窗口' },
        { type: 'separator' },
        { label: '打开数据文件夹', click: openDataFolder },
        { label: '打开下载文件夹', click: openDownloadsFolder }
      ]
    });
  }

  template.push({
    label: '编辑',
    submenu: [
      { role: 'undo', label: '撤销' },
      { role: 'redo', label: '重做' },
      { type: 'separator' },
      { role: 'cut', label: '剪切' },
      { role: 'copy', label: '复制' },
      { role: 'paste', label: '粘贴' },
      { role: 'selectAll', label: '全选' }
    ]
  });

  const viewSubmenu = [
    { role: 'reload', label: '重新载入' }
  ];

  if (DEV || !app.isPackaged) {
    viewSubmenu.push({ role: 'toggleDevTools', label: '开发者工具' });
  }

  viewSubmenu.push(
    { type: 'separator' },
    { role: 'resetZoom', label: '实际大小' },
    { role: 'zoomIn', label: '放大' },
    { role: 'zoomOut', label: '缩小' },
    { type: 'separator' },
    { role: 'togglefullscreen', label: '全屏' }
  );

  template.push({ label: '视图', submenu: viewSubmenu });

  const windowSubmenu = [
    { role: 'minimize', label: '最小化' },
    { role: 'zoom', label: '缩放' }
  ];

  if (isMac) {
    windowSubmenu.push(
      { type: 'separator' },
      { role: 'front', label: '前置全部窗口' }
    );
  } else {
    windowSubmenu.push({ role: 'close', label: '关闭' });
  }

  template.push({ label: '窗口', submenu: windowSubmenu });
  template.push({ role: 'help', label: '帮助', submenu: helpSubmenu });

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    app.setAboutPanelOptions({
      applicationName: APP_NAME,
      applicationVersion: app.getVersion(),
      credits: '让每一份灵感，都有序可循。',
      copyright: 'Copyright © 2026 XUJI'
    });

    if (!app.isPackaged && process.platform === 'darwin' && app.dock) {
      const devIcon = path.join(__dirname, '..', 'build', 'icon.png');
      if (fs.existsSync(devIcon)) app.dock.setIcon(devIcon);
    }

    registerAppProtocol();
    setupDownloads();
    setupPermissions();
    setupMenu();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  }).catch((err) => {
    console.error(err);
    dialog.showErrorBox('序集启动失败', String(err && err.stack ? err.stack : err));
    app.quit();
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
