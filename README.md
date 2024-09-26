# DMScreen
A Handy scene based tool for DMs, along with a simple HP encounter runner.

![](/app_files/static/images/app-example.png)

## Setup

When you download the code, a sample session with a few scenes, NPCs, and 1 encounter has been setup to showcase the tool. 

All of the information to populate the app is provided at the level of a "session", which you can create by adding a new folder to the `sessions/` toplevel directory. 

To launch the app for a given session, from the `DMScreen/` directory, run, e.g.,

```
python app.py --session session-1
```

providing the session folder name to the `--session` flag. The above will open the example. The app should be running at `http://127.0.0.1:5001/`, which you can navigate to in your browser. 

Within a session, there are four key folders to create: 

1. `scenes/`: this folder contains markdown files with your scenes, i.e., bite-sized individual moments within the session for which you want some notes. The only requirement is that the first md file for a session is called `intro.md`. 
2. `npcs/`: this folder contains markdown files for your npcs. 
3. `locations/`: this folder contains markdown files for any key locations 
4. `documents/`: this folder contains markdown files for any ancillary documents you want quick access to, like a list provided by an NPC (or DM lists, like random names when names are needed!)
5. `encounters/`: this folder contains information for running encounters. Here you should separate encounters into folders, within which is an `index.md` with frontmatter for the title of the encounter (e.g.,)
```
---
title: Goblin Encounter
---
```
and a `combatants` folder that contains markdown files for combatants (this is similar to NPCs, discussed more below). 

We provide a file, `create_session.py`, which allows you to quickly create the set of folders and necessary files needed to run a session. Running 

```
python create_session.py --name session-2
```

This will create the session folder, the internal folders, and force an `intro.md` file within the scenes. 

## Frontmatter
At its simplest, the markdown files for scenes, npcs, locations, etc., can just contain content. If no frontmatter is provided, the app will try to use file names to derive names. But for more control, the top of the `md` file should have a frontmatter separated by three dashes. All md files can have a `title` keyword, which determines the name that appears in the app. For example, the encounter index above has the formatting to name an encounter "Goblin Encounter". 

We have a few special keys that can be added to frontmatter: 

For `scene` markdown files, in addition to a title, you can provide a list of any NPCs and Locations relevant to that scene (comma separated,using the filename for that entity), as well as which scenes (also by filename) are most related to this one, either `Causal-from` or `Causal-to`. These determine the quickselect buttons that appear at the left and side of the main app panel. 

Here is the example frontmatter for the provided `intro.md`: 

```
---
title: Welcome to Haver's Rest
NPCs: Edwin-Cawley, Greta, elara
Causal-to: middle, closing
Location: forest, mayors-office
---
```

For `NPC` or `combatant` markdown files, one can provide the base stats as follows: 
```
---
title: Edwin Cawley
STR: 12
DEX: 10
CON: 15
INT: 8
WIS: 13
CHA: 16
---
```
These will automatically render into the shield-like statblocks at the top of each npc/combatant page. If none are provided, it assumes base stats of 10 across the board. For combat/encounter statblocks, `AC` and `HP` must also be provided. Note that because nothing is done computationally with these stats, you can alternatively enter modifiers if you prefer. 

## Images 
At the moment, the only way to add and render images within your scenes is as follows: 
1. First, add the image to the `/app_files/static/images` directory, then
2. Within your markdown files, you can reference images like this:

```
![Alt text](/static/images/havers_rest.jpg)
```


## Usage 
Once your content has been added, you can run the app via 

```
python app.py --session session-name
```

You will be taken to the `intro.md` scene. Your overall screen is split into three main sections, between a navbar at the top containing all scenes, npcs, locations, and encounters. 

![](/app_files/static/images/sidebar.png)

1. The Left and Right panels contain buttons determined by the `Causal-from` and `Causal-to` keys in the frontmatter. These allow you to set up any number of other scenes you think may be useful to jump to from a given scene. At any time, you can use the `scenes` nav bar item to go to any scene. 
2. The center panel contains a card with your Scene markdown content. At the top of the scene card are buttons for any NPCs or Locations you linked to this scene. 
3. When you click a location or NPC link (including from the nav bar), a sidebar opens on the left of the page covering the Causal-from links, which displays the markdown content (and stats if relevant). The sidebar has a close button (right arrow), or re-clicking the same button will close the sidebar. 

From here, it's up to you! You can navigate through scenes, and quick-check location or NPC info. 

### Combat 
The Encounters tab in the nav bar holds any encounters you have setup. The setup for a combat encounter has a few extra steps: 
1. Create an encounter folder within `/encounters`
2. Add an `index.md` to it with the encounter title frontmatter
3. Add a `combatants` folder and add in md files for all combatants. 

Here, an additional critical two things to add to the frontmatter are AC and HP, e.g,
```
---
title: Goblin Warrior (1)
AC: 15
HP: 30
STR: 8
DEX: 12
CON: 15
INT: 8
WIS: 10
CHA: 11
---
```

The HP is used to create a healthbar for each creature, which also displays its AC. 

In combat mode, the middle card holds the health trackers, the right panel has the combatants, with entry fields for entering damage, or for resetting the encounter. The left panel is left empty, as clicking the combatant names pulls out the sidebar, and we expect the sidebar to be open often during combat.

![](/app_files/static/images/combat-example.png)