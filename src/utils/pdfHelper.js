import * as PDFLib from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// อัตราส่วนระยะห่างบรรทัด (เทียบกับขนาดฟอนต์) ต้องตรงกับตอนวาดลง PDF
export const TEXT_LINE_HEIGHT_FACTOR = 1.2;

// ตราประทับรับ: 1 ซ.ม. = 72 / 2.54 point
export const CM_TO_PT = 72 / 2.54;
export const cmToPt = (cm) => (Number(cm) || 0) * CM_TO_PT;
export const DEFAULT_STAMP_COLOR = '#0b0a0a';
export const DEFAULT_STAMP_WIDTH_CM = 5; // กว้าง (ซ.ม.)
export const DEFAULT_STAMP_HEIGHT_CM = 2.5; // สูง (ซ.ม.)
export const STAMP_FONT_SIZE = 14;

export const base64ToUint8Array = (base64) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const uint8ArrayToBase64Async = (uint8Array) => {
  return new Promise((resolve, reject) => {
    const blob = new Blob([uint8Array], { type: 'application/pdf' });
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      resolve(dataUrl.split(',')[1]);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
};

/**
 * แปลงรหัสสี Hex (เช่น #000000, #002060, #c00000) เป็น PDFLib.rgb(0..1, 0..1, 0..1)
 */
export const hexToPdfRgb = (hex) => {
  if (!hex) return PDFLib.rgb(0, 0, 0);
  let clean = String(hex).replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6) return PDFLib.rgb(0, 0, 0);
  const num = parseInt(clean, 16);
  if (isNaN(num)) return PDFLib.rgb(0, 0, 0);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  return PDFLib.rgb(r, g, b);
};

/**
 * แยกข้อความตามบรรทัด (รองรับทั้ง \n, \r\n และ \r)
 * ใช้ร่วมกับ pdf-lib ที่ตัดบรรทัดด้วยอักขระขึ้นบรรทัดใหม่เท่านั้น (ไม่ตัดปีกอัตโนมัติ)
 */
export const splitTextLines = (content) =>
  String(content ?? '').replace(/\r\n?/g, '\n').split('\n');

// แคชฟอนต์สำหรับวัดขนาดข้อความ (fontkit) ให้ตรงกับ pdf-lib ที่ embed ฟอนต์เดียวกัน
let measureFontCache = null;
let measureFontBytesCache = null;

const getMeasureFont = (fontBytes) => {
  if (!fontBytes) return null;
  if (measureFontCache && measureFontBytesCache === fontBytes) return measureFontCache;
  try {
    measureFontCache = fontkit.create(fontBytes);
    measureFontBytesCache = fontBytes;
    return measureFontCache;
  } catch {
    measureFontCache = null;
    measureFontBytesCache = null;
    return null;
  }
};

/**
 * วัดความกว้างข้อความหนึ่งบรรทัด (หน่วย point) ให้ตรงกับ pdf-lib
 * ถ้ายังไม่มี fontBytes จะประมาณการจากจำนวนอักษรแทน
 */
export const measureTextWidth = (text, size, fontBytes) => {
  if (!text) return 0;
  const font = getMeasureFont(fontBytes);
  if (font) {
    try {
      const glyphs = font.layout(String(text)).glyphs;
      let total = 0;
      for (const g of glyphs) total += g.advanceWidth;
      return (total * size) / font.unitsPerEm;
    } catch {
      // ตกไปใช้การประมาณการด้านล่าง
    }
  }
  return String(text).length * size * 0.5;
};

/**
 * คำนวณ bounding box ของข้อความในพิกัด PDF (มุมซ้ายล่าง = 0,0, y ชี้ขึ้น)
 * หมายเหตุ: item.x, item.y คือ baseline ของบรรทัดแรก (ตรงกับ pdf-lib drawText)
 * คืนค่า { x, y, width, height } โดย x, y = มุมซ้ายล่างของกล่อง
 */
export const getTextAnnotationBox = (annot, fontBytes) => {
  const size = annot.size || 16;
  const lines = splitTextLines(annot.content);
  const lineHeight = size * TEXT_LINE_HEIGHT_FACTOR;
  const ascent = size * 0.8;
  const descent = size * 0.2;
  const width = Math.max(0, ...lines.map((line) => measureTextWidth(line, size, fontBytes)));
  const height = ascent + descent + (lines.length - 1) * lineHeight;
  return {
    x: annot.x,
    y: annot.y - descent - (lines.length - 1) * lineHeight,
    width,
    height
  };
};

const pad2 = (n) => String(n).padStart(2, '0');

/** วันที่ปัจจุบันรูปแบบ วว/ดด/ปปปี้ (พ.ศ.) */
export const getStampDateText = (date = new Date()) =>
  `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear() + 543}`;

/** เวลาปัจจุบันรูปแบบ HH:mm */
export const getStampTimeText = (date = new Date()) =>
  `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

/** สร้างข้อความ 4 บรรทัดของตราประทับรับ: เลขรับ / วันที่ / เวลา */
export const buildStampLines = (annot) => [
  'โรงเรียนกุมภวาปีพิทยาสรรค์',
  annot.receiptNo ? `เลขรับ ${annot.receiptNo}` : 'เลขรับ',
  `วันที่ ${annot.dateText || ''}`,
  `เวลา ${annot.timeText || ''}`
];

/**
 * คำนวณ baseline ของบรรทัดแรกของตราประทับ เพื่อจัดกึ่งกลางแนวตั้งในกล่อง
 * (ใช้ร่วมกันทั้ง preview และ pdf-lib ให้ตำแหน่งตรงกัน)
 */
export const getStampFirstBaseline = (annot) => {
  const size = annot.size || 14;
  const lineHeight = size * TEXT_LINE_HEIGHT_FACTOR;
  const totalH = 4 * lineHeight;
  // offset จากขอบบนของบรรทัดถึง baseline ≈ ascent + half-leading
  const baselineOffset = lineHeight / 2 + (size * 0.8 - size * 0.2) / 2;
  return annot.y + (annot.height + totalH) / 2 - baselineOffset;
};