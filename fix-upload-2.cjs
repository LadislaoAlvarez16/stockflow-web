const fs = require('fs');

const file = 'src/pages/physical-inventory/PhysicalInventoryUpload.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace('} catch (err: any) {', '} catch (err: unknown) {\n      if (axios.isAxiosError(err)) {');
c = c.replace('} finally {', '  }\n    } finally {');
c = c.replace(
  "import React, { useState, useEffect } from 'react';",
  "import axios from 'axios';\nimport React, { useState, useEffect } from 'react';"
);

fs.writeFileSync(file, c, 'utf8');
console.log('Fixed upload');
