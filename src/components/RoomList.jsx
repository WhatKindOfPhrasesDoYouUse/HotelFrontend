import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import {list} from "postcss";

const RoomList = () => {
    const { hotelId } = useParams();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await fetch('http://localhost:5221/api/rooms/hotel/' + hotelId);
                if (!response.ok) {
                    throw Error('Ошибка при загрузке данных о номерах')
                }
                const data = await response.json();
                console.log("Полученные данные:", data);
                setRooms(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, [hotelId]);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <div className="error">Ошибка: {error}</div>;

    return (
        <div className="room-container">
            <Navbar />
            <h1 className="title">Доступные комнаты</h1>
            <div style={styles.roomList}>
                {rooms.map(room => (
                    <div key={room.id} style={styles.roomCard} className="room-card">
                        <h3>Комната {room.roomNumber}</h3>
                        <p><strong>Описание:</strong> {room.description}</p>
                        <p><strong>Вместимость:</strong> {room.capacity} человек</p>
                        <p><strong>Цена за ночь:</strong> {room.unitPrice} руб.</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    roomList: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        padding: "20px"
    },
    roomCard: {
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "15px",
        boxSizing: "0 2px 4px rgba(0,0,0,0.1)"
    }
};

export default RoomList;