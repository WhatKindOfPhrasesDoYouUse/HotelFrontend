import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {Link} from "react-router-dom";
import Navbar from "../Navbar.jsx";

const AdminProfile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Пользователь не авторизован");
            setLoading(false);
            return;
        }

        const decodedToken = jwtDecode(token);
        axios.get(`http://localhost:5221/api/clients/${decodedToken.client_id}/employee`)
            .then((response) => {
                setUserData(response.data);
            })
            .catch((err) => {
                setError("Ошибка загрузки данных");
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div>Загрузка данных...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!userData) {
        return <div>Данные пользователя не найдены</div>;
    }

    return (
        <div className="admin-profile">
            <Navbar />
            <h1>Профиль администратора</h1>
            <div className="profile-info">
                <p><strong>ФИО:</strong> {userData.surname} {userData.name} {userData.patronymic}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Телефон:</strong> {userData.phoneNumber}</p>
                <p><strong>Роль:</strong> {userData.role}</p>

                <Link to="/register-employee">
                    <button>Зарегистрировать нового сотрудника</button>
                </Link>

                <br/>
                <br/>

                <Link to="/hotel-types-administration">
                    <button>Управление списком типов отеля</button>
                </Link>

                <br/>
                <br/>

                <Link to="/payment-room-administration">
                    <button>Управление списком оплат комнат</button>
                </Link>

                <br/>
                <br/>

                <Link to="/payment-amenity-administration">
                    <button>Управление списком оплат услуг</button>
                </Link>

                <br/>
                <br/>

                <Link to="/bank-administration">
                    <button>Управление списком банков</button>
                </Link>

                <br/>
                <br/>

                <Link to="/payment-type-administration">
                    <button>Управление типами оплаты</button>
                </Link>

                <br/>
                <br/>

                <Link to="/hotel-review-administration">
                    <button>Управление отзывами об отеле</button>
                </Link>

                <br/>
                <br/>

                <Link to="/amenity-review-administration">
                    <button>Управление отзывами об услугах</button>
                </Link>

                <br/>
                <br/>

                <Link to="/employee-type-administration">
                    <button>Управление отзывами об услугах</button>
                </Link>

            </div>
        </div>
    );
};

export default AdminProfile;