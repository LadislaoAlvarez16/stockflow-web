const fs = require('fs');

const file = 'src/pages/physical-inventory/PhysicalInventoryUpload.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  "import React, { useState, useEffect } from 'react';",
  "import axios from 'axios';\nimport React, { useState, useEffect } from 'react';"
);

const lines = c.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('catch (err: any) {')) {
    lines[i] = lines[i].replace('catch (err: any) {', 'catch (err: unknown) {\n      if (axios.isAxiosError(err)) {');
    // find next finally
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].includes('} finally {')) {
        lines[j] = lines[j].replace('} finally {', '      }\n    } finally {');
        break;
      }
    }
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Fixed upload');
