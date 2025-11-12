import React, { useState, useEffect, useRef } from "react";

/**
 * AuthPopup
 * - Popup form to start authentication with username, email, password
 * - Sends auth requests to backend endpoints and stores token
 * - Starts a keepalive ping to the backend to help keep the database/service "active"
 *
 * Usage:
 * <AuthPopup />
 *
 * Backend endpoints expected:
 * POST /api/auth/login      { email, password }
 * POST /api/auth/register   { username, email, password }
 * POST /api/keepalive       {}  (any body ok)
 *
 * Configure base URL with REACT_APP_API_BASE or defaults to window.location.origin
 */

const API_BASE = "/api";

export default function AuthPopup() {
    const [open, setOpen] = useState(true);
    const [mode, setMode] = useState("login"); // 'login' | 'register'
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const keepaliveRef = useRef(null);

    useEffect(() => {
        // start keepalive when token exists
        const token = localStorage.getItem("authToken");
        if (token) startKeepalive();
        return stopKeepalive;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function closePopup() {
        setOpen(false);
    }

    async function submit(e) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const url = `/auth/${mode === "login" ? "login" : "register"}`;
            const body = mode === "login"
                ? { email, password }
                : { username, email, password };

            if (mode === "register") {
                console.log(`${API_BASE}/auth/register`);
                const res = await fetch(`${API_BASE}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });

                const data = await res.json();

                if (!res.ok) {
                    console.log("Registration error:");
                    throw new Error(data.message || `Registration failed: ${res.status}`);
                }

                setMessage("Registration successful. Please log in.");
                setMode("login"); // Switch to login mode after successful registration
                return; // Exit the function early
            }
            else {
                console.log(url);
                const res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || `Auth failed: ${res.status}`);
                }

                if (data.token) {
                    localStorage.setItem("authToken", data.token);
                    setMessage("Authenticated.");
                    startKeepalive();
                    setTimeout(() => setOpen(false), 600);
                } else {
                    setMessage("Success (no token returned).");
                }
            }
        } catch (err) {
            setMessage(err.message || "Authentication error");
        } finally {
            setLoading(false);
        }
    }


    function startKeepalive(intervalMs = 4 * 60 * 1000) {
        stopKeepalive();
        // ping immediately, then periodically
        pingKeepalive();
        keepaliveRef.current = setInterval(pingKeepalive, intervalMs);
    }

    function stopKeepalive() {
        if (keepaliveRef.current) {
            clearInterval(keepaliveRef.current);
            keepaliveRef.current = null;
        }
    }

    async function pingKeepalive() {
        try {
            const token = localStorage.getItem("authToken");
            await fetch(`${API_BASE}/api/keepalive`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ ts: Date.now() }),
            });
            // no need to handle response for keepalive
        } catch (err) {
            // silent fail; optionally stop keepalive on repeated failures
            console.warn("Keepalive ping failed:", err);
        }
    }

    function logout() {
        localStorage.removeItem("authToken");
        stopKeepalive();
        setMessage("Logged out.");
    }

    // Minimal styles
    const overlayStyle = {
        position: 'fixed',
        display: open ? 'flex' : 'none',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', // dark semi-transparent background
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    };

    const modalStyle = {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        minWidth: 300,
        maxWidth: 400,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    };


    const inputStyle = {
        width: "100%",
        padding: "8px 10px",
        marginBottom: 10,
        boxSizing: "border-box",
    };

    return (
        <>
            <div style={overlayStyle} onMouseDown={closePopup}>
                <div style={modalStyle} onMouseDown={(e) => e.stopPropagation()}>
                    <h3 style={{ marginTop: 0 }}>{mode === "login" ? "Login" : "Register"}</h3>

                    <form onSubmit={submit}>
                        {mode === "register" && (
                            <input
                                style={inputStyle}
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        )}

                        <input
                            style={inputStyle}
                            placeholder="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setMode(mode === "login" ? "register" : "login")}
                                style={{ background: 'transparent', border: 'none', color: '#007bff', cursor: 'pointer', padding: 0 }}
                            >
                                Switch to {mode === "login" ? "Register" : "Login"}
                            </button>
                        </div>
                        <input
                            style={inputStyle}
                            placeholder="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <button type="submit" disabled={loading}>
                                {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
                            </button>
                            <button type="button" onClick={closePopup}>Cancel</button>
                        </div>
                    </form>

                    {message && <p style={{ marginTop: 10 }}>{message}</p>}

                    {mode === "register" && message === "Authenticated." && (
                        <p style={{ marginTop: 10, color: 'green' }}>Registration successful! Please log in.</p>
                    )}

                    <hr />

                    <small>
                        Keepalive: will ping {API_BASE}/api/keepalive periodically to help keep the backend/db active.
                    </small>
                </div>
            </div>
        </>
    );
}