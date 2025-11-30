import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left Logo / Brand */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: "none",
            color: "inherit",
            fontWeight: 600,
          }}
        >
          Quiz App
        </Typography>

        {/* Right Nav Links */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button component={Link} to="/" color="inherit">
            Home
          </Button>

          <Button component={Link} to="/admin" color="inherit">
            Admin
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
