const fs = require('fs');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ✓ ${filePath}`);
}

// 1. BatchDetail.tsx
{
  const file = 'src/pages/BatchDetail.tsx';
  let c = readFile(file);
  c = c.replace("import axios from 'axios';\n", '');
  writeFile(file, c);
}

// 2. PhysicalInventoryList.tsx
{
  const file = 'src/pages/physical-inventory/PhysicalInventoryList.tsx';
  let c = readFile(file);
  // Fix the errorLog handling
  c = c.replace(
    'const handleViewError = (errorLog: Record<string, unknown>) =>',
    'const handleViewError = (errorLog: Record<string, unknown> | undefined) =>'
  );
  
  c = c.replace(
    'const [errorLogData, setErrorLogData] = useState<Record<string, unknown> | null>(null);',
    'const [errorLogData, setErrorLogData] = useState<Record<string, unknown> | undefined | null>(null);'
  );

  writeFile(file, c);
}

// 3. PhysicalInventoryUpload.tsx
{
  const file = 'src/pages/physical-inventory/PhysicalInventoryUpload.tsx';
  let c = readFile(file);
  c = c.replace("import axios from 'axios';\n", '');
  writeFile(file, c);
}

// 4. Products.tsx
{
  const file = 'src/pages/Products.tsx';
  let c = readFile(file);
  c = c.replace("import axios from 'axios';\n", '');
  // Remove unused Skeletons component
  c = c.replace(/const Skeletons = \(\) => \([\s\S]*?<\/>\n  \);/, '');
  writeFile(file, c);
}

// 5. Warehouses.tsx
{
  const file = 'src/pages/Warehouses.tsx';
  let c = readFile(file);
  // Remove unused Skeletons component
  c = c.replace(/const Skeletons = \(\) => \([\s\S]*?<\/>\n  \);/, '');
  writeFile(file, c);
}

console.log('Fixed final remaining issues');
