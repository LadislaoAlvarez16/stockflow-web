const fs = require('fs');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ✓ ${filePath}`);
}

{
  const file = 'src/pages/physical-inventory/PhysicalInventoryUpload.tsx';
  let c = readFile(file);

  // Add axios import
  if (!c.includes("import axios")) {
    c = c.replace(
      "import React, { useState, useEffect } from 'react';",
      "import axios from 'axios';\nimport React, { useState, useEffect } from 'react';"
    );
  }

  // Fix err: any -> err: unknown + axios.isAxiosError
  const target = `    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error al subir inventario",
        description: err.response?.data?.message || err.message,
      });
    }`;
  
  const replacement = `    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast({
          variant: "destructive",
          title: "Error al subir inventario",
          description: err.response?.data?.message || err.message,
        });
      }
    }`;

  if (c.includes(target)) {
    c = c.replace(target, replacement);
  } else {
    console.log("Could not find the target block to replace");
  }

  writeFile(file, c);
}
