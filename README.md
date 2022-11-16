# BuildLists

## Use

### Run Buildlists
`./buildlists spotify.json changes.json output.json`

## Development

### Install Deno
- **On Mac**: `curl -fsSL https://deno.land/x/install/install.sh | sh`
- Otherwise see [Installation](https://deno.land/manual@v1.28.0/getting_started/installation)
then follow instructions to add `deno` to your `PATH`

### Run Buildlists (with Deno)
`deno run --allow-read --allow-write buildlists.ts spotify.json changes.json output.json`

### Compile
`deno compile --allow-read --allow-write buildlists.ts`