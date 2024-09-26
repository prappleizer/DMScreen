import argparse
import os


# Function to create the session folder and subdirectories
def create_session(session_name):
    # Define the base directory where sessions are stored
    base_dir = os.path.join(os.getcwd(), "sessions")

    # Create the full path for the new session
    if " " in session_name:
        session_name = session_name.replace(" ", "-")
    session_dir = os.path.join(base_dir, session_name)

    # Define the subdirectories needed in each session
    subdirs = ["scenes", "npcs", "encounters", "locations", "documents"]

    # Check if the session directory already exists
    if os.path.exists(session_dir):
        print(f"Session '{session_name}' already exists!")
        return

    # Create the session directory and subdirectories
    try:
        os.makedirs(session_dir)
        for subdir in subdirs:
            os.makedirs(os.path.join(session_dir, subdir))

        # Create the intro.md file in the scenes folder
        intro_md_path = os.path.join(session_dir, "scenes", "intro.md")
        with open(intro_md_path, "w") as f:
            f.write(
                "---\n" "title: Introduction\n" "---\n\n" "Welcome to the new session!"
            )

        print(f"Session '{session_name}' created successfully!")

    except Exception as e:
        print(f"An error occurred while creating the session: {e}")


# Main function to handle command-line arguments
def main():
    parser = argparse.ArgumentParser(
        description="Create a new session for the DM Screen app."
    )
    parser.add_argument(
        "--name", required=True, help="The name of the session (e.g., session-2)."
    )

    args = parser.parse_args()

    # Call the function to create the session
    create_session(args.name)


# Run the script
if __name__ == "__main__":
    main()
