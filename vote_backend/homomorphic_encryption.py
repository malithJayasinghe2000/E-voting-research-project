import json
import tenseal as ts
from datetime import datetime

class HomomorphicEncryption:
    def __init__(self):
        # Initialize TenSeal context
        self.context = ts.context(ts.SCHEME_TYPE.CKKS, poly_modulus_degree=8192, coeff_mod_bit_sizes=[40, 20, 40])
        self.context.global_scale = 2**40  # Adjusting scale for better precision
        self.context.generate_galois_keys()
        self.context.generate_relin_keys()

    def encrypt_vote(self, priority):
        # Encrypt the priority value (convert to float)
        encrypted_vote = ts.ckks_vector(self.context, [float(priority)])
        return encrypted_vote

    def decrypt_vote(self, encrypted_vote):
        # Decrypt the priority value and return as integer
        decrypted_value = encrypted_vote.decrypt()[0]
        return int(round(decrypted_value))  # Round the result and convert to integer

    def sum_encrypted_votes(self, encrypted_votes):
        # Sum encrypted votes using homomorphic encryption
        if not encrypted_votes:
            return None
        total_encrypted = encrypted_votes[0]
        for enc_vote in encrypted_votes[1:]:
            total_encrypted += enc_vote
        return total_encrypted
