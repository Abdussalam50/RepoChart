export async function openSystemPdfExport(
  reportId,
  getPreviewToken,
  { watermark = false, targetWindow = null } = {}
) {
  const printWindow = targetWindow || window.open('', '_blank');

  if (!printWindow) {
    throw new Error('Popup diblokir browser. Izinkan popup untuk membuka dialog cetak.');
  }

  const tokenResponse = await getPreviewToken(reportId);
  const token = tokenResponse?.token;
  const shouldWatermark = tokenResponse?.watermark ?? watermark;

  if (!token) {
    printWindow.close();
    throw new Error('Token preview tidak tersedia.');
  }

  const params = new URLSearchParams({
    token,
    autoprint: '1',
  });

  if (shouldWatermark) {
    params.set('watermark', '1');
  }

  printWindow.location.href = `/report-preview/${reportId}?${params.toString()}`;
}
