import base64
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def _get_key() -> bytes:
	secret_b64 = os.getenv("ENCRYPTION_SECRET", "")
	if not secret_b64:
		# For dev fallback only; must set in production
		secret = AESGCM.generate_key(bit_length=256)
		return secret
	try:
		return base64.b64decode(secret_b64)
	except Exception:
		return AESGCM.generate_key(bit_length=256)


def encrypt_string(plaintext: str) -> str:
	if plaintext is None:
		return plaintext
	key = _get_key()
	aesgcm = AESGCM(key)
	nonce = os.urandom(12)
	ciphertext = aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)
	return base64.b64encode(nonce + ciphertext).decode("utf-8")


def decrypt_string(ciphertext_b64: str) -> str:
	if ciphertext_b64 is None:
		return ciphertext_b64
	key = _get_key()
	aesgcm = AESGCM(key)
	data = base64.b64decode(ciphertext_b64)
	nonce, ct = data[:12], data[12:]
	plaintext = aesgcm.decrypt(nonce, ct, None)
	return plaintext.decode("utf-8")
