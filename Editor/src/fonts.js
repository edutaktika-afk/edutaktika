// Custom Google Fonts configuration for Edutaktika Editor
export const CUSTOM_FONTS = [
  // Sans-serif fonts - Great for headings and body text
  {
    name: 'Inter',
    family: 'Inter',
    weights: [300, 400, 500, 600, 700],
    styles: ['normal', 'italic'],
    category: 'sans-serif'
  },
  {
    name: 'Roboto',
    family: 'Roboto',
    weights: [300, 400, 500, 700, 900],
    styles: ['normal', 'italic'],
    category: 'sans-serif'
  },
  {
    name: 'Open Sans',
    family: 'Open Sans',
    weights: [300, 400, 500, 600, 700, 800],
    styles: ['normal', 'italic'],
    category: 'sans-serif'
  },
  {
    name: 'Lato',
    family: 'Lato',
    weights: [300, 400, 700, 900],
    styles: ['normal', 'italic'],
    category: 'sans-serif'
  },
  {
    name: 'Source Sans Pro',
    family: 'Source Sans Pro',
    weights: [300, 400, 600, 700, 900],
    styles: ['normal', 'italic'],
    category: 'sans-serif'
  },
  {
    name: 'Nunito',
    family: 'Nunito',
    weights: [300, 400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
    category: 'sans-serif'
  },
  {
    name: 'Poppins',
    family: 'Poppins',
    weights: [300, 400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
    category: 'sans-serif'
  },
  {
    name: 'Montserrat',
    family: 'Montserrat',
    weights: [300, 400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
    category: 'sans-serif'
  },
  
  // Serif fonts - Great for formal content and reading
  {
    name: 'Playfair Display',
    family: 'Playfair Display',
    weights: [400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
    category: 'serif'
  },
  {
    name: 'Merriweather',
    family: 'Merriweather',
    weights: [300, 400, 700, 900],
    styles: ['normal', 'italic'],
    category: 'serif'
  },
  
  // Monospace fonts - Great for code and technical content
  {
    name: 'IBM Plex Sans',
    family: 'IBM Plex Sans',
    weights: [300, 400, 500, 600, 700],
    styles: ['normal', 'italic'],
    category: 'monospace'
  }
];

// Function to load Google Fonts dynamically
export const loadGoogleFonts = () => {
  const fontFamilies = CUSTOM_FONTS.map(font => font.family).join('|');
  const weights = CUSTOM_FONTS.map(font => font.weights.join(';')).join(';');
  
  // Create link element for Google Fonts
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = 'https://fonts.googleapis.com';
  document.head.appendChild(link);
  
  const link2 = document.createElement('link');
  link2.rel = 'preconnect';
  link2.href = 'https://fonts.gstatic.com';
  link2.crossOrigin = 'anonymous';
  document.head.appendChild(link2);
  
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = `https://fonts.googleapis.com/css2?family=${fontFamilies}:wght@${weights}&display=swap`;
  document.head.appendChild(fontLink);
  
  console.log('Educational Google Fonts loaded successfully');
};

// Function to get font options for Polotno
export const getFontOptions = () => {
  return CUSTOM_FONTS.map(font => ({
    value: font.family,
    label: font.name,
    category: font.category
  }));
};

// Function to apply font to text element
export const applyFontToElement = (element, fontFamily) => {
  if (element && element.set) {
    element.set({
      fontFamily: fontFamily
    });
  }
};

// Function to check if font is loaded
export const isFontLoaded = (fontFamily) => {
  if (document.fonts && document.fonts.check) {
    return document.fonts.check(`16px "${fontFamily}"`);
  }
  return false;
};

// Function to wait for font to load
export const waitForFont = (fontFamily, timeout = 3000) => {
  return new Promise((resolve, reject) => {
    if (isFontLoaded(fontFamily)) {
      resolve(true);
      return;
    }
    
    const timer = setTimeout(() => {
      reject(new Error(`Font ${fontFamily} failed to load within ${timeout}ms`));
    }, timeout);
    
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        clearTimeout(timer);
        resolve(isFontLoaded(fontFamily));
      });
    } else {
      // Fallback for browsers without Font Loading API
      setTimeout(() => {
        clearTimeout(timer);
        resolve(true); // Assume font loaded
      }, 1000);
    }
  });
};

export default {
  CUSTOM_FONTS,
  loadGoogleFonts,
  getFontOptions,
  applyFontToElement,
  isFontLoaded,
  waitForFont
};

