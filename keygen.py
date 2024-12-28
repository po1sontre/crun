import random
import string
import hashlib
from termcolor import colored  # For colorful terminal output

# Function to generate a random string of a given length
def generate_random_string(length, char_set=None):
    if char_set is None:
        char_set = string.ascii_uppercase + string.digits  # A-Z, 0-9
    return ''.join(random.choice(char_set) for _ in range(length))

# Function to generate the key
def generate_key(segment_length=6, checksum_length=4, segments_count=4, show_colored=True):
    # Generate segments
    segments = [generate_random_string(segment_length) for _ in range(segments_count)]
    
    # Generate checksum
    checksum = generate_random_string(checksum_length)  # Simple checksum
    combined_segments = ''.join(segments)
    
    # Create a secure checksum based on hashed segments
    hash_object = hashlib.sha256(combined_segments.encode())
    hex_checksum = hash_object.hexdigest()[:checksum_length].upper()  # Take first `checksum_length` characters
    
    # Construct the key in the desired format with hash-based checksum
    key = f"po1son-{segments[0]}-{segments[1]}-{segments[2]}-{segments[3]}-{hex_checksum}"
    
    # Optional: Colorize output for pink effect
    if show_colored:
        colored_key = colored(key, 'magenta', attrs=['bold'])
        return colored_key
    
    return key

# Print a new key with the default options
print(generate_key())

