const fs = require('fs');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ✓ ${filePath}`);
}

// 1. Batches.tsx
{
  const file = 'src/pages/Batches.tsx';
  let c = readFile(file);
  // move useEffect below fetchBatches
  const useEffectBlock = `  useEffect(() => {
    fetchBatches(); // eslint-disable-line react-hooks/set-state-in-effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);`;
  c = c.replace(useEffectBlock, '');
  const fetchBatchesBlock = `  const fetchBatches = async () => {`;
  c = c.replace(fetchBatchesBlock, `${useEffectBlock}\n\n  const fetchBatches = async () => {`);
  writeFile(file, c);
}

// 2. Dashboard.tsx
{
  const file = 'src/pages/Dashboard.tsx';
  let c = readFile(file);
  c = c.replace('} catch (error) {', '} catch (error: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars');
  writeFile(file, c);
}

// 3. Suppliers.tsx
{
  const file = 'src/pages/Suppliers.tsx';
  let c = readFile(file);
  c = c.replace('} catch (_error: unknown) {', '} catch (_error: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars');
  writeFile(file, c);
}

// 4. Products.tsx
{
  const file = 'src/pages/Products.tsx';
  let c = readFile(file);
  // Add axios
  if (!c.includes("import axios")) {
    c = c.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport axios from 'axios';");
  }
  
  // Fix error: any
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

  // Remove Skeletons
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
