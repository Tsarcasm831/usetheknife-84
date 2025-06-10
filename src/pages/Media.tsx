import React from "react";
import NavBar from "@/components/NavBar";

const Media = () => (
  <div className="min-h-screen bg-game-darker text-white">
    <NavBar />
    <div className="game-container pt-24 pb-12 space-y-6">
      <h1 className="text-4xl font-bold">Media</h1>
      <p>Follow our channels to stay updated:</p>
      <ul className="list-disc list-inside space-y-2">
        <li>
          <a
            href="https://www.facebook.com/lordtsarcasm"
            className="text-game-orange hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
        </li>
        <li>
          <a
            href="https://open.spotify.com/artist/0tIXtsoLoRKrNEMiwvIkdw?si=m0abb3T2SrCP6eD5-INF9w"
            className="text-game-orange hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Spotify
          </a>
        </li>
        <li>
          <a
            href="https://www.youtube.com/@lordtsarcasm/videos"
            className="text-game-orange hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube
          </a>
        </li>
      </ul>
    </div>
  </div>
);

export default Media;
