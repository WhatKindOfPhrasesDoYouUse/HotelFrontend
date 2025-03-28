import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";

const Navbar = () => {
    const [userName, setUserName] = useState("");
    const Navigate = useNavigate();

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

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUserName("");
        window.location.href = '/hotels';
    };

    const handleSelectChange = (event) => {
        if (event.target.value === 'logout') {
            handleLogout();
        } else if (event.target.value === 'profile') {
            Navigate('/guest-profile');
        }
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.navItems}>
                {userName ? (
                    <select
                        style={styles.select}
                        onChange={handleSelectChange} // Обработчик изменений
                    >
                        <option value="">{`Здравствуй, ${userName}`}</option>
                        <option value="profile">Личный кабинет</option>
                        <option value="logout">Выйти</option>
                    </select>
                ) : (
                    <span style={styles.greeting}>Привет, гость</span>
                )}

                <Link to="/hotels" style={styles.navLinks}>Отель</Link>
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
        color: 'fff',
        zIndex: 1000,
    },
    navItems: {
        display: 'flex',
        justifyItems: 'flex-start',
        alignItems: 'center',
        margin: '0 auto',
        gap: '15px',
    },
    navLinks: {
        color: '#fff',
        textDecoration: 'none',
        fontSize: '16px',
        padding: '8px 16px',
    },
    greeting: {
        color: '#fff',
        fontSize: '16px',
        cursor: 'pointer', // Указатель на то, что это кликабельный элемент
    },
    select: {
        backgroundColor: '#fff',
        color: '#333',
        fontSize: '16px',
        borderRadius: '5px',
        border: 'none',
        padding: '8px 12px',
        cursor: 'pointer',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        appearance: 'none', // Убираем стандартный стиль для select
        WebkitAppearance: 'none', // Для Safari
        MozAppearance: 'none', // Для Firefox
    },
    option: {
        backgroundColor: '#007bff',
        color: '#fff',
        padding: '10px 20px',
        border: 'none',
        cursor: 'pointer',
    }
};

export default Navbar;
