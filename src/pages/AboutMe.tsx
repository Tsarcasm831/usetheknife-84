import React from "react";
import NavBar from "@/components/NavBar";

const AboutMe = () => (
  <div className="min-h-screen bg-game-darker text-white">
    <NavBar />
    <div className="game-container pt-24 pb-12 space-y-6">
      <h1 className="text-4xl font-bold">About Me</h1>
      <p>
        Welcome to the Remnants of Destruction devlog portal. This project shares
        updates about the game's development and the people behind it.
      </p>
      <p>
        I'm an indie developer passionate about creating post‑apocalyptic
        adventures. This portal lets me document progress, experiments and
        lessons learned while building the world of Remnants of Destruction.
      </p>
    </div>
  </div>
);

export default AboutMe;
