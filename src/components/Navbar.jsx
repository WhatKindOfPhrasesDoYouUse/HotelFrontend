import { Link } from "react-router-dom";
import { jwtDecode} from "jwt-decode";
import {useEffect, useState} from "react";

const Navbar = () => {
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const getUserNameFromToken = async () => {
            const token = localStorage.getItem("token");

            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    setUserName(decodedToken.client_name);
                } catch (error) {
                    console.error(`Ошибка декодирования токена ${error}`);
                    setUserName("");
                }
            } else {
                console.log("Пользователь не прошел аутентификацию, токен не получен");
                setUserName("");
            }
        };
        getUserNameFromToken();
    }, []);

    return (
        <nav style={styles.navbar}>
            <div style={styles.navItems}>
                <span style={styles.greeting}>
                    {userName ? `Здравствуй, ${userName}` : "Привет, гость"}
                </span>
                <Link to="/hotels" style={styles.navLinks}>Отели</Link>
            </div>
        </nav>
    );
};

const styles = {
    navbar: {
        width: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: '#007bff',
        padding: '10px 20px',
        color: 'fff'
    },
    navItems: {
        display: 'flex',
        justifyItems: 'flex-start',
        alignItems: 'center',
        margin: '0 auto',
        gap: '15px'
    },
    navLinks: {
        color: '#fff',
        textDecoration: 'none',
        fontSize: '16px',
        padding: '8px 16px'
    },
    greeting: {
        color: '#fff',
        fontSize: '16px',
    }
};

export default Navbar;