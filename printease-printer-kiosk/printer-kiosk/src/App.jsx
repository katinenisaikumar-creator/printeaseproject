import Box from "@mui/material/Box";
import Printer from "./pages/Printer.jsx";

export default function App() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
        background:
          "radial-gradient(circle at 20% 15%, #1E4FD8 0%, #122F94 45%, #0B1230 100%)",
      }}
    >
      <Printer />
    </Box>
  );
}
