# Política de segurança

## Versões com suporte

Só a **última versão** publicada em [Releases](https://github.com/robertcristianoo/multi-pokeidle-io/releases/latest) recebe correções de segurança.

## Como reportar uma vulnerabilidade

**Não abra uma issue pública.** Use o relato privado do GitHub:

1. Abra a aba [Security](https://github.com/robertcristianoo/multi-pokeidle-io/security) do repositório.
2. Clique em **Report a vulnerability**.

Descreva o que acontece, como reproduzir e qual o impacto. É um projeto pessoal e mantido sem prazo garantido, mas vou responder assim que possível e dar o crédito a quem reportar, se quiser.

## Escopo

Vale para o código deste repositório (o app Electron). Vulnerabilidades no **site ou no servidor do PokeIdle** não são daqui: reporte ao próprio jogo.

## O que o app faz com seus dados

- Cada conta usa uma sessão isolada, salva só no seu computador (`%APPDATA%\multi-pokeidle-io`).
- O app não envia dados a terceiros e não coleta telemetria.
- Os executáveis publicados **não são assinados**. Baixe só pela página oficial de Releases deste repositório.
