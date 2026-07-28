import fs from 'fs';
import path from 'path';

const componentsDir = './src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('Modal.tsx') || f.endsWith('Drawer.tsx'));

files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix the invalid /30/10 opacity
  content = content.replace(/shadow-\[\#B11226\]\/30\/[0-9]+/g, 'shadow-[#B11226]/30');
  
  // Fix the from-gray-50 to-white with the border/ring replacement
  // We replaced border-gray-200 with border-white/20 ring-1 ring-black/5
  // But on border-b or border-t it shouldn't have ring
  content = content.replace(/border-b border-white\/20 ring-1 ring-black\/5/g, 'border-b border-gray-100/10');
  content = content.replace(/border-t border-white\/20 ring-1 ring-black\/5/g, 'border-t border-gray-100/10');
  
  // Clean up any double `dark:border-white/10 dark:ring-white/10` inside border-b
  content = content.replace(/dark:border-white\/10 dark:ring-white\/10/g, 'dark:border-white/10');

  // Replace text-[#B11226] on gradient backgrounds because gradient bg + red text = unreadable
  content = content.replace(/bg-gradient-to-r from-\[\#B11226\] to-\[\#E63946\] shadow-lg shadow-\[\#B11226\]\/30 text-\[\#B11226\]/g, 'bg-[#B11226]/10 text-[#B11226]');

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('Fixed styling glitches.');
