const fs = require('fs');

const file = 'src/pages/physical-inventory/PhysicalInventoryUpload.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  "import React, { useState, useEffect } from 'react';",
  "import axios from 'axios';\nimport React, { useState, useEffect } from 'react';"
);

c = c.replace(
  `} catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error al subir inventario",
        description: err.response?.data?.message || err.message,
      });
    }`,
  `} catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast({
          variant: "destructive",
          title: "Error al subir inventario",
          description: err.response?.data?.message || err.message,
        });
      }
    }`
);

fs.writeFileSync(file, c, 'utf8');
console.log('Fixed upload');
