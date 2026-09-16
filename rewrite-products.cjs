const fs = require('fs');

const file = 'src/pages/Products.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  "import { useState, useEffect } from 'react';",
  "import { useState, useEffect } from 'react';\nimport axios from 'axios';"
);

// fix any at fetchProducts
c = c.replace(
  `    } catch (error: any) {`,
  `    } catch (error: unknown) {`
);

// fix any at deactivate
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

// Skeletons replace
const skeletonsDef = `  const Skeletons = () => (
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

c = c.replace(skeletonsDef, '');

const skeletonsCall = `                  <Skeletons />`;
c = c.replace(skeletonsCall, `                  <ProductSkeletons />`);

// inject ProductSkeletons at top
c = c.replace(
  `export default function Products() {`,
  `function ProductSkeletons() {
  return (
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
  );
}

export default function Products() {`
);

fs.writeFileSync(file, c, 'utf8');
console.log('Products fixed');
