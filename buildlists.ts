type User = {
  id: string,
  name: string,
}

type Playlist = {
  id: string,
  owner_id: string,
  song_ids: string[],
}

type Song = {
  id: string,
  artist: string,
  title: string,
}

type Input = {
  users: User[],
  playlists: Playlist[],
  songs: Song[],
}

type Change = {
  type: 'ADD_SONGS' | 'ADD_PLAYLIST' | 'DELETE_PLAYLIST',
  user_id: string,
  song_ids: string[],
  playlist_id: string,
}

async function main() {
  if (Deno.args.length !== 3) {
    console.error("There should be 3 arguments: an input file, a changes file, and an output file")
    return
  }
  
  const [ inputFilename, changesFilename, outputFilename ] = Deno.args

  const inputJson = await Deno.readTextFile(inputFilename)
  const changesJson = await Deno.readTextFile(changesFilename)

  const { users, playlists, songs }: Input = JSON.parse(inputJson)
  const { changes }: { changes: Change[] } = JSON.parse(changesJson)

  // Compiled changes to apply
  const newPlaylists: Playlist[] = []
  const songsToAdd = new Map<string, string[]>()
  const deletedPlaylistIds = new Set<string>()

  // Get highest playlist id and start with the one after that
  let playlistId = playlists.reduce((maxID, { id }) => Math.max(maxID, Number(id)), 0) + 1

  changes.forEach(change => {
    if (change.type === 'ADD_PLAYLIST') {
      newPlaylists.push({ 
        id: `${playlistId++}`,
        owner_id: change.user_id,
        song_ids: change.song_ids,
      })
    } else if (change.type === 'ADD_SONGS') {
      // There could be multiple "changes" to add songs
      const currentUpdates = songsToAdd.get(change.playlist_id) ?? []
      songsToAdd.set(change.playlist_id, [...currentUpdates, ...change.song_ids])
    } else if (change.type === 'DELETE_PLAYLIST') {
      deletedPlaylistIds.add(change.playlist_id)
    } else {
      console.error(`Unknown change type: ${change.type}`)
    }
  })

  const updatedPlaylists = playlists.reduce<Playlist[]>((updated, playlist) => {
    if (deletedPlaylistIds.has(playlist.id)) {
      return updated
    }

    const newSongs = songsToAdd.get(playlist.id) ?? []
    const updatedPlaylist = 
      newSongs.length === 0
         ? playlist
         : {
          ...playlist,
          song_ids: [...playlist.song_ids, ...newSongs]
         }
 
    return [...updated, updatedPlaylist]
  }, []);


  const output = {
    users,
    playlists: [...updatedPlaylists, ...newPlaylists],
    songs,
  }

  await Deno.writeTextFile(outputFilename, JSON.stringify(output))
}

await main()
