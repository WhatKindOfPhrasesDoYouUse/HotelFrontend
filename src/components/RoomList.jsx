import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
            <h1 className="title">Комнаты отеля {hotelId}</h1>
            <div className="room-list">
                {rooms.map(room => (
                    <div key={room.id} className="room-card">
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

export default RoomList;