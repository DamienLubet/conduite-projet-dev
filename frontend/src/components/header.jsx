import React, { useState } from "react";
import "./header.css";
import AuthPopup from "./auth.jsx";
//import { Link } from "react-router-dom";

/**
 * Header component with black background and navigation links.
 * Accepts an optional prop `AuthButton` to render a custom connect/disconnect button.
 *
 * Usage:
 * <Header />
 * or
 * <Header AuthButton={MyAuthButton} />
 */

function DefaultAuthButton() {
    const [connected, setConnected] = useState(false);
    return (
        <button
            onClick={() => setConnected((c) => !c)}
            aria-pressed={connected}
        >
            {connected ? "Disconnect" : "Connect"}
        </button>
    );
}

export default function Header() {
    const LinkComp = "a"; // if react-router is not available, fallback to anchor
    const [LoadedAuth, setLoadedAuth] = useState(null);
    const connected = false;

    const openAuth = async () => {
        const Comp = AuthPopup;
        setLoadedAuth(() => Comp);
    };

    return (
        <>
            <div className="header__nav"></div>
            <LinkComp to="/" href="/" className="header__link header__link--home">
                Home
            </LinkComp>

            <LinkComp to="/projects" href="/projects" className="header__link">
                Projects
            </LinkComp>
            <LinkComp to="/projects/new" href="/projects/new" className="header__link">
                New Project
            </LinkComp>
            <LinkComp to="/about" href="/about" className="header__link">
                About
            </LinkComp>

            <div className="header__auth">
                <button
                    onClick={() =>
                        setLoadedAuth(() => (props) => <AuthPopup {...props} key={Date.now()} />)
                    }
                >
                    {connected ? "Disconnect" : "Connect"}
                </button>
            </div>

            {LoadedAuth ? <LoadedAuth onClose={() => setLoadedAuth(null)} /> : null}
        </>
    );
}