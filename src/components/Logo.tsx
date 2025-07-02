import React from "react";

export const Logo = () => (
  <div className="flex flex-col items-center py-4">
    <div className="flex items-center">
      <span className="text-4xl font-extrabold tracking-widest" style={{ color: "#A21A1A", letterSpacing: "0.08em" }}>
        MICHAEL
      </span>
      <span
        className="ml-2 px-2 py-1 rounded"
        style={{
          background: "#E2C97A",
          color: "#1A2332",
          fontWeight: 700,
          fontSize: "1.25rem",
          marginTop: "0.2em",
        }}
      >
        AI
      </span>
    </div>
    <span className="text-xs mt-1 tracking-widest" style={{ color: "#A21A1A", fontWeight: 600 }}>
      BY CARNEGIE
    </span>
  </div>
);

export default Logo;