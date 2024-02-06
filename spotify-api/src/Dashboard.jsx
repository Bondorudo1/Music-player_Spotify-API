import { useState } from "react";
import UseAuth from "./UseAuth";
import { Container, Form } from "react-bootstrap";
import SpotifyWebApi from "spotify-web-api-node";
import { useEffect } from "react";
import TrackSearchResult from "./TrackSearchResult";
import Player from "./Player";

const spotifyApi = new SpotifyWebApi({
  clientId: "50f5915fd97340a1b695ed1d68896cc8",
});

export default function Dashboard({ code }) {
  const accessToken = UseAuth(code);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();

  function chooseTrack(track) {
    setPlayingTrack(track);
    setSearch("");
  }

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);
  useEffect(() => {
    if (!accessToken) return;
    if (!search) return setSearchResults([]);

    let cancel = false;
    spotifyApi.searchTracks(search).then((res) => {
      if (cancel) return;
      setSearchResults(
        res.body.tracks.items.map((track) => {
          return {
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
            image: track.album.images[0].url,
          };
        })
      );
    });
    return () => (cancel = true);
  }, [search, accessToken]);

  return (
    <Container className="d-flex flex-column py-2" style={{ heaight: "100vh" }}>
      <Form.Control
        type="search"
        placeholder="Search for music"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
        {searchResults.map((track) => (
          <TrackSearchResult
            track={track}
            key={track.uri}
            chooseTrack={chooseTrack}
          />
        ))}
      </div>
      <div>
        <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
      </div>
    </Container>
  );
}
