export interface TokenMetadata {
  name: string;
  description: string;
  image: string;
}

const JSON_PREFIX = "data:application/json;base64,";

function base64ToUtf8(b64: string): string {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodeTokenUri(dataUri: string): TokenMetadata {
  if (!dataUri.startsWith(JSON_PREFIX)) throw new Error("unexpected tokenURI scheme");
  const parsed = JSON.parse(base64ToUtf8(dataUri.slice(JSON_PREFIX.length))) as Partial<TokenMetadata>;
  return {
    name: parsed.name ?? "",
    description: parsed.description ?? "",
    image: parsed.image ?? "",
  };
}
