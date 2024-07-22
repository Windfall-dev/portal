export interface Auth {
  userId: string;
  userToken: string;
  encryptionKey: string;
  challengeId?: string;
}
