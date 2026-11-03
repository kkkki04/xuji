# 序集 XUJI · 图标生成（macOS 构建资源）
# 从 build/logo-source.jpg 生成 build/icon.png、build/icon.iconset、build/icon.icns
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$build = Join-Path $root 'build'
$iconset = Join-Path $build 'icon.iconset'
$srcPath = Join-Path $build 'logo-source.jpg'
if (-not (Test-Path $srcPath)) { throw "找不到源图：$srcPath" }
New-Item -ItemType Directory -Force -Path $build, $iconset | Out-Null
Get-ChildItem $iconset -File | Remove-Item -Force -ErrorAction SilentlyContinue

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
function Test-Green($c) { return ($c.G -gt 95 -and $c.G -gt ($c.R + 18) -and $c.G -gt ($c.B + 28)) }
$cx = [int]($src.Width / 2); $cy = [int]($src.Height / 2)
$left = 0; for ($x = 0; $x -lt $src.Width; $x++) { if (Test-Green $src.GetPixel($x, $cy)) { $left = $x; break } }
$right = $src.Width - 1; for ($x = $src.Width - 1; $x -ge 0; $x--) { if (Test-Green $src.GetPixel($x, $cy)) { $right = $x; break } }
$top = 0; for ($y = 0; $y -lt $src.Height; $y++) { if (Test-Green $src.GetPixel($cx, $y)) { $top = $y; break } }
$bottom = $src.Height - 1; for ($y = $src.Height - 1; $y -ge 0; $y--) { if (Test-Green $src.GetPixel($cx, $y)) { $bottom = $y; break } }
$cropRect = New-Object System.Drawing.Rectangle($left, $top, ($right - $left + 1), ($bottom - $top + 1))

function New-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

function New-TileBitmap([int]$Size, [double]$PadPercent) {
  $bmp = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)
  $pad = [float]($Size * $PadPercent)
  $w = [float]($Size - 2 * $pad)
  $r = [float]($w * 0.225)
  $path = New-RoundedPath $pad $pad $w $w $r
  $g.SetClip($path, [System.Drawing.Drawing2D.CombineMode]::Replace)
  $dest = New-Object System.Drawing.RectangleF($pad, $pad, $w, $w)
  $g.DrawImage($src, $dest, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.ResetClip(); $path.Dispose(); $g.Dispose()
  return $bmp
}

function Save-Png($bmp, [string]$path) {
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

Save-Png (New-TileBitmap 1024 0.075) (Join-Path $build 'icon.png')

$map = @(
  @('icon_16x16.png', 16), @('icon_16x16@2x.png', 32),
  @('icon_32x32.png', 32), @('icon_32x32@2x.png', 64),
  @('icon_128x128.png', 128), @('icon_128x128@2x.png', 256),
  @('icon_256x256.png', 256), @('icon_256x256@2x.png', 512),
  @('icon_512x512.png', 512), @('icon_512x512@2x.png', 1024)
)
foreach ($m in $map) { Save-Png (New-TileBitmap ([int]$m[1]) 0.075) (Join-Path $iconset $m[0]) }

$icnsEntries = @(
  @('ic11', 32), @('ic12', 64), @('ic07', 128), @('ic08', 256),
  @('ic13', 256), @('ic09', 512), @('ic14', 512), @('ic10', 1024)
)
$blobs = @()
foreach ($e in $icnsEntries) {
  $b = New-TileBitmap ([int]$e[1]) 0.075
  $ms = New-Object System.IO.MemoryStream
  $b.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  $blobs += ,@{ type = $e[0]; data = $ms.ToArray() }
  $b.Dispose(); $ms.Dispose()
}
$icnsPath = Join-Path $build 'icon.icns'
$total = 8
foreach ($x in $blobs) { $total += 8 + $x.data.Length }
$fs = [System.IO.File]::Create($icnsPath)
$bw = New-Object System.IO.BinaryWriter($fs)
function Write-BE32([System.IO.BinaryWriter]$w, [uint32]$v) {
  $w.Write([byte](($v -shr 24) -band 0xFF))
  $w.Write([byte](($v -shr 16) -band 0xFF))
  $w.Write([byte](($v -shr 8) -band 0xFF))
  $w.Write([byte]($v -band 0xFF))
}
$bw.Write([System.Text.Encoding]::ASCII.GetBytes('icns'))
Write-BE32 $bw ([uint32]$total)
foreach ($x in $blobs) {
  $bw.Write([System.Text.Encoding]::ASCII.GetBytes($x.type))
  Write-BE32 $bw ([uint32](8 + $x.data.Length))
  $bw.Write([byte[]]$x.data)
}
$bw.Close(); $fs.Close()
$src.Dispose()
Write-Host ("已生成：{0} / {1}" -f (Join-Path $build 'icon.png'), $icnsPath)
