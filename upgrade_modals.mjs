import fs from 'fs';
import path from 'path';

const componentsDir = './src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('Modal.tsx') || f.endsWith('Drawer.tsx'));

files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Upgrade outer wrapper (find any fixed inset-0 combination)
  // E.g. className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm overflow-y-auto custom-scrollbar animate-fade-in"
  // We'll replace bg-gray-900/X or bg-black/X with bg-black/50 backdrop-blur-md
  content = content.replace(/bg-gray-900\/[0-9]+/g, 'bg-black/50');
  content = content.replace(/bg-black\/[0-9]+/g, 'bg-black/50');
  content = content.replace(/backdrop-blur-sm/g, 'backdrop-blur-md');
  
  // Upgrade inner container
  // E.g. className="relative w-full max-w-4xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl my-8 overflow-hidden text-gray-900 dark:text-gray-100 font-sans"
  // Let's add backdrop-blur-2xl bg-white/95 dark:bg-gray-900/95 and ring-1 ring-black/5
  content = content.replace(/bg-white/g, 'bg-white/95 backdrop-blur-xl');
  content = content.replace(/dark:bg-gray-900/g, 'dark:bg-gray-950/90');
  content = content.replace(/bg-white\/95 backdrop-blur-xl/g, 'bg-white/95 backdrop-blur-xl'); // Deduplicate if ran multiple times
  content = content.replace(/shadow-xl/g, 'shadow-2xl');
  content = content.replace(/rounded-xl/g, 'rounded-2xl');
  
  // Make borders softer
  content = content.replace(/border-gray-200/g, 'border-white/20 ring-1 ring-black/5');
  content = content.replace(/dark:border-gray-800/g, 'dark:border-white/10 dark:ring-white/10');

  // Fix button glows/premium styling
  content = content.replace(/bg-\[\#B11226\]/g, 'bg-gradient-to-r from-[#B11226] to-[#E63946] shadow-lg shadow-[#B11226]/30');
  content = content.replace(/hover:bg-\[\#7A0C12\]/g, 'hover:from-[#900E1F] hover:to-[#B11226] hover:shadow-[#B11226]/40 hover:-translate-y-0.5 transition-all');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Upgraded', file);
});
