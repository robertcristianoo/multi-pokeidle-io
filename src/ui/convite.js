(async () => {
  const $ = (id) => document.getElementById(id);
  const d = await window.convite.get();
  if (!d) return;
  $('link').textContent = d.link;
  let timer;
  const avisa = (txt) => { $('ok').textContent = txt; clearTimeout(timer); timer = setTimeout(() => { $('ok').textContent = ''; }, 2500); };
  $('copiar').addEventListener('click', async () => avisa((await window.convite.copy()) ? t('convite.copied') : t('convite.copyFail')));
  $('abrir').addEventListener('click', () => window.convite.open());
  $('fechar').addEventListener('click', () => window.convite.close());
})();
