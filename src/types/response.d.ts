export interface TokenResponse {
  token: string;
  expires: Date;
}

export interface AuthTokensResponse {
  access: TokenResponse;
  refresh?: TokenResponse;
}

export interface ApplicationWithCandidate<Key extends keyof Application>
  extends Pick<Application, Key> {
  candidate: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
}
