"use client";

export default function Avatar({ username, size = 40 }: { username: string; size?: number }) {
  // Generate a color based on the username
  function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = `hsl(${hash % 360}, 70%, 60%)`;
    return color;
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        background: stringToColor(username),
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: 600,
        fontSize: size * 0.5,
        userSelect: "none",
      }}
      title={username}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
} 