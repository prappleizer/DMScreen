import argparse
import json
import os
import re
import shutil

import markdown
import yaml
from flask import Flask, jsonify, redirect, render_template, request, url_for

session_folder = None
template_dir = os.path.join(os.getcwd(), "app_files", "templates")
static_dir = os.path.join(os.getcwd(), "app_files", "static")


app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)


# CLI argument parser to specify the session directory
def parse_arguments():
    parser = argparse.ArgumentParser(description="DM Screen Application")
    parser.add_argument(
        "--session", type=str, help="Specify the session directory", default=None
    )
    return parser.parse_args()


# Function to set the session folder path based on the CLI argument
def set_session_folder(session_name):
    global session_folder
    sessions_base_path = os.path.join(os.getcwd(), "sessions")
    session_folder = os.path.join(sessions_base_path, session_name)
    if not os.path.exists(session_folder):
        raise ValueError(f"Session folder '{session_name}' does not exist.")
    print(f"Using session folder: {session_folder}")


def parse_markdown_file(subfolder, filename):
    filepath = os.path.join(session_folder, subfolder, f"{filename}.md")
    if not os.path.exists(filepath):
        return None, None
    with open(filepath, "r") as file:
        content = file.read()
    try:
        frontmatter, md_content = content.split("---", 2)[1:]
        metadata = yaml.safe_load(frontmatter)
        if metadata is None:
            metadata = {}
    except ValueError:
        metadata = {}
        md_content = content
    html_content = markdown.markdown(md_content)
    return metadata, html_content


def get_scene_title(scene_name):
    """Returns the title of the scene if available, otherwise returns the formatted filename."""
    metadata, _ = parse_markdown_file("scenes", scene_name)
    if metadata and "title" in metadata:
        return metadata["title"]  # Return the title if available
    else:
        # Fallback to a formatted filename (replace dashes with spaces and capitalize)
        return scene_name.replace("-", " ").title()


@app.route("/")
def index():
    return redirect(url_for("show_scene", scene_name="intro"))


@app.route("/scene/<scene_name>")
def show_scene(scene_name):
    metadata, content = parse_markdown_file("scenes", scene_name)
    if metadata is None:
        return f"Scene {scene_name} not found.", 404

    # Get NPCs, Locations, and Causal Links from metadata
    npcs = metadata.get("NPCs", "").split(", ") if metadata.get("NPCs") else []
    locations = (
        metadata.get("Location", "").split(", ") if metadata.get("Location") else []
    )
    causal_to = (
        metadata.get("Causal-to", "").split(", ") if metadata.get("Causal-to") else []
    )
    causal_from = (
        metadata.get("Causal-from", "").split(", ")
        if metadata.get("Causal-from")
        else []
    )

    # For next and previous scenes, get their titles if available
    next_scene_titles = {scene: get_scene_title(scene) for scene in causal_to}
    previous_scene_titles = {scene: get_scene_title(scene) for scene in causal_from}

    return render_template(
        "scene.html",
        scene_name=scene_name,
        metadata=metadata,
        content=content,
        npcs=npcs,
        locations=locations,
        next_scene_titles=next_scene_titles,
        previous_scene_titles=previous_scene_titles,
    )


@app.route("/npc/<npc_name>")
def show_npc(npc_name):
    _, content = parse_markdown_file("npcs", npc_name)
    if content is None:
        return jsonify({"error": "NPC not found"}), 404

    # Assuming the markdown metadata contains the stats
    metadata, _ = parse_markdown_file("npcs", npc_name)
    npc_title = metadata.get("title", npc_name.replace("-", " ").title())

    stats = {
        "STR": metadata.get("STR", 10),  # Default to 10 if not present
        "DEX": metadata.get("DEX", 10),
        "CON": metadata.get("CON", 10),
        "INT": metadata.get("INT", 10),
        "WIS": metadata.get("WIS", 10),
        "CHA": metadata.get("CHA", 10),
    }

    return jsonify(
        {
            "title": npc_title,
            "content": content,
            "stats": stats,  # Add stats to the response
        }
    )


# Route to serve Location content
@app.route("/location/<location_name>")
def show_location(location_name):
    metadata, content = parse_markdown_file("locations", location_name)
    if content is None:
        return f"Location {location_name} not found.", 404

    # If the Location has a title in the metadata, use it, otherwise fallback to the filename
    location_title = metadata.get("title", location_name.replace("-", " ").title())

    # Send back both title and content
    return {"title": location_title, "content": content}


# Helper functions for encounters, npcs, locations, etc.
def get_all_scenes():
    scenes = []
    scenes_path = os.path.join(session_folder, "scenes")
    for filename in os.listdir(scenes_path):
        if filename.endswith(".md"):
            scene_name = filename.replace(".md", "")
            metadata, _ = parse_markdown_file("scenes", scene_name)
            title = (
                metadata.get("title", scene_name.replace("-", " ").title())
                if metadata
                else scene_name.replace("-", " ").title()
            )
            scenes.append({"name": scene_name, "title": title})
    return sorted(scenes, key=lambda x: x["title"])


def get_all_npcs():
    """Return a list of all NPCs with titles from metadata, fallback to filenames if no title."""
    npcs = []
    npcs_path = os.path.join(session_folder, "npcs")
    for filename in os.listdir(npcs_path):
        if filename.endswith(".md"):
            npc_name = filename.replace(".md", "")
            metadata, _ = parse_markdown_file("npcs", npc_name)
            # If metadata is None or empty, fallback to filename
            title = (
                metadata.get("title", npc_name.replace("-", " ").title())
                if metadata
                else npc_name.replace("-", " ").title()
            )
            npcs.append({"name": npc_name, "title": title})
    return sorted(npcs, key=lambda x: x["title"])


def get_all_locations():
    """Return a list of all locations with titles from metadata, fallback to filenames if no title."""
    locations = []
    locations_path = os.path.join(session_folder, "locations")
    for filename in os.listdir(locations_path):
        if filename.endswith(".md"):
            location_name = filename.replace(".md", "")
            metadata, _ = parse_markdown_file("locations", location_name)
            # If metadata is None or empty, fallback to filename
            title = (
                metadata.get("title", location_name.replace("-", " ").title())
                if metadata
                else location_name.replace("-", " ").title()
            )
            locations.append({"name": location_name, "title": title})
    return sorted(locations, key=lambda x: x["title"])


def get_all_encounters():
    """Returns a list of all encounters with titles from the metadata or folder names."""
    encounters = []

    # Define the encounters directory within the current session folder
    encounters_directory = os.path.join(session_folder, "encounters")

    # Check if the encounters directory exists
    if not os.path.exists(encounters_directory):
        return encounters  # Return an empty list if encounters folder doesn't exist

    # Iterate over all encounter folders
    for encounter_folder in os.listdir(encounters_directory):
        folder_path = os.path.join(encounters_directory, encounter_folder)

        if os.path.isdir(folder_path):
            # Default to using the folder name for the encounter title
            encounter_title = encounter_folder.replace("-", " ").title()

            # Look for any markdown file within the folder
            for filename in os.listdir(folder_path):
                if filename.endswith(".md"):
                    # Parse the markdown file to extract the title from the frontmatter
                    filepath = os.path.join(folder_path, filename)
                    with open(filepath, "r") as file:
                        content = file.read()

                    try:
                        # Split frontmatter from the content and load metadata
                        frontmatter, _ = content.split("---", 2)[1:]
                        metadata = yaml.safe_load(frontmatter)

                        # If a title is available in the frontmatter, use it
                        if metadata and "title" in metadata:
                            encounter_title = metadata["title"]

                    except (ValueError, IndexError):
                        # No valid frontmatter or improper formatting, fallback to folder name
                        pass

                    break  # Stop after the first markdown file is processed

            # Append the encounter name and title to the list
            encounters.append({"name": encounter_folder, "title": encounter_title})

    # Sort the encounters by title
    return sorted(encounters, key=lambda x: x["title"])


# **New Route to Display the Encounter Page**
@app.route("/encounter/<encounter_name>")
def show_encounter(encounter_name):
    # Paths to the encounter folders
    encounter_folder = os.path.join(session_folder, "encounters", encounter_name)
    combatants_folder = os.path.join(encounter_folder, "combatants")
    live_progress_folder = os.path.join(encounter_folder, "_live_progress")

    # Initialize the Live Progress Folder if it doesn't exist
    if not os.path.exists(live_progress_folder):
        os.makedirs(live_progress_folder)
        # Copy combatant files to live progress folder
        for filename in os.listdir(combatants_folder):
            if filename.endswith(".md"):
                src_file = os.path.join(combatants_folder, filename)
                dest_file = os.path.join(live_progress_folder, filename)
                shutil.copy(src_file, dest_file)

    # Read Combatant Data
    combatants = []
    for filename in os.listdir(live_progress_folder):
        if filename.endswith(".md"):
            combatant_name = filename.replace(".md", "")

            # Parse data from live progress file (current state) and original file (initial state)
            metadata_live, _ = parse_markdown_file(live_progress_folder, combatant_name)
            metadata_original, _ = parse_markdown_file(
                combatants_folder, combatant_name
            )

            if metadata_live and metadata_original:
                combatants.append(
                    {
                        "name": combatant_name,
                        "title": metadata_live.get(
                            "title", combatant_name.replace("-", " ").title()
                        ),
                        "AC": metadata_live.get("AC", 10),
                        "HP": metadata_live.get("HP", 0),  # Current HP (live progress)
                        "initial_HP": metadata_original.get(
                            "HP", 0
                        ),  # Initial HP (from original file)
                        "STR": metadata_live.get("STR", 10),
                        "DEX": metadata_live.get("DEX", 10),
                        "CON": metadata_live.get("CON", 10),
                        "INT": metadata_live.get("INT", 10),
                        "WIS": metadata_live.get("WIS", 10),
                        "CHA": metadata_live.get("CHA", 10),
                    }
                )

    # Get Metadata for the Encounter
    metadata = None
    for filename in os.listdir(encounter_folder):
        if filename.endswith(".md"):
            metadata, _ = parse_markdown_file(
                encounter_folder, filename.replace(".md", "")
            )
            break

    # Render the encounter template
    return render_template(
        "encounter.html",
        encounter_name=encounter_name,
        combatants=combatants,
        metadata=metadata,
    )


# **API Endpoint to Get Combatant Data**
@app.route("/encounter/<encounter_name>/combatants")
def get_combatants(encounter_name):
    live_progress_folder = os.path.join("encounters", encounter_name, "_live_progress")
    combatants = []
    for filename in os.listdir(live_progress_folder):
        if filename.endswith(".md"):
            combatant_name = filename.replace(".md", "")
            metadata, _ = parse_markdown_file(live_progress_folder, combatant_name)
            if metadata:
                combatants.append(
                    {
                        "name": combatant_name,
                        "title": metadata.get(
                            "title", combatant_name.replace("-", " ").title()
                        ),
                        "AC": metadata.get("AC", 10),
                        "HP": metadata.get("HP", 0),
                    }
                )
    return jsonify(combatants)


# Function to load combatant data
def load_combatant(encounter_name, combatant_name):
    combatant_file = os.path.join(
        session_folder,
        "encounters",
        encounter_name,
        "_live_progress",
        f"{combatant_name}.md",
    )
    if not os.path.exists(combatant_file):
        return None

    with open(combatant_file, "r") as file:
        content = file.read()

    try:
        frontmatter, md_content = content.split("---", 2)[1:]
        metadata = yaml.safe_load(frontmatter)
        return metadata
    except ValueError:
        return None


# Function to update combatant HP in the markdown file
@app.route(
    "/encounter/<encounter_name>/combatant/<combatant_name>/update_hp", methods=["POST"]
)
def update_combatant_hp(encounter_name, combatant_name):
    data = request.json
    delta_hp = data.get("delta_hp")

    combatant = load_combatant(encounter_name, combatant_name)
    if combatant is None:
        return jsonify(success=False, message="Combatant not found"), 404

    # Update HP
    current_hp = combatant.get("HP", 0)
    new_hp = current_hp - delta_hp

    # Ensure the new HP does not go below 0
    new_hp = max(0, new_hp)

    # Write the updated HP back to the markdown file
    combatant_file = os.path.join(
        session_folder,
        "encounters",
        encounter_name,
        "_live_progress",
        f"{combatant_name}.md",
    )
    with open(combatant_file, "r") as file:
        content = file.read()

    # Rebuild the markdown with updated HP
    frontmatter, md_content = content.split("---", 2)[1:]
    metadata = yaml.safe_load(frontmatter)
    metadata["HP"] = new_hp

    new_frontmatter = yaml.dump(metadata)
    new_content = f"---\n{new_frontmatter}---\n{md_content}"

    # Write the updated content back to the file
    with open(combatant_file, "w") as file:
        file.write(new_content)

    return jsonify(success=True, current_hp=new_hp)


# Function to reset an encounter
@app.route("/encounter/<encounter_name>/reset", methods=["POST"])
def reset_encounter(encounter_name):
    encounter_path = os.path.join(session_folder, "encounters", encounter_name)
    live_progress_path = os.path.join(encounter_path, "_live_progress")
    combatants_path = os.path.join(encounter_path, "combatants")

    # Reset the live progress folder by copying original combatants back into it
    if os.path.exists(live_progress_path):
        shutil.rmtree(live_progress_path)

    shutil.copytree(combatants_path, live_progress_path)

    return jsonify(success=True)


# **Route to Show Combatant Details (for Sidebar)**
@app.route("/combatant/<encounter_name>/<combatant_name>")
def show_combatant(encounter_name, combatant_name):
    live_progress_folder = os.path.join(
        session_folder, "encounters", encounter_name, "_live_progress"
    )

    metadata, content = parse_markdown_file(live_progress_folder, combatant_name)

    if metadata is None:
        return jsonify({"error": "Combatant not found"}), 404

    combatant_title = metadata.get("title", combatant_name.replace("-", " ").title())

    # Extract the combatant stats
    stats = {
        "STR": metadata.get("STR", 10),  # Default values for stats
        "DEX": metadata.get("DEX", 10),
        "CON": metadata.get("CON", 10),
        "INT": metadata.get("INT", 10),
        "WIS": metadata.get("WIS", 10),
        "CHA": metadata.get("CHA", 10),
    }

    return jsonify({"title": combatant_title, "content": content, "stats": stats})


@app.route("/document/<document_name>")
def show_document(document_name):
    documents_folder = os.path.join(session_folder, "documents")
    document_path = os.path.join(documents_folder, f"{document_name}.md")

    # Check if the document exists
    if not os.path.isfile(document_path):
        return jsonify({"error": "Document not found"}), 404

    # Parse the document content
    metadata, content = parse_markdown_file(documents_folder, document_name)

    # Default title to document name if not specified in metadata
    document_title = metadata.get("title", document_name.replace("-", " ").title())

    # Return document content as JSON
    return jsonify({"title": document_title, "content": content})


@app.route("/documents")
def get_all_documents():
    """Retrieve all documents within the current session's documents folder."""
    documents_directory = os.path.join(session_folder, "documents")
    documents = []

    if os.path.exists(documents_directory):
        for filename in os.listdir(documents_directory):
            if filename.endswith(".md"):
                document_name = filename.replace(".md", "")
                filepath = os.path.join(documents_directory, filename)

                # Attempt to read the front matter to get the title
                with open(filepath, "r") as file:
                    content = file.read()
                    try:
                        frontmatter, _ = content.split("---", 2)[1:]
                        metadata = yaml.safe_load(frontmatter)
                        title = metadata.get(
                            "title", document_name.replace("-", " ").title()
                        )
                    except ValueError:
                        # No front matter, use filename as title
                        title = document_name.replace("-", " ").title()

                documents.append({"name": document_name, "title": title})

    return documents


@app.route("/players")
def get_players():
    # Path to the players.md file
    players_file = os.path.join(session_folder, "players.md")

    if not os.path.exists(players_file):
        return jsonify(
            {"title": "Players", "content": "No player information available."}
        ), 404

    # Use parse_markdown_file to get metadata and content
    metadata, content = parse_markdown_file(session_folder, "players")

    # Use the title from metadata if available; otherwise, default to "Players"
    title = metadata.get("title", "Players")

    return jsonify({"title": title, "content": content})


@app.context_processor
def inject_nav_data():
    """Inject all scenes, NPCs, locations, encounters, and documents into templates."""
    all_scenes = get_all_scenes()
    all_npcs = get_all_npcs()
    all_locations = get_all_locations()
    all_encounters = get_all_encounters()
    all_documents = get_all_documents()  # Add this line to inject documents

    return dict(
        all_scenes=all_scenes,
        all_npcs=all_npcs,
        all_locations=all_locations,
        all_encounters=all_encounters,
        all_documents=all_documents,  # Include documents in the injected data
    )


def extract_snippet(content, query=None):
    # Strip frontmatter from content
    match = re.search(r"^---(.*?)---", content, re.DOTALL)
    if match:
        content = content[
            match.end() :
        ].strip()  # Remove the frontmatter, keep the rest of the content

    # If a query is provided, find a snippet around the first occurrence of the query
    if query:
        content_lower = content.lower()
        match_index = content_lower.find(query.lower())
        if match_index != -1:
            snippet_start = max(match_index - 50, 0)
            snippet_end = min(match_index + len(query) + 50, len(content))
            snippet = content[snippet_start:snippet_end].strip()
            # Add ellipses if content was trimmed
            if snippet_start > 0:
                snippet = "..." + snippet
            if snippet_end < len(content):
                snippet += "..."
            return snippet

    # Default snippet if no query is provided or no match is found
    return content[:100] + "..." if len(content) > 100 else content


def remove_frontmatter(content):
    """Remove frontmatter from the content."""
    match = re.search(r"^---(.*?)---", content, re.DOTALL)
    if match:
        return content[match.end() :].strip()
    return content


def build_search_index(session_name):
    index_path = os.path.join("app_files", "static", "js", "search_index.json")
    search_index = []

    # Define folders to search
    content_types = {
        "scenes": "scene",
        "encounters": "encounter",
        "npcs": "npc",
        "locations": "location",
        "documents": "document",
    }

    for folder, url_prefix in content_types.items():
        folder_path = os.path.join("sessions", session_name, folder)
        if os.path.exists(folder_path):
            for filename in os.listdir(folder_path):
                if filename.endswith(".md"):
                    content_name = filename.replace(".md", "")
                    url = f"/{url_prefix}/{content_name}"

                    with open(os.path.join(folder_path, filename), "r") as file:
                        content = file.read()

                        # Extract frontmatter and content
                        frontmatter_match = re.match(r"---(.*?)---", content, re.DOTALL)
                        title = content_name.replace(
                            "-", " "
                        ).title()  # Default to filename if no title found
                        if frontmatter_match:
                            frontmatter = yaml.safe_load(frontmatter_match.group(1))
                            # Check if title exists in the frontmatter
                            if frontmatter and "title" in frontmatter:
                                title = frontmatter["title"]

                        # Remove frontmatter for indexing content
                        content_without_frontmatter = remove_frontmatter(content)

                        # Extract snippet from the content without frontmatter
                        snippet = extract_snippet(content_without_frontmatter)

                        # Add to search index
                        search_index.append(
                            {
                                "title": title,
                                "url": url,
                                "content": content_without_frontmatter,  # Use content without frontmatter for search processing
                                "snippet": snippet,  # Initial snippet
                            }
                        )

    # Write the search index to a JSON file
    with open(index_path, "w") as json_file:
        json.dump(search_index, json_file)


# Main block to run the app
if __name__ == "__main__":
    # Parse arguments and set the session folder

    args = parse_arguments()

    # If session is not provided, default to the first session in the sessions directory
    if args.session:
        sesh = args.session
        set_session_folder(args.session)
    else:
        sessions = sorted(os.listdir(os.path.join(os.getcwd(), "sessions")))
        set_session_folder(sessions[0])
        sesh = sessions[0]

    os.makedirs("app_files/static/js", exist_ok=True)

    # Path to the JSON file
    index_path = os.path.join("app_files/static", "js", "search_index.json")

    build_search_index(sesh)
    app.run(debug=True, port=5001)
