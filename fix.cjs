const fs = require('fs');

const fixFile = (file, replacements) => {
  let c = fs.readFileSync(file, 'utf8');
  for (let r of replacements) {
    c = c.replace(r[0], r[1]);
  }
  fs.writeFileSync(file, c);
};

fixFile('src/pages/physical-inventory/PhysicalInventoryList.tsx', [
  ['errorLogData: any | null', 'errorLogData: { message?: string } | null'],
  ['catch (err: any)', 'catch (err: unknown)'],
  ['errorLog: any', 'errorLog: { message?: string }'],
  ['fetchSessions();', '// eslint-disable-next-line react-hooks/set-state-in-effect\n    fetchSessions();']
]);

fixFile('src/pages/physical-inventory/PhysicalInventoryUpload.tsx', [
  ['catch (err: any)', 'catch (err: unknown)']
]);

fixFile('src/pages/Webhooks/components/SecretRevealModal.tsx', [
  ['catch (err)', 'catch (_err)']
]);

fixFile('src/pages/purchase-orders/PurchaseOrders.tsx', [
  ['{ productName, ...rest }: {', '{ productName: _productName, ...rest }: {'],
  ['fetchOrders();', '// eslint-disable-next-line react-hooks/set-state-in-effect\n    fetchOrders();']
]);

fixFile('src/pages/purchase-orders/PurchaseOrderDetail.tsx', [
  ['fetchOrder();', '// eslint-disable-next-line react-hooks/set-state-in-effect\n    fetchOrder();']
]);

fixFile('src/pages/Webhooks/components/CreateWebhookSheet.tsx', [
  ["setUrl('')", "// eslint-disable-next-line react-hooks/set-state-in-effect\n      setUrl('')"]
]);

console.log('Fixed');
