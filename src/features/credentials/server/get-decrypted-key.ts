import "server-only";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

export async function getDecryptedApiKey(credentialId: string, userId: string): Promise<string> {
  const credential = await prisma.credential.findUniqueOrThrow({
    where: { id: credentialId, userId },
    select: { encryptedApiKey: true },
  });
  return decrypt(credential.encryptedApiKey);
}
