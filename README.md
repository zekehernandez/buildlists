# BuildLists

## Use

### Run Buildlists
`./buildlists spotify.json changes.json output.json`

### Validate output
I'm not exactly sure what is being asked for here, but a file `output.json` should be created that reflects the changes from `changes.json` upon `spotify.json` (or whatever input file provided).

## Development

### Install Deno
- **On Mac**: `curl -fsSL https://deno.land/x/install/install.sh | sh`
  - then follow instructions to add `deno` to your `PATH`
- Otherwise see [Installation](https://deno.land/manual@v1.28.0/getting_started/installation)

### Run Buildlists (with Deno)
`deno run --allow-read --allow-write buildlists.ts spotify.json changes.json output.json`

### Compile
`deno compile --allow-read --allow-write buildlists.ts`

## Notes
Hey! Thanks for looking at my code and considering me as a potential future teammate.
### Scale
- There are several instances where I destructure arrays to create new arrays, which iterates over the entire array. I like this because I like immutable data structures, particularly when working in a declarative environment like React. However, it would be more performant (and necessary with larger input lists) to use `Array.push` to concatenate arrays instead of `[...array1, ...array2]`.
- I don't have a ton of experience with working with files (especially not recently), but I imagine with larger files we wouldn't just want to wholesale read the whole thing all at once.

### Design
- The first decision that I considered significantly was using Deno. I wanted to use Typescript to do this since that's the language I'm most comfortable with, but the instructions said "We’ll expect to interact with your application like this: `$ application-name <input-file> <changes-file> <output-file>`", so that ruled out Node (at least without adding the extra steps of installing Node and installing the script globally). I was glad to see that Deno supported compiling to an executable.
- My main goal in the design of the code itself was to avoid O(n^2). Thankfully, the only change that can affect other changes meaningfully are multiple "add song to playlist" changes. 
- I extracted the primary functionality into a function `applyChanges` so that it could be tested apart from the file IO.

**Concessions**
- I didn't do much input validation because that would have been mostly just more typing and would not, in my opinion, help you construct a more educated opinion about me. Let me know if you feel differently though!
- In a similar vein, a user can attempt add songs to a playlist they are deleting or doesn't even exist, or delete playlists that don't exist, or add playlists to users that don't exist, and my code will quietly ignore them instead of demanding a valid input
- The application will just overwrite the output file if it exists

Basically, this is more of an optimistic happy path implementation.

### Other
After reading the instructions thoroughly and deciding to use Deno I spent a little over an hour on the code and another 30-40 minutes writing the notes. I wouldn't say that I was taking a leisurely pace, but I definitely wasn't hurrying. 

Furthermore, here are some of the things that affected the time spent:
- spent maybe 15 minutes confirming I could get a compiled Deno app to read the args, the actual files, and write to a file
- did not consider multiple "add songs to playlists" changes in one file until partway through
- did not consider duplicate song ids until I started writing these notes
- did not consider some invalid output until after writing the notes (stuff like playlists with a user or songs that don't exist)

Note: the above are not excuses, but when a task takes longer than expected I like to give (and receive) some notes about where we think some time was lost and identify if there are things we can improve for the future. In this case, I could have more carefully considered what expected input in the `changes.json` file could have been before coding.

Lastly, I'll sleep on it before submitting because that's when more stuff surfaces in my mind.

Post sleep update:
- I just cast the `string` playlist id to a number to get the next playlist id. I'd probably consider using a GUID.
- I would maybe consider splitting `applyChanges` to `compileChanges` and `applyChanges` to be able to test those as smaller units

- Zeke
