import * as argon2 from 'argon2';

export type HashResult = {
  algorithm: string;
  passwordHash: string;
};
export const hashPassword = async (plainPassword: string): Promise<HashResult> => {
  return {
    algorithm: 'argon2',
    passwordHash: await argon2.hash(plainPassword),
  };
};

export const verifyPassword = async (hashPassword: string, plainPassword: string): Promise<boolean> => {
  return await argon2.verify(hashPassword, plainPassword);
};
