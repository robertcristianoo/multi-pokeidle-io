(async () => {
  const $ = (id) => document.getElementById(id);
  $('qr').alt = t('cafe.qrAlt');
  const d = await window.cafe.get();
  if (!d) return;
  $('chave').textContent = d.chave;
  // QR do "copia e cola" (nível de correção M); desenhado como imagem (data URL), sem HTML dinâmico
  const qr = qrcode(0, 'M');
  qr.addData(d.payload);
  qr.make();
  $('qr').src = qr.createDataURL(6, 0);
  let timer;
  const avisa = (txt) => { $('ok').textContent = txt; clearTimeout(timer); timer = setTimeout(() => { $('ok').textContent = ''; }, 2500); };
  $('cp-chave').addEventListener('click', async () => avisa((await window.cafe.copy('chave')) ? t('cafe.keyCopied') : t('cafe.copyFail')));
  $('cp-copia').addEventListener('click', async () => avisa((await window.cafe.copy('payload')) ? t('cafe.pasteCopied') : t('cafe.copyFail')));
  $('fechar').addEventListener('click', () => window.cafe.close());
})();
