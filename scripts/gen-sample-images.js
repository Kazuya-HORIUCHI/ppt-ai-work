// scripts/gen-sample-images.js
// assets/samples 配下のサンプル画像（4:3）を Node.js 標準ライブラリのみで生成する。
// pptxgenjs から参照されるダミー写真用。実運用ではユーザが用意した画像を使う。
//
// 実行: node scripts/gen-sample-images.js

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const OUT_DIR = path.resolve(__dirname, "..", "assets", "samples");

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// 8-bit RGB、フィルタ None、無圧縮なしの最小構成 PNG エンコーダ。
function encodePng(width, height, pixelFn) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 2;   // color type: truecolor (RGB)
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace
  const rowLen = width * 3 + 1;
  const raw = Buffer.alloc(rowLen * height);
  for (let y = 0; y < height; y++) {
    const rowOff = y * rowLen;
    raw[rowOff] = 0; // filter type: None
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelFn(x, y);
      const o = rowOff + 1 + x * 3;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
    }
  }
  const idat = zlib.deflateSync(raw);
  const iend = Buffer.alloc(0);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", iend),
  ]);
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function lerpRgb(from, to, t) {
  return [lerp(from[0], to[0], t), lerp(from[1], to[1], t), lerp(from[2], to[2], t)];
}

// 対角グラデに薄い格子を重ねた抽象画像。「写真らしさ」は無いが、
// 4:3 アスペクト比とレイアウト確認には十分。
function generateGradient(filename, w, h, palette) {
  const buf = encodePng(w, h, (x, y) => {
    const t = (x / (w - 1) + y / (h - 1)) / 2;
    const [r, g, b] = lerpRgb(palette.from, palette.to, t);
    const onGrid = x % 40 === 0 || y % 40 === 0;
    if (onGrid) {
      return [Math.max(0, r - 14), Math.max(0, g - 14), Math.max(0, b - 14)];
    }
    return [r, g, b];
  });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, buf);
  console.log(`Generated: ${outPath} (${buf.length} bytes, ${w}x${h})`);
}

generateGradient("case-1.png", 800, 600, {
  from: [37, 99, 235],    // #2563EB (accent blue)
  to:   [191, 219, 254],  // #BFDBFE (light blue)
});
