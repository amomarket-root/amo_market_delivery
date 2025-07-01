// src/components/Template/Header.jsx
import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import MenuSection from "./MenuSection";
import OptionMenuSection from "./OptionMenuSection";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

const Header = () => {
    const muiTheme = useMuiTheme();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
    const apiUrl = import.meta.env.VITE_API_URL;
    const [avatarAnchorEl, setAvatarAnchorEl] = useState(null);
    const [optionAnchorEl, setOptionAnchorEl] = useState(null);
    const defaultAvatarPath = "/image/avatar.webp";
    const { darkMode, toggleTheme } = useTheme();

    const handleAvatarMenuOpen = (event) => {
        const delivery_token = localStorage.getItem("delivery_token");

        if (!delivery_token) {
            navigate("/login");
        } else {
            setAvatarAnchorEl(event.currentTarget);
        }
    };

    const handleOptionMenuOpen = (event) => {
        setOptionAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAvatarAnchorEl(null);
        setOptionAnchorEl(null);
    };

    const isAvatarMenuOpen = Boolean(avatarAnchorEl);
    const isOptionMenuOpen = Boolean(optionAnchorEl);

    return (
        <AppBar
            sx={{
                backgroundColor: "background.paper",
                boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)",
                color: "text.primary",
                borderBottomLeftRadius: "12px",
                borderBottomRightRadius: "12px",
                overflow: "hidden",
            }}
            position="sticky"
        >
            <Toolbar sx={{ justifyContent: "space-between" }}>
                {/* Logo */}
                <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                    <img
                        src="/image/amo_market_logo.webp"
                        alt="Amo Market Logo"
                        style={{
                            height: '50px',
                            width: 'auto',
                            objectFit: 'contain',
                        }}
                    />
                </Box>

                {/* Icons: Theme Toggle + Settings + Avatar */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={toggleTheme} color="inherit">
                        {darkMode ? (
                            <Brightness7Icon sx={{ fontSize: 35 }} />
                        ) : (
                            <Brightness4Icon sx={{ fontSize: 35 }} />
                        )}
                    </IconButton>


                    <IconButton onClick={handleOptionMenuOpen} sx={{ ml: 1 }}>
                        <Box
                            component="img"
                            src="/image/user_setting.gif"
                            alt="Settings"
                            sx={{
                                height: 45,
                                width: 45,
                                borderRadius: "50%",
                                objectFit: "cover",
                                transition: "transform 0.3s ease-in-out",
                                "&:hover": { transform: "scale(1.1)" },
                                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                            }}
                        />
                    </IconButton>

                    <IconButton color="inherit" onClick={handleAvatarMenuOpen} sx={{ ml: 1 }}>
                        <Avatar
                            alt="Avatar"
                            src={defaultAvatarPath}
                            sx={{
                                width: 45,
                                height: 45,
                                transition: "transform 0.3s ease-in-out",
                                "&:hover": { transform: "scale(1.1)" },
                                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                            }}
                        />
                    </IconButton>
                </Box>
            </Toolbar>

            <MenuSection
                anchorEl={avatarAnchorEl}
                isMenuOpen={isAvatarMenuOpen}
                handleMenuClose={handleMenuClose}
                apiUrl={apiUrl}
            />

            <OptionMenuSection
                anchorEl={optionAnchorEl}
                isMenuOpen={isOptionMenuOpen}
                handleMenuClose={handleMenuClose}
            />
        </AppBar>
    );
};

export default Header;
