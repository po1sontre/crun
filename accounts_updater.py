import json
import os
import subprocess
from tkinter import Tk, filedialog

def choose_file(file_type):
    """Open a file dialog to select a file."""
    Tk().withdraw()  # Hide the root Tkinter window
    file_path = filedialog.askopenfilename(
        title=f"Select {file_type} File",
        filetypes=[(f"{file_type} files", f"*.{file_type.lower()}"), ("All files", "*.*")]
    )
    return file_path

def load_existing_accounts(json_file):
    """Load existing accounts from the JSON file."""
    if os.path.exists(json_file):
        with open(json_file, 'r') as file:
            try:
                return json.load(file)
            except json.JSONDecodeError:
                print(f"Warning: {json_file} is empty or invalid. Initializing a new structure.")
                return {"accounts": []}
    return {"accounts": []}


def add_or_mark_accounts(json_file, txt_file):
    """Add new accounts and mark old ones as 'unsure'."""
    if not os.path.exists(txt_file):
        print(f"{txt_file} not found.")
        return

    # Read new accounts from the text file
    with open(txt_file, 'r') as file:
        new_accounts = set(line.strip() for line in file if ':' in line)

    # Load existing accounts
    data = load_existing_accounts(json_file)
    existing_accounts = data.get("accounts", [])

    updated_accounts = []
    for account in existing_accounts:
        account_str = f"{account['email']}:{account['password']}"
        if account_str in new_accounts:
            updated_accounts.append(account)  # Keep it as it is
            new_accounts.remove(account_str)  # Remove from new list
        else:
            # Mark old accounts as "unsure"
            account["status"] = "unsure"
            updated_accounts.append(account)

    # Add new accounts
    for account_str in new_accounts:
        email, password = account_str.split(":")
        updated_accounts.append({"email": email.strip(), "password": password.strip(), "status": "new"})

    # Update the data and write back to the JSON file
    data["accounts"] = updated_accounts
    with open(json_file, 'w') as file:
        json.dump(data, file, indent=4)

    print(f"Processed {len(new_accounts)} new accounts. Marked old accounts as 'unsure'.")

def push_to_github():
    """Commit and push changes to the GitHub repository."""
    try:
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", "Updated accounts"], check=True)
        subprocess.run(["git", "push"], check=True)
        print("Changes pushed to GitHub successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Error during Git operations: {e}")

if __name__ == "__main__":
    print("Please select the JSON file:")
    json_file = choose_file("JSON")
    if not json_file:
        print("No JSON file selected. Exiting...")
        exit()

    print("Please select the TXT file:")
    txt_file = choose_file("TXT")
    if not txt_file:
        print("No TXT file selected. Exiting...")
        exit()

    add_or_mark_accounts(json_file, txt_file)
    push_to_github()
