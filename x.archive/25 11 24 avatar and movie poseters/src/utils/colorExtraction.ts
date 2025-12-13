// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return [h * 360, s * 100, l * 100];
}

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Extract bright, vibrant color from image
export function extractDominantColor(image: HTMLImageElement): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#4A90E2'; // Default bright blue
    
    canvas.width = 100;
    canvas.height = 100;
    ctx.drawImage(image, 0, 0, 100, 100);
    
    const imageData = ctx.getImageData(0, 0, 100, 100);
    const data = imageData.data;
    
    // Collect bright, saturated colors
    const brightColors: Array<[number, number, number]> = [];
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Convert to HSL
      const [h, s, l] = rgbToHsl(r, g, b);
      
      // Filter for bright, saturated colors (avoid dark, gray, brown)
      // Lightness > 30% (not too dark)
      // Saturation > 20% (not gray)
      // Avoid browns (hue around 20-40 degrees with low saturation)
      const isBrown = (h >= 15 && h <= 45 && s < 50);
      const isDark = l < 30;
      const isGray = s < 20;
      
      if (!isDark && !isGray && !isBrown) {
        brightColors.push([h, s, l]);
      }
    }
    
    // If we found bright colors, use the average
    if (brightColors.length > 0) {
      let avgH = 0, avgS = 0, avgL = 0;
      brightColors.forEach(([h, s, l]) => {
        avgH += h;
        avgS += s;
        avgL += l;
      });
      
      avgH /= brightColors.length;
      avgS /= brightColors.length;
      avgL /= brightColors.length;
      
      // Boost saturation and ensure good lightness for brightness
      avgS = Math.min(100, avgS * 1.3); // Increase saturation
      avgL = Math.max(50, Math.min(80, avgL)); // Keep lightness between 50-80% for brightness
      
      const [r, g, b] = hslToRgb(avgH, avgS, avgL);
      return `rgb(${r}, ${g}, ${b})`;
    }
    
    // Fallback: if no bright colors found, use a default bright color
    // Try to find any color with decent saturation
    let fallbackH = 0, fallbackS = 0, fallbackL = 0, count = 0;
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const [h, s, l] = rgbToHsl(r, g, b);
      
      if (s > 10 && l > 20) {
        fallbackH += h;
        fallbackS += s;
        fallbackL += l;
        count++;
      }
    }
    
    if (count > 0) {
      fallbackH /= count;
      fallbackS = Math.min(100, (fallbackS / count) * 1.5);
      fallbackL = Math.max(55, Math.min(75, fallbackL / count));
      const [r, g, b] = hslToRgb(fallbackH, fallbackS, fallbackL);
      return `rgb(${r}, ${g}, ${b})`;
    }
    
    // Ultimate fallback: bright blue
    return '#4A90E2';
  } catch (error) {
    return '#4A90E2'; // Default bright blue
  }
}

