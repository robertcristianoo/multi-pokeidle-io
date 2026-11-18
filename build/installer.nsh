; Grava o idioma escolhido no instalador (en, pt-BR ou es) ao lado do executável. Na primeira execução o app
; lê install-lang.txt como idioma inicial (config.json, quando existir, tem prioridade). $LANGUAGE é o LCID.
!macro customInstall
  ${If} $LANGUAGE == 1046
    StrCpy $0 "pt-BR"
  ${ElseIf} $LANGUAGE == 3082
    StrCpy $0 "es"
  ${Else}
    StrCpy $0 "en"
  ${EndIf}
  FileOpen $1 "$INSTDIR\install-lang.txt" w
  FileWrite $1 "$0"
  FileClose $1
!macroend
