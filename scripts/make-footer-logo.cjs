/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require("sharp");

const source = "public/images/logo_K-SPORT.jpg";
const output = "public/images/logo-footer-clean.png";

async function removeWhite(input) {
  const image = sharp(input).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const white = data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235;
    if (white) data[i + 3] = 0;
  }
  return sharp(data, { raw: info }).png();
}

async function main() {
  const transparent = await removeWhite(source);
  const cleanBuffer = await transparent.png().toBuffer();
  const icon = await sharp(cleanBuffer).extract({ left: 350, top: 0, width: 760, height: 700 }).resize(82, 82, { fit: "contain" }).png().toBuffer();
  const wordmark = await sharp(cleanBuffer).extract({ left: 80, top: 660, width: 1370, height: 365 }).resize(230, 82, { fit: "contain" }).png().toBuffer();
  const composed = await sharp({ create: { width: 330, height: 90, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([
    { input: icon, left: 0, top: 4 },
    { input: wordmark, left: 92, top: 4 },
  ]).png().toBuffer();
  const { data, info } = await sharp(composed).raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < 20 && data[i + 1] < 20 && data[i + 2] < 20) { data[i] = 6; data[i + 1] = 36; data[i + 2] = 81; data[i + 3] = 255; }
  }
  await sharp(data, { raw: info }).png().toFile(output);
}

main().catch((error) => { console.error(error); process.exit(1); });
