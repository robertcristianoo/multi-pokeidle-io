// rotom.sniper - Background Service Worker (Manifest V3)
// Abre o Cockpit do Auto-Snipe em uma janela independente e espaçosa ao clicar no ícone

async function openCockpitWindow() {
  const cockpitUrl = chrome.runtime.getURL('cockpit.html');

  try {
    const allWindows = await chrome.windows.getAll({ populate: true });
    for (const win of allWindows) {
      if (win.tabs) {
        for (const tab of win.tabs) {
          if (tab.url && tab.url.includes('cockpit.html')) {
            await chrome.windows.update(win.id, { focused: true });
            await chrome.tabs.update(tab.id, { active: true });
            return;
          }
        }
      }
    }

    // Se ainda não estiver aberto, cria uma nova janela popup espaçosa
    await chrome.windows.create({
      url: cockpitUrl,
      type: 'popup',
      width: 1160,
      height: 760,
      focused: true
    });
  } catch (err) {
    console.error('[rotom.sniper]: Erro ao abrir janela do cockpit:', err);
    // Fallback: abrir em uma aba
    chrome.tabs.create({ url: cockpitUrl });
  }
}

chrome.action.onClicked.addListener(openCockpitWindow);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.action === 'OPEN_COCKPIT') {
    openCockpitWindow();
    sendResponse({ ok: true });
    return true;
  }
});

