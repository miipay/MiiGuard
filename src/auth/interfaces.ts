export type JWTPayload = {
  sub: string;
  username: string;
  iss: 'MiiGuard';
  refreshToken?: string;
};

export type JWTTokens = {
  accessToken: string;
  refreshToken: string;
};

export type BaseUser = {
  username: string;
  displayName: string;
  [key: string]: any;
};
