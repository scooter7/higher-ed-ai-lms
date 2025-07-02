import React from "react";

const Logo = () => (
  <div className="flex flex-col items-center py-4">
    <img
      src={require("@/assets/michaelailogo.png")}
      alt="MICHAEL AI by Carnegie"
      className="w-48 h-auto"
      style={{ maxWidth: 220 }}
    />
  </div>
);

export default Logo;