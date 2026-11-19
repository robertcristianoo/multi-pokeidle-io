(async () => {
  const $ = (id) => document.getElementById(id);
  const d = await window.cafe.get();
  if (!d) return;
  $('chave').textContent = d.chave;
  // QR do "copia e cola" (nível de correção M); desenhado como imagem (data URL), sem HTML dinâmico
  const qr = qrcode(0, 'M');
  qr.addData(d.payload);
  qr.make();
  $('qr').src = qr.createDataURL(6, 0);
  let t;
  const avisa = (txt) => { $('ok').textContent = txt; clearTimeout(t); t = setTimeout(() => { $('ok').textContent = ''; }, 2500); };
  $('cp-chave').addEventListener('click', async () => avisa((await window.cafe.copy('chave')) ? 'Chave copiada!' : 'Não consegui copiar.'));
  $('cp-copia').addEventListener('click', async () => avisa((await window.cafe.copy('payload')) ? 'Copia e cola copiado!' : 'Não consegui copiar.'));
  $('fechar').addEventListener('click', () => window.cafe.close());
})();
