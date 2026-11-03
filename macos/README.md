# 序集 XUJI · Mac 版（Electron）

这是「序集 XUJI · 图片与文档整理」的 macOS 包装版。界面和功能和 Windows 版一致，使用 Electron + Chromium 内核，数据保存在 Mac 本地。

> 2026-11 品牌升级：原「图记 / TuJi」更名为「序集 / XUJI」。Mac 数据目录继续使用 `~/Library/Application Support/图记/`，`app://tuji` 协议不变，升级后可直接读取原有数据。

## 下载安装包

> 序集版已于 2026-11-03 在 GitHub Actions（macos-latest / arm64）构建并发布。

- macOS 发布页：https://github.com/kkkki04/xuji/releases/tag/v1.0.0
  - `XUJI-macOS-arm64-v1.0.0.dmg`（121,461,328 字节）
    SHA-256 `25CA4C4F77F20D8CF28E0E16BEF0B348412546EDB62F37996BF4A83685A92FD6`
  - `XUJI-macOS-arm64-v1.0.0.zip`（120,563,231 字节）
    SHA-256 `4705C1918E14B72E3BAD1A0C1E4F8A87D94EE3822D62F24EAE6FBB5294445C0F`
- Windows 安装包也放在同一页面：`XUJI-Windows-x64-v1.0.0.exe`
  SHA-256 `8B91A790A5C1E65ECE221C6FE817D0EA3CB7358D54491F5B7AA65BCB6C570259`
- Windows 安装包在同一 Release：https://github.com/kkkki04/xuji/releases/tag/v1.0.0

> 仓库已公开，可直接下载。
> 如果打开仓库首页看不到安装包，请点右侧的 **Releases**，或直接用上面的发布页链接。


## 文档（2026-11-03 更新）

- 支持导入 **Markdown 文档**：点顶部「添加」选择 `.md` 文件，或直接把 `.md` 拖进窗口 / 文件夹。
- 文档卡片和图片卡片外观一致，缩略图位置显示文档标题和开头几行内容。
- **点击文档卡片**，右侧会滑出阅读栏，按 Markdown 渲染标题、列表、表格、引用、代码块（带复制按钮）等。
- 右侧栏可以直接「复制」原文或「下载」`.md` 文件。
- 顶部统计栏新增 **图片 / 文档 勾选筛选**：只勾图片就只看图片，只勾文档就只看文档，选择会记住。
- 文档同样支持命名、备注、收藏、完成、移动、删除和撤销。
- 备份会一起导出文档内容；ZIP 里文档在 `文档/` 目录，图片在 `图片/` 目录。
- 注意：含文档的备份需要 2026-11-03 或更新的版本才能正确导入。

## 界面风格（2026-10-28 更新）

- 整体改为**无描边**风格：米白背景、白色圆角卡片、柔和阴影、橄榄绿主色、衬线标题、胶囊控件。
- 顶部前进 / 后退改成两个轻量圆形箭头按钮，不再有白色胶囊和描边。
- 底部文件夹分组栏改为悬浮圆角白色 dock，选中项是淡绿胶囊。
- 选中操作条、提示条改为白色半透明 + 阴影；弹窗、搜索框、筛选器、排序都改为填充式无边框圆角。
- 功能不变：撤销仍然是 **⌘Z**、重做 **⇧⌘Z**（Windows 是 Ctrl+Z / Ctrl+Y），没有「撤销」按钮，也不会弹带按钮的提示条。

> 目录：`E:\tjmac`  
> 应用名：`序集.app`  
> 数据目录：`~/Library/Application Support/图记/`

## 快速开始

1. 把整个 `tjmac` 文件夹复制到 Mac（**不要复制 Windows 的 `node_modules`**，它在 Mac 上不能用）。
2. 在 Mac 上安装 Node.js 22.12 或更新版本（建议 LTS）。
3. 打开终端：

```bash
cd /路径/tjmac
npm install
npm start
```

要直接打包成 `.app` / `.dmg`：

```bash
npm run dist:mac
```

不想敲命令也可以：安装 Node.js 后，直接双击项目里的 **`构建序集.command`**。  
它会自动执行 `npm install` 和 `npm run dist:mac`，完成后打开 `dist` 文件夹。

> 如果 macOS 提示“无法打开”，右键 `构建序集.command` → **打开**。  
> 这个脚本默认使用国内 Electron 镜像，网络正常时也可以不管。

如果完全不想在 Mac 上装 Node，也可以看下面的 **GitHub 自动打包**。

---

## 图片编辑 / 裁剪

1. 点图片打开大图预览，点 **编辑 / 裁剪**；也可以右键图片 → **编辑 / 裁剪…**。
2. 拖动裁剪框移动位置，拖边框或四角调整大小。
3. 工具栏支持 **左转 / 右转 / 水平翻转 / 重置**，右侧实时显示裁剪后的像素尺寸。
4. 点 **保存裁剪** 替换当前图片；图片名称、备注、分组、完成状态都不会变。
5. 点 **取消** 或按 **Esc** 放弃本次编辑，不会修改原图。

保存时会尽量保持原格式：PNG / JPEG / WebP 按原格式输出，其他格式（包括 GIF）输出为 PNG。裁剪会替换当前图片本身，重要图片建议先导出备份。

---

## 大图预览

- 顶部的图片名称可以直接点进去修改，改完自动保存。
- 名称旁的 ☆ 可以收藏 / 取消收藏这张图。
- 滚轮或左上角 `−` / `+` 缩放（20%–600%），点中间的百分比回到 100%。
- 双击图片在 100% 和 200% 之间切换；放大后按住图片拖动查看。
- 方向键切换上一张/下一张，Esc 关闭。
- 底部可直接「移动到文件夹」或「移动到分组」，移动后会关闭预览并回到列表。

---

## 图片收藏 / 撤销 / 顶栏

- 卡片右下角的 ☆ 收藏图片，金色 ★ 表示已收藏；默认排序会把收藏的图排在最前面。
- 添加 / 粘贴图片、删除图片 / 文件夹 / 分组、移动图片 / 文件夹、改名、收藏、标记完成都可以撤销 / 重做：**⌘Z** 撤销，**⇧⌘Z** 重做（Windows 是 Ctrl+Z / Ctrl+Y），可连续多步。
- 左上角现在显示**文件夹路径**和前进 / 后退按钮，原来的 logo 和标题已移除。

---

## 排序 / 按文件夹导出

- 顶部「排序」支持 **名称 ↑ / 名称 ↓ / 日期 ↑ / 日期 ↓**；根目录排序文件夹，文件夹内排序图片，选择会记住。
- 窗口大小会自动记住（包括最大化状态），下次打开恢复到上次大小。
- 点顶部「管理」后：
  - 在文件夹内可以点图片选中；
  - 在根目录可以直接点文件夹卡片选中（会包含里面的子文件夹），再点顶部「复制图文 / 保存长图 / 分享网页 / 导出 ZIP」等按钮，只导出选中的文件夹内容；
  - 也可以点「全选」选中当前层所有文件夹；点「完成」退出管理。

---

## 文件夹导航

- 窗口顶部文件夹路径左侧有 `‹` `›`，像浏览器一样前进/后退。
- 鼠标有侧键时，**后退键**返回上一级/上一个位置，**前进键**恢复到下一个位置。
- 侧键不会触发浏览器原生历史跳转；到根目录或历史尽头时自动停止。

---

## 拖拽导入

- 从 Finder 或微信直接把图片拖进窗口，不需要先复制粘贴。
- 支持一次拖入多张图片，也支持直接拖入整个文件夹（会递归读取里面的图片）。
- 在根目录可以把图片拖到某个文件夹卡片上；拖到空白处会放到上次使用的文件夹。
- 图片是**复制**进序集的，原文件不会被移动。
- 空 MIME / 临时文件（微信常见）会根据文件头自动识别为图片。

---

## 1. 在 Mac 上运行开发版

需要先安装 **Node.js 22.12 或更新版本**（建议 LTS）。

> 如果这个目录是从 Windows 复制过来的，先删除 `node_modules` 再安装。Windows 的 Electron 二进制在 Mac 上不能用。

```bash
cd /路径/tjmac
rm -rf node_modules
npm install
npm start
```

第一次 `npm install` 会下载 Electron，约 100～200MB，需要联网。

如果下载 Electron 很慢或卡住，可以先设置国内镜像：

```bash
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
export ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/"
npm install
```

开发模式带开发者工具菜单；打包后的正式版不显示开发者工具。

---

## 2. 打包成 Mac `.app` / `.dmg`

在 Mac 上执行：

```bash
cd /路径/tjmac
npm install
npm run dist:mac
```

或者直接双击 `构建序集.command`，效果一样。

产物在 `dist/`：

- `序集-1.0.0-arm64.dmg`
- `序集-1.0.0-arm64.zip`
- `dist/mac-arm64/序集.app`

`npm run dist:mac` 只打 Apple Silicon（arm64），适合 M5 MacBook Air。

如果需要同时支持 Intel Mac：

```bash
npm run dist:mac:universal
```

> 当前 `package.json` 里设置了 `"identity": null`，不做代码签名。自己用没问题；如果要发给别人，需要 Apple Developer 账号并配置签名和公证。

如果 macOS 提示“无法打开，因为无法验证开发者”：

1. 在 Finder 里右键 `序集.app` → **打开**；
2. 或执行：

```bash
xattr -dr com.apple.quarantine "/Applications/序集.app"
```

---

## GitHub 自动打包（可选，不用本地装 Node）

统一仓库 `xuji` 默认在本地或 macOS 机器上执行 `npm ci` 和 `npm run dist:mac`。如果需要在 GitHub Actions 自动构建，可自行添加 `.github/workflows/build-mac.yml`（工作目录设为 `macos`），GitHub 会在 macOS 机器上生成 arm64 的 DMG/ZIP 并作为 artifact 提供下载。

### 第一次设置

1. 注册/登录 GitHub：<https://github.com>
2. 新建一个仓库（建议 Private），例如 `xuji`。
3. 把 `E:\tjmac` 里的**内容**上传到仓库根目录。推荐用 GitHub Desktop：Add local repository → 选择 `E:\tjmac` → Publish repository。  
   不要上传 `node_modules`、`dist`，`.gitignore` 已经排除。
4. 打开仓库的 **Actions** 页，左侧选 **Build macOS App**，点 **Run workflow**。
   - 如果上传到了 `main` 或 `master` 分支，推送后也会自动运行。
5. 等 3～8 分钟。构建完成后，在运行记录页面底部下载 **xuji-mac-arm64**。
6. 解压下载的 artifact，得到：
   - `序集-1.0.0-arm64.dmg`
   - `序集-1.0.0-arm64.zip`
   - `SHA256SUMS.txt`
7. 双击 DMG，把 `序集.app` 拖到“应用程序”。

> 这是未签名版本，第一次打开仍需右键 → 打开。  
> 想要双击无警告，需要 Apple Developer 账号做签名和公证。

---

## 3. 数据存在哪里

Electron 版的数据目录是：

```text
~/Library/Application Support/图记/
```

里面有 Chromium 的 IndexedDB / Local Storage，图片和备注都在这里。应用菜单里有：

- **帮助 → 打开数据文件夹**
- **帮助 → 打开下载文件夹**

备份文件默认通过“保存文件”对话框保存到你选择的位置。

> 不要手动删除这个目录，否则图片和文件夹会丢失。  
> 清理浏览器数据不会影响它，因为这是独立 App，不是浏览器。

---

## 4. 从 Windows 迁移数据

Mac 版不能直接读取 Windows 的 `图记数据` 目录，需要走备份文件（新版 `.jsonl` 或旧版 `.json`）。

### Windows 上

1. 打开 Windows 版序集。
2. 点 **备份 → 导出全部数据（.jsonl 推荐）**。
3. 得到 `序集备份_日期.jsonl`（数据很大时先压缩成 `.zip` 再发）。
4. 把这个文件发到 Mac。微信里请按「文件」发送，不要按图片发送。

### Mac 上

1. 打开 `序集.app`。
2. 点 **备份 → 导入备份（追加）**。
3. 选择从 Windows 发来的 `.jsonl`（压缩过就先解压；旧版 `.json` 也支持）。

图片、备注、文件夹、分组、收藏、完成状态、图片收藏都会导入。

新版 `.jsonl` 是流式读写，一张一张导出和导入，几百 MB 的图片库也不会白屏；旧版单文件 `.json` 在数据很大时容易内存不足。

注意：导入是**追加**模式。如果 Mac 上已经有同名文件夹，会变成：

```text
默认文件夹（导入）
默认文件夹（导入 2）
```

如果 Mac 是全新安装，导入后可能会多出一个空的“默认文件夹”，可以手动删掉。导出或导入过程中请不要关闭序集。

---

## 5. 关于“同步”

当前版本**没有自动云同步**。Windows 和 Mac 各自保存一份本地数据。

- 一次性迁移：用上面的备份文件。
- 日常备份：定期在 Mac 上导出 `.jsonl`。
- 两边同时编辑：目前不支持自动合并；重复导入会追加副本。

如果以后需要 Windows/Mac 自动同步，需要另外接云数据库（例如 Supabase）并处理冲突合并，这不是换一个壳能解决的。

---

## 6. 项目结构

```text
macos/
├─ package.json              # Electron / electron-builder 配置
├─ 构建序集.command           # Mac 上双击构建
├─ .gitattributes            # 保证 .command 使用 LF 换行
├─ src/
│  └─ main.js                # 主进程：窗口、菜单、协议、下载
├─ renderer/
│  └─ index.html             # 序集网页版（从 Windows 版复制）
├─ build/
│  ├─ icon.icns              # Mac 图标
│  ├─ icon.ico               # Windows 测试用图标
│  ├─ icon.png               # 1024px 图标
│  └─ icon.iconset/          # Mac iconutil 可用的图标集
├─ scripts/
│  └─ make-icons.ps1         # 在 Windows 上重新生成图标
└─ dist/                     # 打包输出，git 忽略
```

### 更新序集界面

Windows 版更新后，把新的 `index.html` 覆盖到：

```text
renderer/index.html
```

然后重新 `npm start` 或重新打包即可。数据不受影响，因为数据存在 `~/Library/Application Support/图记/`，不在 `index.html` 里。

### 关于 origin

应用通过自定义协议加载：

```text
app://tuji/index.html
```

这样 IndexedDB 和 localStorage 的 origin 固定为 `app://tuji`，移动 `.app` 或升级版本都不会丢数据。不要改成 `file://`，否则可能出现数据存储位置变化的问题。

---

## 7. 已知差异

- **分享按钮**：依赖 `navigator.share`。如果 Electron 当前平台不支持，序集会自动隐藏分享按钮；其他功能不受影响。
- **代码签名**：默认不签名。自己用右键打开即可。
- **包体积**：Electron 包约 100～200MB，这是换取 Chromium 兼容性的代价。
- **自动同步**：不支持，仍然需要导出/导入 JSON。

---

## 8. 常见问题

### GitHub Actions 里没有 `Run workflow` 按钮

先把项目 push 到 GitHub，并确认 `.github/workflows/build-mac.yml` 在默认分支上。  
workflow 文件不在默认分支时，Actions 页面不会显示这个工作流。

### GitHub Actions 打包失败

先看运行日志。常见原因是 `package-lock.json` 和 `package.json` 不同步：在项目目录执行一次 `npm install`，把更新后的 `package-lock.json` 一起提交。

### 双击 `构建序集.command` 没反应

可能是解压工具丢了执行权限。打开终端，进入项目目录执行一次：

```bash
chmod +x 构建序集.command
```

### `npm start` 提示 Electron failed to install correctly

说明 Electron 二进制没有下载完整。在项目目录执行：

```bash
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
node node_modules/electron/install.js
```

然后再 `npm start`。

### 打开后是空白页

用开发模式看控制台：

```bash
npm run start:debug
```

### 下载没有弹出保存框

检查 `~/Downloads`，或在菜单里打开“下载文件夹”。应用已经为下载设置了保存对话框。

### 粘贴图片没反应

确认当前是序集窗口，并且系统没有限制剪贴板权限。应用已允许 `clipboard-read` / `clipboard-sanitized-write`。

### 数据会跟着 `.app` 一起被删吗？

不会。`.app` 只是程序，数据在 `~/Library/Application Support/图记/`。删除 `.app` 不会删除数据；要彻底删除需手动删除该数据目录。

---

## 9. 在 Mac 上重新生成图标（可选）

`build/icon.icns` 已经生成好。如果需要修改 `build/icon.iconset` 后重新生成：

```bash
iconutil -c icns build/icon.iconset -o build/icon.icns
```

在 Windows 上重新生成整套图标：

```powershell
npm run icon
```

（需要 Windows PowerShell 和 .NET Framework，macOS 上不需要执行。）
