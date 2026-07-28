import fs from 'fs';
import path from 'path';

const componentsDir = './src/components';
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx')); // Run on all components to catch the folder popup too!

files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Revert Glassmorphism on Modals
  content = content.replace(/bg-white\/95 backdrop-blur-xl/g, 'bg-white');
  content = content.replace(/dark:bg-gray-950\/90/g, 'dark:bg-gray-900');
  content = content.replace(/bg-black\/50 backdrop-blur-md/g, 'bg-gray-900/50');
  content = content.replace(/border-white\/20/g, 'border-gray-200');
  content = content.replace(/dark:border-white\/10/g, 'dark:border-gray-800');
  content = content.replace(/ring-1 ring-black\/5/g, '');
  content = content.replace(/dark:ring-white\/10/g, '');
  
  // Revert Gradients on buttons
  content = content.replace(/bg-gradient-to-r from-\[\#B11226\] to-\[\#E63946\] shadow-lg shadow-\[\#B11226\]\/30/g, 'bg-[#B11226]');
  content = content.replace(/hover:from-\[\#900E1F\] hover:to-\[\#B11226\] hover:shadow-\[\#B11226\]\/40 hover:-translate-y-0\.5 transition-all/g, 'hover:bg-[#900E1F] transition-colors');
  content = content.replace(/bg-gradient-to-br from-\[\#B11226\] to-\[\#7A0C12\]/g, 'bg-[#B11226]');

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('Fixed styling to solid friendly colors.');
