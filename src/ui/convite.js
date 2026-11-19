(async () => {
  const $ = (id) => document.getElementById(id);
  const d = await window.convite.get();
  if (!d) return;
  $('link').textContent = d.link;
  let t;
  const avisa = (txt) => { $('ok').textContent = txt; clearTimeout(t); t = setTimeout(() => { $('ok').textContent = ''; }, 2500); };
  $('copiar').addEventListener('click', async () => avisa((await window.convite.copy()) ? 'Link copiado!' : 'Não consegui copiar.'));
  $('abrir').addEventListener('click', () => window.convite.open());
  $('fechar').addEventListener('click', () => window.convite.close());
})();
