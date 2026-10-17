# PokeIdle Multi

Abre **várias contas do [PokeIdle](https://pokeidle.io) em uma única janela**, em grade, cada uma com sua própria sessão (cookies, login e dados locais isolados, sem compartilhamento entre contas).

> Projeto de fã, **não oficial** e sem afiliação com o PokeIdle, Nintendo, Game Freak, Creatures ou The Pokémon Company. O app só embute o site oficial; não modifica o jogo nem automatiza ações. Ele apenas **lê** as lives que o próprio jogo informa, para o botão de lives (veja abaixo).

## Download

Baixe a última versão na página de [Releases](https://github.com/robertcristianoo/multi-pokeidle-io/releases/latest) (Windows x64):

- `multi-pokeidle-io-Setup-<versão>.exe`: instalador (instala para o seu usuário e cria atalho).
- `multi-pokeidle-io-Portable-<versão>.exe`: versão portátil, roda sem instalar.

Os executáveis não são assinados, então o Windows SmartScreen pode avisar na primeira execução ("Mais informações" → "Executar assim mesmo"). Para rodar a partir do código-fonte, veja abaixo.

## Requisitos

- Windows 10/11 (testado no Windows 11; Electron também roda em macOS/Linux, mas não foi testado)
- [Node.js LTS](https://nodejs.org) (inclui o npm)
- [Git](https://git-scm.com) (opcional, só para clonar)

## Instalação e execução

```bash
git clone https://github.com/<seu-usuario>/multi-pokeidle-io.git
cd multi-pokeidle-io
npm install
npm start
```

Sem Git: baixe o ZIP pelo botão **Code → Download ZIP**, extraia e rode `npm install` e `npm start` na pasta.

### Atalho na Área de Trabalho (Windows)

```powershell
$proj = (Get-Location).Path
$exe  = Join-Path $proj 'node_modules\electron\dist\electron.exe'
$s = (New-Object -ComObject WScript.Shell).CreateShortcut("$([Environment]::GetFolderPath('Desktop'))\PokeIdle Multi.lnk")
$s.TargetPath = $exe; $s.Arguments = "`"$proj`""; $s.WorkingDirectory = $proj; $s.IconLocation = "$exe,0"
$s.Save()
```

Rode dentro da pasta do projeto, depois do `npm install`. Se mover a pasta, refaça o atalho.

## Como usar

O app abre em tela cheia com **2 contas** lado a lado. Faça login uma vez em cada quadrante; a sessão fica salva em disco. Pressione **F1** a qualquer momento para ver os atalhos.

| Atalho | Ação |
|---|---|
| `Ctrl+1…4` | Foca a conta da posição (de novo = volta à grade) |
| `Ctrl+0` | Volta à grade |
| `Ctrl+Alt+←/→` | Move a conta atual uma posição na grade |
| `Ctrl+Shift+0` ou `Ctrl+Alt+Shift+0` | Alterna entre 2 e 4 contas |
| `Ctrl+Shift+1…4` | Reseta a sessão da conta da posição (pede confirmação) |
| `F5` | Recarrega a conta que está com o teclado |
| `Ctrl+F5` | Força a atualização (limpa o cache) da conta |
| `Ctrl+Shift+F5` | Força a atualização de todas as contas |
| `Ctrl+T` | Abre no navegador as lives que dão bônus de XP (Twitch com bônus + 2 da Kick); o botão **Lives** da barra superior faz o mesmo e avisa quando uma live abre ou fecha |
| `Ctrl+L` | Mostra/esconde a janela de logs (console, rede e erros de carregamento) |
| `F11` | Tela cheia liga/desliga |
| `F1` | Mostra/esconde a ajuda |

Os números se referem à **posição** na grade (esquerda→direita, cima→baixo), não ao número da conta. Os atalhos valem com o app em foco.

## Barras de botões e avisos

Cada conta tem uma barra de botões no topo do próprio quadrante (liga/desliga só daquela conta, mais o **Foco**), e há uma barra do app no topo da janela (Contas 2/4, Logs, Lives, Ajuda). Cada funcionalidade extra que o app carrega aparece como um botão sozinha. Os avisos (`toasts.js`) são pequenos, ficam no canto superior direito e somem em até 5 s.

## Testes

`npm test` roda a checagem de sintaxe e os testes do Electron (`test/`), com a janela escondida e uma pasta de dados temporária (nunca toca nas suas sessões). Ele roda sozinho antes de `npm run dist` e `npm run dist:release`, e a compilação é bloqueada se algo falhar.

## Lives de bônus (Twitch e Kick)

O jogo dá XP extra a quem assiste lives dos canais parceiros. O botão **Lives** da barra superior (ou `Ctrl+T`), abre no navegador padrão, com um clique:

- todas as lives da Twitch que dão bônus (as com "falta ativação" ficam de fora);
- até 2 lives da Kick (a Kick não conta mais que isso).

Depois do primeiro clique, se uma live abrir ou fechar, o botão fica vermelho e pisca, o Windows mostra uma notificação e o ícone pisca na barra de tarefas. Clicar de novo abre só as lives novas; as encerradas você fecha no navegador. Para o bônus valer, você precisa estar logado na Twitch/Kick nesse navegador, com a conta vinculada no jogo.

O app só lê os dados de lives que o servidor do jogo já envia para a página; não envia nada de volta.

## Como funciona

- Janela principal: `BaseWindow` do Electron com uma `WebContentsView` por conta.
- Isolamento: cada conta usa uma partição própria (`persist:conta1` … `persist:conta4`), com cookies e `localStorage` separados e salvos em disco.
- `backgroundThrottling` desligado para o jogo não pausar nos quadrantes sem foco.
- O User-Agent não inclui "Electron", porque sites com captcha costumam recusar isso.
- Preferências (número de contas, 2 ou 4, e ordem da grade; a última escolha é lembrada) ficam em `config.json` e `order.json`, na pasta de dados do app (`%APPDATA%\multi-pokeidle-io`).
- Nenhum dado do jogo é enviado a terceiros pelo app. A janela de logs mostra só método, status e URL das requisições, nunca o corpo (portanto sem senhas).

## Gerar os executáveis

```bash
npm run dist:release
```

Gera o instalador e o portátil em `dist-release/` (configuração em [`electron-builder.release.json`](electron-builder.release.json)). Arquivos `local.js` e `local-*.js` (extensões pessoais, ignoradas pelo git) nunca entram nesse pacote.

## Link de indicação

O app abre o jogo usando o link que contém o meu código de indicação. Para usar o seu, troque a constante `URL` no topo de [`main.js`](main.js).

## Termos do jogo

Use contas e múltiplas sessões de acordo com os [termos do PokeIdle](https://pokeidle.io/terms).

**Aviso de responsabilidade:** o app é uma ferramenta gratuita, de código aberto e sem garantias. Todo o código está público neste repositório, para qualquer pessoa ler, auditar e conferir o que ele faz. O uso é por conta e risco de quem usa: quem publica o projeto **não se responsabiliza** por suspensões, bans ou outras penalidades aplicadas pelo jogo, seja por mau uso, por alterações que você faça no código ou por qualquer ação que viole os termos do PokeIdle. Cabe a cada pessoa conhecer e respeitar as regras do jogo.

## Licença

[MIT](LICENSE)
