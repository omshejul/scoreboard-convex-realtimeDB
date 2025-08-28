// generateKeys.mjs
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

const { privateKey, publicKey } = await generateKeyPair("RS256", { extractable: true });
const pkcs8 = await exportPKCS8(privateKey);     // PEM, multi-line
const jwk = await exportJWK(publicKey);          // JSON JWK for JWKS
const jwks = JSON.stringify({ keys: [{ use: "sig", ...jwk }] });

// Convex env prefers single-line values; replace newlines in PEM with spaces
process.stdout.write(`JWT_PRIVATE_KEY="${pkcs8.trimEnd().replace(/\n/g, " ")}"\n`);
process.stdout.write(`JWKS=${jwks}\n`);
