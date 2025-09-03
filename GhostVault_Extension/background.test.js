const CryptoJS = require('crypto-js');

describe('GhostVault AES Encryption', () => {
  const masterPassword = 'testMaster123!';
  const wrongPassword = 'wrongPass!';
  const plainPassword = 'mySecretPassword';

  it('encrypts and decrypts password correctly with the same master password', () => {
    const encrypted = CryptoJS.AES.encrypt(plainPassword, masterPassword).toString();
    const bytes = CryptoJS.AES.decrypt(encrypted, masterPassword);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    expect(decrypted).toBe(plainPassword);
  });

  it('fails to decrypt with a wrong master password', () => {
    const encrypted = CryptoJS.AES.encrypt(plainPassword, masterPassword).toString();
    const bytes = CryptoJS.AES.decrypt(encrypted, wrongPassword);
    let decrypted;
    try {
      decrypted = bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      decrypted = '';
    }
    expect(decrypted).not.toBe(plainPassword);
    expect(decrypted === '' || decrypted === undefined).toBe(true);
  });
}); 