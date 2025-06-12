import React from "react";
import NavBar from "@/components/NavBar";

const Game = () => {
  return (
    <div className="min-h-screen bg-game-darker text-white">
      <NavBar />
      <div className="game-container pt-24 pb-12">
        <iframe
          src="/game/index.html"
          title="Remnants of Destruction"
          className="w-full h-[80vh] border border-white/10 rounded"
        />
      </div>
    </div>
  );
};

export default Game;
