export type CreateAuthCredentialRepositoryInput = {
  userId: string;
  passwordHash: string;
};

export interface IAuthCredentialRepository {
  create(data: CreateAuthCredentialRepositoryInput): Promise<void>;
  findPasswordHashByUserId(userId: string): Promise<string | null>;
}
