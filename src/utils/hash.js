import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashSenha(senha) {
  return await bcrypt.hash(senha, SALT_ROUNDS);
}

export async function compararSenha(senhaDigitada, senhaHash) {
  return await bcrypt.compare(senhaDigitada, senhaHash);
}
