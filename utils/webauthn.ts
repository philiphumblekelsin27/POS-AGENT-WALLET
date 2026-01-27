
/**
 * PAYNA BIOMETRIC CORE (FIDO2/WebAuthn)
 * Handles hardware-backed cryptographic authentication.
 */

export const isWebAuthnSupported = (): boolean => {
  return !!(window.PublicKeyCredential && 
    window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable);
};

export const registerBiometrics = async (email: string, userId: string) => {
  if (!isWebAuthnSupported()) throw new Error("Biometrics not supported on this device");

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: { name: "PAYNA Vault", id: window.location.hostname },
    user: {
      id: Uint8Array.from(userId, c => c.charCodeAt(0)),
      name: email,
      displayName: email.split('@')[0],
    },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "required",
    },
    timeout: 60000,
    attestation: "none",
  };

  const credential = await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions,
  });

  return credential;
};

export const authenticateBiometrics = async () => {
  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge,
    allowCredentials: [], // In real app, fetch registered cred IDs from backend
    userVerification: "required",
    timeout: 60000,
  };

  const assertion = await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions,
  });

  return assertion;
};
