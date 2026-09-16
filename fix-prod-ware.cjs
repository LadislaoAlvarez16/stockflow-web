const fs = require('fs');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ✓ ${filePath}`);
}

// 1. Products.tsx
{
  const file = 'src/pages/Products.tsx';
  let c = readFile(file);
  
  // Add axios if needed
  if (!c.includes("import axios")) {
    c = c.replace(
      "import { useState, useEffect } from 'react';",
      "import { useState, useEffect } from 'react';\nimport axios from 'axios';"
    );
  }

  // Fix error: any in catch block
  if (c.includes('catch (error: any) {')) {
    c = c.replace(
      `    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error de permisos o servidor',
        description: error.response?.data?.message || 'No se pudo desactivar el producto.',
      });
    }`,
      `    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast({
          variant: 'destructive',
          title: 'Error de permisos o servidor',
          description: error.response?.data?.message || 'No se pudo desactivar el producto.',
        });
      }
    }`
    );
  }

  // Remove Skeletons component correctly
  const skeletonsStr = `  const Skeletons = () => (
    <>
      {[1, 2, 3, 4, 5].map(i => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );`;
  c = c.replace(skeletonsStr, '');

  writeFile(file, c);
}

// 2. Warehouses.tsx
{
  const file = 'src/pages/Warehouses.tsx';
  let c = readFile(file);

  const skeletonsStr = `  const Skeletons = () => (
    <>
      {[1, 2, 3].map(i => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
          <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );`;
  c = c.replace(skeletonsStr, '');

  writeFile(file, c);
}

console.log('Fixed products and warehouses');
