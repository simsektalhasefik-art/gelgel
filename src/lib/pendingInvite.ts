// Giriş yapılmadan açılan bir davet linkinin kodunu, oturum açılana kadar geçici olarak tutar.
let pendingCode: string | null = null;

export function setPendingInviteCode(code: string | null) {
  pendingCode = code;
}

export function takePendingInviteCode(): string | null {
  const code = pendingCode;
  pendingCode = null;
  return code;
}

export function extractInviteCodeFromUrl(url: string): string | null {
  const match = url.match(/katil\/([A-Za-z0-9]+)/i);
  return match ? match[1].toUpperCase() : null;
}
