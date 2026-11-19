# PokeIdle Multi

**App de desktop para Windows (Electron) que abre várias contas do [PokeIdle.io](https://pokeidle.io) em uma única janela**, em grade de 2 ou 4 quadrantes, cada uma com sua própria sessão (cookies, login e dados locais isolados, sem compartilhamento entre contas).

**Palavras-chave:** PokeIdle.io · pokeidle.io · multi-conta · várias contas · Electron · Windows · jogo idle · Pokémon · app de desktop · projeto de fã.

> Feito **só para o [PokeIdle.io](https://pokeidle.io)**. Não serve para outros jogos de nome parecido, como o PokeIdle World.

**In English:** *PokeIdle Multi is an unofficial, open-source Windows desktop app (Electron) that runs several [PokeIdle.io](https://pokeidle.io) accounts side by side in a single window, each one with a fully isolated session. It is made only for PokeIdle.io, not for similarly named games such as PokeIdle World. Download the installer or the portable build from the [Releases](https://github.com/robertcristianoo/multi-pokeidle-io/releases/latest) page.*

> Projeto de fã, **não oficial** e sem afiliação com o PokeIdle, Nintendo, Game Freak, Creatures ou The Pokémon Company. O app só embute o site oficial e não modifica o jogo. Ele **lê** o bônus das lives que o próprio jogo informa e, só se você ligar, **compra** no Mercado do NPC para repor o estoque da conta (veja a seção Auto-reposição, abaixo).

## Download

Baixe a última versão na página de [Releases](https://github.com/robertcristianoo/multi-pokeidle-io/releases/latest) (Windows x64):

- `multi-pokeidle-io-Setup-<versão>.exe`: instalador (instala para o seu usuário e cria atalho).
- `multi-pokeidle-io-Portable-<versão>.exe`: versão portátil, roda sem instalar.

Os executáveis não são assinados, então o Windows SmartScreen pode avisar na primeira execução ("Mais informações" → "Executar assim mesmo"). Para rodar a partir do código-fonte, veja abaixo.

## Requisitos

- Windows 10/11 (testado no Windows 11; Electron também roda em macOS/Linux, mas não foi testado)
- [Node.js LTS](https://nodejs.org), versão 22.12 ou mais nova (inclui o npm)
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
| `Ctrl+T` | Abre a configuração das lives (o mesmo que o botão **Lives** da barra superior) |
| `Ctrl+U` | Liga/desliga o modo ULTRA do jogo em todas as contas (o botão **⚡ ULTRA** da barra superior faz o mesmo) |
| `Ctrl+L` | Mostra/esconde a janela de logs (console, rede e erros de carregamento) |
| `Ctrl+M` | Mostra/esconde a barra de RAM do rodapé |
| `F11` | Tela cheia liga/desliga |
| `F1` | Mostra/esconde a ajuda |

Os números se referem à **posição** na grade (esquerda→direita, cima→baixo), não ao número da conta. Os atalhos valem com o app em foco.

**Nome das contas.** Cada conta é identificada pelo **nome do jogador**, lido do próprio jogo ao carregar a conta e de tempos em tempos. O nome fica salvo no `config.json` da pasta de dados do app (chave `accountNames`, só nesta instalação e nunca enviado a lugar nenhum) e aparece já na abertura seguinte. Enquanto o nome não foi lido, a conta aparece como "Conta N", em que N é o número fixo da conta (o que define a sessão e o login). Se duas contas tiverem o mesmo nome, o rótulo ganha o número da conta ("Nome (conta 2)"). A posição na grade aparece só como informação adicional.

## Modo ULTRA

O botão **⚡ ULTRA** da barra superior (ou `Ctrl+U`) liga o **Modo ULTRA Economia** que o próprio jogo oferece, em todas as contas de uma vez: a tela do jogo vira uma caixa pequena de XP/Gold/drops e a caçada continua. O botão fica azul quando está ligado.

- O app só usa os controles do jogo (Configurações → interruptor do ULTRA, e "Voltar ao jogo" para sair); não altera nada por conta própria.
- A escolha fica salva (`config.json`). Ligada, ela volta sozinha a cada vez que uma conta recarrega ou entra no jogo (inclusive depois da tela de login).
- Desligar pelo botão também desmarca a escolha salva no jogo, para que a conta não volte ao ULTRA ao recarregar.

## Barras de botões e avisos

Cada conta tem uma barra de botões no topo do próprio quadrante (liga/desliga só daquela conta, **Lives**, **Pontos ▾**, mais o **Foco**, que fica azul quando a conta está em foco e, nesse modo, ganha os botões **<** e **>** para passar para a conta anterior ou seguinte; o **<** fica desativado na primeira posição e o **>** na última), e há uma barra do app no topo da janela (**?** Ajuda (F1) à esquerda e, à direita, o ícone de divisão de tela que alterna entre 2 e 4 contas, **☕ Cafézin**, **⚡ ULTRA**, **Lives ▾** (com os Pontos dentro) e, por último, **⚙ Configurações**). Cada funcionalidade extra que o app carrega aparece como um botão sozinha. O botão **⚙ Configurações** abre uma janela (modal) que reúne as opções do app: animações reduzidas, vigia de captura, resgate automático, log de resgates, os logs do app e a licença desta máquina. Em **Animações**, dá para ligar/desligar as animações reduzidas do jogo em todas as contas (ligado por padrão): é o mesmo pedido de "menos movimento" que o navegador faz com `prefers-reduced-motion`, o que diminui o uso de CPU sem mudar o que está escrito na tela. Os avisos (`src/toasts.js`) são pequenos, ficam no canto superior direito e somem em até 5 s.

### Barra de RAM

Uma faixa fina no rodapé da janela mostra a memória que o app está usando: o **total** e, separados, o **app/outros** (processo principal, GPU e as próprias barras) e **cada conta** (o processo da página do jogo). Os valores são a memória de trabalho (RAM física ocupada) de cada processo do Electron, atualizados a cada 5 s. Quando o total ou uma conta passam de um limite, o número fica laranja (aviso) ou vermelho (alto). Os limites estão em `src/ram.js`.

- `Ctrl+M` mostra/esconde a barra; a escolha fica salva em `config.json` (`"ramBar": false` oculta).
- Com a barra escondida, nada é medido nem criado: ela só ocupa recursos enquanto está visível.
- A soma dos processos pode contar um mesmo trecho de memória mais de uma vez, então o total é uma estimativa, não o número exato do Gerenciador de Tarefas.

A lógica está em `src/ram.js` (e `src/ui/ram.html`, `src/preload/ram.js`).

### Ligar e desligar uma conta

O botão **⏻** da barra de cada conta liga ou desliga só aquela conta:

- **Desligar** destrói o jogo da conta, então ela deixa de gastar CPU e memória. No lugar do quadrante aparece a página "Conta N desligada" (com o nome, se já lido), com o botão **Ligar conta**. O rótulo da barra mostra "Conta N · desligada".
- **Ligar** recria o jogo e recarrega a página. A sessão (login e dados) fica na partição `persist:contaN`, então o login volta sem precisar entrar de novo.
- O estado fica em `config.json` (chave `offAccounts`, lista de posições 1 a 4 desligadas) e vale na próxima abertura do app: a conta continua desligada até você ligar.
- Enquanto a conta está ligada, a barra mostra há quantos minutos ela está rodando ("Conta N · 12 min"; a dica do rótulo diz "rodando há 12 min").
- Contas desligadas continuam na grade, na ordem e com os atalhos de foco (`Ctrl+1…4`, `Ctrl+Alt+←/→`); em foco, a página de desligada ocupa a janela. `F5` e `Ctrl+Shift+F5` ignoram as contas desligadas.

## Testes

`npm test` roda a checagem de sintaxe e os testes do Electron (`test/`), com a janela escondida e uma pasta de dados temporária (nunca toca nas suas sessões). Ele roda sozinho antes de `npm run dist` e `npm run dist:release`, e a compilação é bloqueada se algo falhar.

## Extensões do Chromium

O app carrega, em cada conta, duas extensões da Chrome Web Store (a pasta `extensions/`): o **Rotom Sniper**
(compra anúncios do mercado dentro das regras; o botão **Sniper** da conta, ou Ctrl+Alt+S, abre o cockpit dela) e o
**/hunt for PokeIdle** (mostra acima do pokémon em campo onde caçar, por XP/h e ouro/h). Ambas só atuam em
`pokeidle.io`. Cada uma pode ser ligada ou desligada **por conta** em **⚙ Configurações › Extensões por conta**
(tudo ligado de fábrica); a página da conta recarrega para a mudança valer. As regras do sniper também são por conta.

Com a /hunt ligada, as artes dos pokémon (mercado, coleção etc.) ganham um atalho pequeno, uma espada com `?`: ele abre
o painel "Onde caçar?" para aquele pokémon, não só para o que está em campo. O jogo não informa à extensão de quem é cada
card, então o app serve o `app.js` de `pokeidle.io` com um trecho a mais que anota o pokémon em cada arte
(`src/game-patch.js`, pelo protocolo do DevTools; só esse arquivo é tocado e nada é enviado). Se o jogo mudar e o ponto de
encaixe sumir, o `app.js` original segue sem alteração, um aviso vai para o log e o atalho não aparece. O atalho só
funciona quando o jogo traz os atributos do pokémon do card (se faltarem, o painel avisa).

## Lives de bônus (Twitch e Kick)

O jogo dá XP extra a quem assiste lives dos canais parceiros. Cada conta tem o seu botão **Lives** na própria barra, com um menu só para ela:

- **Lives**: marca a conta vinculada à sua Twitch/Kick (normalmente a main), que passa a manter as lives abertas. O bônus só vale para a conta do jogo vinculada à Twitch/Kick logada. As outras contas não são afetadas.
- **Entrar › Twitch / Kick** e **Sair › Twitch / Kick**: login e logout só desta conta (os cookies ficam na sessão dela).
- **Twitch (n no ar)** / **Kick (n no ar)**: fechar ou reabrir as lives desta conta.
- **Detalhes** e **Registro**.

O botão **Lives** da barra superior (ou `Ctrl+T`) abre a **configuração** das lives de todas as contas. A cor do botão mostra o estado: cinza (desligadas nesta conta), verde (ligadas e em dia), azul (falta entrar na Twitch/Kick) e vermelho piscando (resgate parado).

As lives são **leves**: o app abre os primeiros da lista de canais que estiverem no ar (até o número de vagas, 2 de fábrica por site) e assiste como um player, sem vídeo: na Twitch manda o aviso "minute-watched" e pede só o cabeçalho dos pedaços do vídeo; na Kick abre o websocket de espectador. Gasta quase nada de CPU e memória. Os avisos da Twitch (PubSub) chegam em tempo real: baú, pontos que entraram, raid e "momento". A página do canal só abre, escondida e muda, na hora de pegar o baú, resgatar, entrar numa raid ou pegar um momento, e fecha 1 min depois.

**Config das lives** tem a lista de canais de cada site em ordem de prioridade (o de cima tem prioridade). Cada canal pode ser reordenado arrastando-o ou pelos botões ▲ ▼, removido (✕) ou adicionado (nome ou endereço do canal); a ordem da lista é a que fica salva em `config.json`. O botão **Atualizar com a lista oficial do jogo** lê os canais oficiais que o próprio jogo já informa à conta (os mesmos das telas Bônus Twitch e Bônus na Kick, **no ar e offline**) e acrescenta no fim da lista os que faltam, sem mexer na ordem escolhida; a bolinha ao lado de cada canal mostra se está no ar. A lista só vem de uma conta ligada e vinculada à Twitch/Kick no jogo; sem ela, a janela avisa que o jogo ainda não informou os canais.

**Quais lives abrem.** O app só abre canais que estão **no ar**, na ordem da lista e até o número de vagas por conta. A conferência de quem está no ar roda a cada 1 min; quando uma live aberta cai, ela sai e o próximo canal da lista que está no ar e ainda não está aberto entra no lugar (com aviso na tela e linha no registro). Canal que a conferência não conseguiu verificar (sem resposta) continua aberto se já estava, mas nunca é aberto sem confirmação de que está no ar. A ordem de prioridade vale sempre: se um canal de cima volta ao ar, ele retoma a vaga.

Também na **Config das lives**: as vagas por site, o baú da Twitch (+50 a cada ~15 min) e, por conta: se mantém lives, o bônus resgatado na Kick e na Twitch e a **guarda do bônus**. O jogo informa o bônus das lives de cada conta; o app só lê esses dados do que o servidor do jogo já envia para a página e não envia nada de volta ao jogo.

## Voto no IdleHub

O jogo dá recompensa a quem vota no pokeidle pelo [IdleHub](https://idlehub.io). Cada conta tem um botão **🗳** na própria barra:

- **🗳 Votar**: o app ainda não sabe se a conta já votou (veja a limitação abaixo). Ao clicar, a janela de voto mostra o estado do site.
- **🗳 Votar** (verde): o último voto feito pelo app já liberou um novo voto. A barra do app mostra quais contas estão liberadas.
- **🗳 ✓ Votou · 2 h 05 min**: voto feito pelo app; mostra quanto falta para o próximo. Ao liberar, o app avisa na tela.

Ao clicar, abre uma janela com a página de voto do IdleHub, com o nick do personagem já preenchido. O captcha e o voto são concluídos por você nessa janela; o app não resolve captcha nem vota sozinho. O mesmo acontece com o "votar" de dentro do jogo.

**Limitação.** O IdleHub não oferece consulta pública do estado do voto que o app possa usar. Assim, o app só conhece os votos feitos por ele, pela resposta que o próprio site devolve ao enviar o voto (ou, se essa resposta não for lida, pela tela de voto registrado). Se a conta já votou fora do app, o botão continua em "Votar" até o site informar isso na janela. O horário de liberação vem do site; quando ele não é informado, o app usa 24 h após o voto e marca o horário como estimado. Esses horários ficam só no `config.json` deste computador.

O login do IdleHub é só com conta Google e fica salvo por conta, numa área separada da sessão do jogo. O app não consulta o IdleHub em segundo plano e não envia a ele nada além do que a própria página de voto envia.

**Login com Google.** O Google recusa login dentro de janelas de aplicativos ("Esse navegador ou app pode não ser seguro"). Ao escolher o Google na janela do IdleHub, o app oferece **entrar pelo navegador**: abre o Chrome (ou o Edge) instalado, com um perfil temporário, para você entrar normalmente e fechar a janela. Só os cookies do IdleHub são copiados para a conta (o Google e o resto do navegador ficam de fora), e o perfil temporário é apagado. Durante o login, o navegador fica com a porta de depuração aberta apenas em `127.0.0.1`. Não vote no navegador: o app só percebe os votos feitos na janela dele.

## Pontos da Twitch e da Kick

Cada conta tem o botão **Pontos ▾** na própria barra, com **Twitch**, **Kick** e **Todas as contas**. Twitch ou Kick abre um painel embaixo da janela com o chat das lives **dessa conta** que estão no ar, mostrando só o rodapé (o botão dos pontos e o popup de escolher o bônus), para você resgatar à mão. O painel sempre mostra o nome da conta no título, e nunca troca de conta sozinho.

- **Próxima live ▶** passa para a live seguinte da mesma conta; **Página completa** mostra a página toda; **Entrar** e **Sair** valem só para essa conta; a borda superior do painel muda a altura (o app guarda).
- **Pontos** (barra superior) abre a janela **Pontos das contas**: uma linha por conta, lado a lado, com o login de Twitch e Kick, o bônus escolhido, as lives no ar com o saldo e o último resgate. Os botões de cada linha agem só na conta da linha (Entrar/Sair e Pontos). Quando aberta pela barra de uma conta, a janela já destaca essa conta.
- O login da Twitch e da Kick fica na sessão da própria conta do jogo (a mesma de **Lives** › **Entrar**).
- As páginas só existem enquanto o painel está aberto; fechar o painel libera a memória.

### Resgate automático (opcional, desligado de fábrica)

Em **Lives** (barra superior, ou `Ctrl+T`), **Config das lives** (ou **Configurações › Resgate automático**), escolha por conta e por site **um ou mais** bônus que podem ser resgatados com os pontos do canal: **+15% XP** (300 pontos), **Captura** (500) ou **Shiny** (1.000). Cada coluna de resgate tem um seletor com uma caixa por bônus; a ordem dos marcados (▲ ▼ no seletor) é a prioridade, e nenhum marcado equivale a **Não resgatar**. Com a configuração salva, o app confere o saldo de cada live aberta (a cada 5 min na Kick e 2 min na Twitch), resgata 1 bônus por canal quando houver saldo (as horas acumulam) e, se o site recusar, tenta de novo no mesmo canal depois de 30 min.

- **Com vários bônus marcados, o resgate é um combo "tudo ou nada"**: cada conferência (Kick a cada 5 min, Twitch a cada 2 min) tenta uma **rodada** = 1 resgate de **cada** bônus marcado, na ordem da lista. A rodada só acontece se o saldo dos canais cobre o combo inteiro; se faltar pontos para qualquer um, não resgata nada e espera acumulando até caber.
- **Canais diferentes**: cada bônus pode ir para um canal diferente, e os custos que caem no **mesmo canal somam** (o saldo do canal tem de cobrir a soma). A atribuição é determinística: cada bônus vai para o primeiro canal da lista de canais da config (na ordem das lives abertas) que o oferece, não pausado, e ainda cobre o que sobrou; se um bônus não couber, o app volta atrás e tenta outro canal para o bônus anterior. Se nenhuma atribuição existir, nada é resgatado nessa conferência. O registro avisa a espera (uma vez, quando muda) e mostra cada bônus resgatado.
- Com um bônus só na lista, cada canal com saldo resgata o seu, como antes. Num combo, se um resgate da rodada for recusado pelo site, os seguintes ficam para a próxima conferência (sem desfazer o que já passou).
- Configurações salvas antes, com um bônus só, continuam valendo como lista de um item.
- Cada bônus existe em 4 durações (1, 3, 5 e 10 h): o app resgata o **mais barato liberado** (o de 1 h; se estiver pausado, esgotado ou em espera no canal, o de 3, 5 ou 10 h).
- Para a conta e o site quando os pontos voltam logo após um resgate (site não vinculado no jogo). Salvar a configuração de novo volta a resgatar. Saldo que cai sem resgate do app só vai para o registro.
- **Baú de bônus da Twitch** (ligado de fábrica): pega sozinho o baú que aparece nos canais abertos.
- **Guarda do bônus** (ligada de fábrica): quando o bônus escolhido da conta num site vence em menos de 30 min (ou venceu), o app procura nos canais da lista e nos oficiais do jogo, fora das lives abertas (offline primeiro), um com pontos e resgata 1 ali; depois confere no jogo se o tempo subiu.
- Quando a Twitch desafia um pedido com a checagem anti-robô, o app pede o token de integridade de dentro da página do canal, como o próprio site faz, e reenvia o pedido.
- Use por sua conta e risco e conforme os termos da Twitch e da Kick: automatizar o resgate de pontos pode violar as regras dos sites.

### Log de resgates

**Registro** (menu **Lives** de cada conta, ou **Configurações › Log de resgates**) mostra cada resgate, recusa e parada, com hora, conta, site e canal, do mais recente para o mais antigo. O registro fica em `%APPDATA%\multi-pokeidle-io\resgates.log` (últimas 2.000 linhas).
## Auto-reposição (🛒)

Opcional e **desligada por padrão**. Em cada conta, o botão **🛒** da barra liga e desliga a reposição (fica verde quando ela está ligada e a conta conectada ao jogo); o **⚙** ao lado abre a janela com o estoque, o ouro, as regras e o registro das compras.

Quando o estoque de um item cai abaixo de **Repor abaixo de**, o app compra no Mercado do NPC do próprio jogo até chegar em **Manter até**:

- **Pokébolas:** o tipo é escolhível (padrão: Ultra Ball).
- **Revives:** contados juntos; compra sempre o mais barato.
- **Poções:** contadas juntas. O padrão é a Golden Potion (2.500 de ouro, cura 50% do HP máximo), mas dá para escolher outra poção ou a de **melhor custo-benefício** (menor ouro por HP efetivamente curado no pokémon ativo).
- **Ouro mínimo:** nunca compra a ponto de o ouro ficar abaixo desse valor. Se o ouro não alcança o item prioritário, a ordem é poções, depois revives, depois bolas: os de menor prioridade só são comprados quando o item prioritário está em dia.

Limites de segurança fixos: no máximo 9.999 unidades por pedido; uma compra a cada 4 s por conta; se o jogo recusar um pedido, o app espera 30 s; depois de 3 falhas seguidas, pausa por 2 min. O pedido é o mesmo do botão **Comprar** do jogo.

> **Atenção:** a reposição **gasta ouro real do jogo**. Confira as regras antes de ligar, e use por sua conta e risco. Os [termos do PokeIdle](https://pokeidle.io/termos) permitem automações (seção 5, "Automação") desde que sigam as mesmas regras de quem joga na mão, não explorem falhas, não burlem limites do jogo e não sobrecarreguem o servidor. Quem publica este projeto não se responsabiliza por perdas de ouro ou por penalidades aplicadas pelo jogo.

## Vigia de captura

Liga/desliga em **⚙ Configurações** (ligado por padrão):

- **Vigia**: se uma conta fica cerca de 45 s sem capturar com Ultra ou Beast Ball, havendo alvo na lista, mostra um aviso vermelho na tela dela e toca um som (o som sai mesmo com a conta silenciada). O aviso some quando ela volta a capturar; enquanto persistir, o som se repete a cada 60 s.

O vigia só lê o que o próprio jogo já manda pelo socket (os eventos de arremesso e de selvagem caído). Nada é enviado ao servidor.

**☕ Café.** O botão **☕ Cafézin** da barra abre uma janela com o QR Code e o "copia e cola" de um PIX para quem quiser apoiar o projeto. É opcional, não há cobrança automática e nada é enviado pela janela.

**💬 Discord por conta.** O botão **💬 Discord** da barra de cada conta abre o convite numa sessão de Discord própria daquela conta (login e servidor separados por conta) e mostra o estado: entrar, falta a tag ou ✓ IDLE. O app só lê o que o próprio Discord web recebe (perfil e convite) e o endereço da página; nunca lê nem usa o token da sessão. Se não vir a tag, o selo fica como "logado" (não confirmado): clique no seu avatar no Discord para ele conferir. O link vale 1 dia: a cada Release o workflow grava nele o valor da variável de repositório `DISCORD_INVITE_URL` (Settings → Secrets and variables → Actions → Variables); sem ela, vale o link padrão do app.

## Licença e módulos adicionais

O app tem ativação de licença por máquina em **⚙ Configurações › Licença**: mostra o ID desta máquina, aceita uma chave e permite removê-la. A verificação é **offline** (a chave é conferida com uma assinatura digital, sem rede) e o app não envia nenhuma telemetria. Sem licença, nada muda no uso do app.

O app pode carregar módulos opcionais que **não fazem parte do código-fonte público**: eles ficam numa pasta que o repositório ignora e só entram no app local de quem os tem. Quem compila este repositório recebe o app completo deste README; os módulos adicionais não estão descritos aqui.

## Como funciona

- Janela principal: `BaseWindow` do Electron com uma `WebContentsView` por conta.
- Isolamento: cada conta usa uma partição própria (`persist:conta1` … `persist:conta4`), com cookies e `localStorage` separados e salvos em disco.
- `backgroundThrottling` desligado para o jogo não pausar nos quadrantes sem foco.
- Animações reduzidas (`src/reduce-motion.js`): a preferência `reduceMotion` do `config.json` (padrão ligada) faz cada conta receber `prefers-reduced-motion: reduce` por emulação do DevTools (sem CSS injetado), reaplicada a cada carga e alterada na hora por **Configurações › Animações**. Só reduz o que o próprio site trata como movimento; animações feitas em canvas ou por script continuam.
- O User-Agent não inclui "Electron", porque sites com captcha costumam recusar isso.
- Preferências (número de contas, 2 ou 4, e ordem da grade; a última escolha é lembrada, inclusive se a barra de RAM está oculta) ficam em `config.json` e `order.json`, na pasta de dados do app (`%APPDATA%\multi-pokeidle-io`).
- Preferências (número de contas, 2 ou 4, e ordem da grade; a última escolha é lembrada) ficam em `config.json` e `order.json`, na pasta de dados do app (`%APPDATA%\multi-pokeidle-io`). A configuração da auto-reposição fica em `restock.json`, na mesma pasta.
- Nenhum dado do jogo é enviado a terceiros pelo app. A janela de logs mostra só método, status e URL das requisições, nunca o corpo (portanto sem senhas).

## Gerar os executáveis

```bash
npm run dist:release
```

Gera o instalador e o portátil em `dist-release/` (configuração em [`electron-builder.release.json`](electron-builder.release.json)). Na prática quem faz isso é o workflow de Release (veja abaixo); rodar na mão só serve para testar o pacote.

## Versões e atualizações

Cada PR que entra na `main` pode gerar uma versão nova automaticamente (workflow [`release.yml`](.github/workflows/release.yml)): o workflow cria a tag `vX.Y.Z`, roda os testes, gera o instalador e o portátil e publica o Release com as notas automáticas.

Quem decide o tipo da versão é o **título do PR** (no estilo `tipo: texto`) ou um **rótulo**:

| Título / rótulo do PR | Versão |
|---|---|
| `feat: …` | minor (1.2.0 → 1.3.0) |
| `fix: …`, `perf: …`, `refactor: …` | patch (1.2.0 → 1.2.1) |
| `tipo!: …` ou `BREAKING CHANGE` no título | major (1.2.0 → 2.0.0) |
| `docs:`, `chore:`, `ci:`, `test:`, `style:`, `build:`, `revert:` | não lança versão |
| rótulo `release:major` / `release:minor` / `release:patch` | força aquele tipo |
| rótulo `release:skip` | não lança versão |

Também dá para lançar na mão em **Actions → Release → Run workflow**. As regras ficam em [`tools/release-plan.js`](tools/release-plan.js).

**Aviso de versão nova no app:** os pacotes de Release carregam a própria versão e, de tempos em tempos, o app consulta o último Release público do GitHub (`api.github.com`, sem login e sem enviar nada seu). Se existir uma versão mais nova, o botão **Atualizar → vX.Y.Z** pisca na barra superior e um aviso aparece uma vez; o clique abre a página do Release para baixar o instalador. O app não se atualiza sozinho. Builds locais e execução por `npm start` não consultam nada.

## Termos do jogo

Use contas e múltiplas sessões de acordo com os [termos do PokeIdle](https://pokeidle.io/terms).

**Aviso de responsabilidade:** o app é uma ferramenta gratuita, de código aberto e sem garantias. Todo o código está público neste repositório, para qualquer pessoa ler, auditar e conferir o que ele faz. O uso é por conta e risco de quem usa: quem publica o projeto **não se responsabiliza** por suspensões, bans ou outras penalidades aplicadas pelo jogo, seja por mau uso, por alterações que você faça no código ou por qualquer ação que viole os termos do PokeIdle. Cabe a cada pessoa conhecer e respeitar as regras do jogo.

## Licença

[MIT](LICENSE)
