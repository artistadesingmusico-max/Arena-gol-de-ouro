const PIX_KEY = "34809917000153";
const MERCHANT_NAME = "ARENA GOL DE OURO";
const MERCHANT_CITY = "AGUAS LINDAS";

function field(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

// Static Pix BR Code with the amount embedded (tag 54): the payer's bank app
// locks the value, so it cannot be edited at payment time.
export function buildPixPayload(amountCents: number, txid: string): string {
  const cleanTxid = txid.replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";
  const body =
    field("00", "01") +
    field("01", "11") +
    field("26", field("00", "br.gov.bcb.pix") + field("01", PIX_KEY)) +
    field("52", "0000") +
    field("53", "986") +
    field("54", (amountCents / 100).toFixed(2)) +
    field("58", "BR") +
    field("59", MERCHANT_NAME) +
    field("60", MERCHANT_CITY) +
    field("62", field("05", cleanTxid)) +
    "6304";
  return body + crc16(body);
}
