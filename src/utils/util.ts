import * as argon from 'argon2';
import { randomBytes } from 'crypto';

export class Util {
  public static hash(text: string | Buffer): Promise<string> {
    return argon.hash(text);
  }

  public static match(text: string | Buffer, hashed: string): Promise<boolean> {
    return argon.verify(hashed, text);
  }

  public static genToken(byte: number = 32): string {
    return randomBytes(byte).toString('hex');
  }
}
