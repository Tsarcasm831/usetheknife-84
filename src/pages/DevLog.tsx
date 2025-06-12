import NavBar from "@/components/NavBar";
import DevLogSection from "@/components/DevLogSection";
import { mockDevLogs } from "@/lib/data";

const DevLog = () => {
  return (
    <div className="min-h-screen bg-game-darker text-white">
      <NavBar />
      <DevLogSection devlogs={mockDevLogs} />
    </div>
  );
};

export default DevLog;
