export enum LoginErrorType {
  userLocked = 'userLocked',
  userInexistent = 'userInexistent',
  wrongPassword = 'wrongPassword',
}
export class LoginError extends Error {
  type: LoginErrorType;
  constructor(type: LoginErrorType, message?: string) {
    super(message);
    this.type = type;
  }
}
