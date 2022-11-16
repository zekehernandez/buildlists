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

export function applyChanges({ users, playlists, songs } : Input, changes: Change[]) {
  // Compiled changes to apply
  const newPlaylists: Playlist[] = []
  const songsToAdd = new Map<string, string[]>()
  const deletedPlaylistIds = new Set<string>()

  const userIds = new Set<string>(users.map(u => u.id))
  const playlistIds = new Set<string>(playlists.map(p => p.id))
  const songIds = new Set<string>(songs.map(s => s.id))

  // Get highest playlist id and start with the one after that
  let playlistId = playlists.reduce((maxID, { id }) => Math.max(maxID, Number(id)), 0) + 1

  changes.forEach(change => {
    if (change.type === 'ADD_PLAYLIST') {
      const validSongsIds = change.song_ids.filter(id => songIds.has(id))
      if (userIds.has(change.user_id) && validSongsIds.length > 0) {
        newPlaylists.push({ 
          id: `${playlistId++}`,
          owner_id: change.user_id,
          song_ids: validSongsIds,
        })
      }
    } else if (change.type === 'ADD_SONGS') {
      const validSongsIds = change.song_ids.filter(id => songIds.has(id))
      if (playlistIds.has(change.playlist_id) && validSongsIds.length > 0) {
        // There could be multiple "changes" to add songs
        const currentUpdates = songsToAdd.get(change.playlist_id) ?? []
        songsToAdd.set(change.playlist_id, [...currentUpdates, ...validSongsIds])
      }
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
          song_ids: Array.from(new Set([...playlist.song_ids, ...newSongs]))
        }

    return [...updated, updatedPlaylist]
  }, []);


  return {
    users,
    playlists: [...updatedPlaylists, ...newPlaylists],
    songs,
  }
}

async function main() {
  if (Deno.args.length !== 3) {
    console.error("There should be 3 arguments: an input file, a changes file, and an output file")
    return
  }
  
  const [ inputFilename, changesFilename, outputFilename ] = Deno.args

  const inputJson = await Deno.readTextFile(inputFilename)
  const changesJson = await Deno.readTextFile(changesFilename)

  const input: Input = JSON.parse(inputJson)
  const { changes }: { changes: Change[] } = JSON.parse(changesJson)

  const output = applyChanges(input, changes)

  await Deno.writeTextFile(outputFilename, JSON.stringify(output))
}

await main()
