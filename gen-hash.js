import bcrypt from 'bcrypt';

const senha = 'admin123';

const gerar = async () => {
  const hash = await bcrypt.hash(senha, 10);
  console.log('HASH:', hash);
};

gerar();
