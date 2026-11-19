// BR Code estático do PIX ("copia e cola" e QR): o payload EMV com a chave e o CRC16. Sem valor fixo: quem paga digita
// quanto quer. Referência: Manual do BR Code do Banco Central (campos 00, 01, 26, 52, 53, 58, 59, 60, 62 e 63).

// CRC16-CCITT (polinômio 0x1021, início 0xFFFF), em 4 dígitos hexadecimais maiúsculos
function crc16(texto) {
  let crc = 0xffff;
  for (const b of Buffer.from(texto, 'utf8')) {
    crc ^= b << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

const campo = (id, valor) => `${id}${String(valor.length).padStart(2, '0')}${valor}`;
// o BR Code aceita só ASCII sem acento nos textos livres
const ascii = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\x7e]/g, '');

// chave: e-mail, telefone, CPF/CNPJ ou chave aleatória (UUID). nome <= 25 e cidade <= 15 caracteres.
function brCode({ chave, nome = 'PokeIdle Multi', cidade = 'BRASIL', txid = '***' }) {
  const k = String(chave ?? '').trim();
  if (!k || k.length > 77) throw new Error('chave PIX inválida');
  const conta = campo('00', 'br.gov.bcb.pix') + campo('01', k);
  const base = campo('00', '01') + campo('01', '11') + campo('26', conta) + campo('52', '0000') + campo('53', '986')
    + campo('58', 'BR') + campo('59', ascii(nome).slice(0, 25) || 'PIX') + campo('60', ascii(cidade).slice(0, 15) || 'BRASIL')
    + campo('62', campo('05', ascii(txid).slice(0, 25) || '***')) + '6304';
  return base + crc16(base);
}

module.exports = { brCode, crc16 };
