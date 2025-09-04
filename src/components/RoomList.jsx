import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import {
    FaSpinner,
    FaFilter,
    FaSort,
    FaUndo,
    FaUsers,
    FaMoneyBillWave,
    FaInfoCircle,
    FaStar,
    FaSearch,
    FaExclamationTriangle,
    FaChevronUp,
    FaChevronDown,
    FaCheckCircle,
    FaCalendarAlt,
    FaChartArea
} from "react-icons/fa";

const RoomList = () => {
    const { hotelId } = useParams();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [sortByPrice, setSortByPrice] = useState(null);
    const [sortByCapacity, setSortByCapacity] = useState(null);

    const [capacity, setCapacity] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const [comforts, setComforts] = useState([]);
    const [roomComforts, setRoomComforts] = useState({});
    const [selectedComforts, setSelectedComforts] = useState([]);

    const [showFilters, setShowFilters] = useState(true);

    const [roomAvailability, setRoomAvailability] = useState({});
    const [nextAvailableDates, setNextAvailableDates] = useState({});

    const fetchRoomComforts = async (roomId) => {
        try {
            const response = await fetch(`http://localhost:5221/api/rooms/${roomId}/comforts`);
            if (!response.ok) {
                throw Error('Ошибка при загрузке данных о комфортностях');
            }
            const data = await response.json();
            setRoomComforts(prev => ({
                ...prev,
                [roomId]: data
            }));
        } catch (error) {
            console.error("Ошибка при получении информации об удобствах для комнат: ", error);
        }
    };

    useEffect(() => {
        const fetchComforts = async () => {
            try {
                const response = await fetch("http://localhost:5221/api/comforts");
                if (!response.ok) {
                    throw new Error("Ошибка при загрузке комфортностей");
                }
                const data = await response.json();
                setComforts(data);
            } catch (error) {
                console.error("Ошибка загрузки комфортностей:", error);
            }
        };

        fetchComforts();
    }, []);

    useEffect(() => {
        const fetchFilteredRooms = async () => {
            try {
                const queryParams = new URLSearchParams();
                if (capacity) queryParams.append("capacity", capacity);
                if (minPrice) queryParams.append("minUnitPrice", minPrice);
                if (maxPrice) queryParams.append("maxUnitPrice", maxPrice);

                const response = await fetch(`http://localhost:5221/api/rooms/filter/${hotelId}?${queryParams}`);
                if (!response.ok) {
                    throw Error('Ошибка при загрузке данных о номерах');
                }
                const data = await response.json();
                setRooms(data);

                data.forEach((room) => {
                    fetchRoomComforts(room.id);
                    checkRoomAvailability(room.id);
                });

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchFilteredRooms();
    }, [hotelId, capacity, minPrice, maxPrice]);

    useEffect(() => {
        const fetchSortedRooms = async () => {
            try {
                const queryParams = new URLSearchParams();
                if (sortByPrice !== null) queryParams.append("sortingDirectionByPrice", sortByPrice === "true");
                if (sortByCapacity !== null) queryParams.append("sortingDirectionByCapacity", sortByCapacity === "true");

                const response = await fetch(`http://localhost:5221/api/rooms/sort/${hotelId}?${queryParams}`);
                if (!response.ok) {
                    throw Error('Ошибка при загрузке данных о номерах');
                }
                const data = await response.json();

                data.forEach((room) => {
                    fetchRoomComforts(room.id);
                });

                setRooms(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSortedRooms();
    }, [hotelId, sortByPrice, sortByCapacity]);

    const fetchFilteredRoomsByComforts = async () => {
        try {
            if (selectedComforts.length === 0) {
                return;
            }

            const queryParams = new URLSearchParams();
            selectedComforts.forEach(id => queryParams.append("comfortIds", id));

            const response = await fetch(`http://localhost:5221/api/rooms/filter-by-comforts/${hotelId}?${queryParams}`);
            if (!response.ok) {
                throw new Error("Ошибка при загрузке номеров");
            }

            const data = await response.json();
            setRooms(data);

            data.forEach(room => {
                fetchRoomComforts(room.id);
            });

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilters = () => {
        setCapacity("");
        setMinPrice("");
        setMaxPrice("");
    };

    const handleComfortChange = (event, comfortId) => {
        setSelectedComforts(prev =>
            event.target.checked
                ? [...prev, comfortId]
                : prev.filter(id => id !== comfortId)
        );
    };

    const handleResetSorting = () => {
        setSortByPrice(null);
        setSortByCapacity(null);
    };

    const selectAllComforts = () => {
        setSelectedComforts(comforts.map(c => c.id));
    };

    const clearAllComforts = () => {
        setSelectedComforts([]);
    };

    const checkRoomAvailability = async (roomId) => {
        try {
            const response = await fetch(`http://localhost:5221/api/rooms/${roomId}/has-room-is-available`)

            if (!response.ok) {
                throw new Error('Ошибка при проверке доступности комнаты');
            }
            const isAvailable = await response.json();

            setRoomAvailability(prev => ({
                ...prev,
                [roomId]: isAvailable
            }));

            if (!isAvailable) {
                const getDateResponse = await fetch(`http://localhost:5221/api/rooms/${roomId}/next-available-date`);
                if (!getDateResponse) {
                    throw new Error('Ошибка при получении даты доступности');
                }
                const availableDate = await getDateResponse.json();

                setNextAvailableDates(prev => ({
                    ...prev,
                    [roomId]: availableDate
                }));
            }
        } catch (error) {
            console.error(`Ошибка при проверке доступности комнаты: ${error.message}`);
        }
    }

    if (loading) return (
        <div className="loading-container">
            <Navbar />
            <div className="loading-spinner">
                <FaSpinner className="spinner" />
                <p>Загрузка номеров...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <Navbar />
            <div className="error-message">
                <FaExclamationTriangle /> Ошибка: {error}
            </div>
        </div>
    );

    return (
        <div className="room-list-container">
            <Navbar />

            <br/>
            <br/>

            <div className="main-content">
                <div className="filters-column">
                    <div className="filters-header">
                        <h3><FaFilter /> Фильтры</h3>
                        <button
                            className="toggle-filters-btn"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            {showFilters ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="filters-content">
                            <div className="filter-group">
                                <h4 className="filter-title">
                                    <FaSearch /> Основные параметры
                                </h4>
                                <div className="input-group">
                                    <label>Вместимость:</label>
                                    <input
                                        type="number"
                                        placeholder="Гостей"
                                        value={capacity}
                                        onChange={e => setCapacity(e.target.value)}
                                        min="1"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Ценовой диапазон:</label>
                                    <div className="price-range">
                                        <input
                                            type="number"
                                            placeholder="От"
                                            value={minPrice}
                                            onChange={e => setMinPrice(e.target.value)}
                                            min="0"
                                        />
                                        <span>-</span>
                                        <input
                                            type="number"
                                            placeholder="До"
                                            value={maxPrice}
                                            onChange={e => setMaxPrice(e.target.value)}
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="filter-group">
                                <h4 className="filter-title">
                                    <FaSort /> Сортировка
                                </h4>
                                <div className="input-group">
                                    <select
                                        value={sortByPrice || ""}
                                        onChange={e => setSortByPrice(e.target.value === "" ? null : e.target.value)}
                                    >
                                        <option value="">Цена: без сортировки</option>
                                        <option value="true">По возрастанию</option>
                                        <option value="false">По убыванию</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <select
                                        value={sortByCapacity || ""}
                                        onChange={e => setSortByCapacity(e.target.value === "" ? null : e.target.value)}
                                    >
                                        <option value="">Вместимость: без сортировки</option>
                                        <option value="true">По возрастанию</option>
                                        <option value="false">По убыванию</option>
                                    </select>
                                </div>
                            </div>

                            <div className="filter-group">
                                <h4 className="filter-title">
                                    <FaStar /> Удобства {selectedComforts.length > 0 && `(${selectedComforts.length})`}
                                </h4>
                                <div className="comforts-scroll-container">
                                    <div className="comforts-grid">
                                        {comforts.map(comfort => (
                                            <label key={comfort.id} className="comfort-item">
                                                <input
                                                    type="checkbox"
                                                    value={comfort.id}
                                                    checked={selectedComforts.includes(comfort.id)}
                                                    onChange={e => handleComfortChange(e, comfort.id)}
                                                />
                                                <span>{comfort.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="comforts-actions">
                                    <button
                                        className="select-all-btn"
                                        onClick={selectAllComforts}
                                    >
                                        Выбрать все
                                    </button>
                                    <button
                                        className="clear-all-btn"
                                        onClick={clearAllComforts}
                                    >
                                        Очистить
                                    </button>
                                </div>
                            </div>

                            <div className="filter-actions">
                                <button
                                    className="reset-btn"
                                    onClick={() => {
                                        handleResetFilters();
                                        handleResetSorting();
                                        clearAllComforts();
                                    }}
                                >
                                    <FaUndo /> Сбросить все
                                </button>
                                <button
                                    className="apply-btn"
                                    onClick={fetchFilteredRoomsByComforts}
                                >
                                    Применить фильтры
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="rooms-column">
                    {rooms.length > 0 ? (
                        rooms.map(room => (
                            <div key={room.id} className="room-card">
                                <div className="room-image-container">
                                    <img
                                        src="/src/images/rooms/hotel-room-1.jpg"
                                        alt={`Фото номера ${room.roomNumber}`}
                                        className="room-image"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/src/images/rooms/HotelType-room-1.jpg';
                                        }}
                                    />
                                </div>

                                <div className="room-content">
                                    <div className="room-header">
                                        <h3>Номер {room.roomNumber}</h3>
                                        <div className="price-tag">
                                            <FaMoneyBillWave /> {room.unitPrice} ₽/ночь
                                        </div>
                                    </div>

                                    <div className="room-details">
                                        <p className="description">
                                            <FaInfoCircle/> {room.description}
                                        </p>
                                        <div className="capacity">
                                            <FaUsers/> Вместимость: {room.capacity} чел.
                                        </div>

                                        <p className="description">
                                            <FaChartArea/> Площадь: {room.area} м²
                                        </p>

                                        <div className="availability-status">
                                            {roomAvailability[room.id] ? (
                                                <div className="available">
                                                    <FaCheckCircle/> Статус: <span>Свободна</span>
                                                </div>
                                            ) : (
                                                <div className="not-available">
                                                    <FaCalendarAlt/> Ближайшая доступная
                                                    дата: <span>{new Date(nextAvailableDates[room.id]).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="comforts-section">
                                            <h4>Удобства ({roomComforts[room.id]?.length || 0})</h4>
                                            {roomComforts[room.id] && (
                                                <ul className="comforts-list">
                                                    {roomComforts[room.id].map(comfort => (
                                                        <li key={comfort.id}>{comfort.name}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    <div className="room-actions">
                                        <Link
                                            to={`/amenity-review/${room.id}`}
                                            className="action-btn secondary"
                                        >
                                            Отзывы на услуги
                                        </Link>

                                        <Link
                                            to={room.capacity === 1 ?
                                                `/single-room-booking/${room.id}` :
                                                `/group-room-booking/${room.id}`}
                                            className="action-btn primary"
                                        >
                                        Бронировать
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-rooms">
                            <p>Нет доступных номеров по выбранным критериям</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .room-list-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }

                .header-section {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .page-title {
                    color: #2c3e50;
                    font-size: 28px;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .title-icon {
                    color: #f39c12;
                }

                .page-subtitle {
                    color: #7f8c8d;
                    font-size: 16px;
                }

                .main-content {
                    display: flex;
                    gap: 30px;
                }

                .filters-column {
                    width: 300px;
                    flex-shrink: 0;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                    padding: 15px;
                    height: fit-content;
                    position: sticky;
                    top: 20px;
                }

                .filters-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .filters-header h3 {
                    margin: 0;
                    font-size: 18px;
                    color: #2c3e50;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .toggle-filters-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #7f8c8d;
                    font-size: 16px;
                    padding: 5px;
                }

                .filters-content {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .filter-group {
                    padding-bottom: 15px;
                    border-bottom: 1px solid #eee;
                }

                .filter-group:last-child {
                    border-bottom: none;
                }

                .filter-title {
                    color: #2c3e50;
                    font-size: 15px;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .input-group {
                    margin-bottom: 15px;
                    width: 90%;
                }

                .input-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-size: 13px;
                    color: #7f8c8d;
                }

                .input-group input,
                .input-group select {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                    background-color: white;
                    color: black;
                }

                .price-range {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .price-range input {
                    flex: 1;
                }

                .price-range span {
                    color: #7f8c8d;
                }

                .comforts-scroll-container {
                    max-height: 200px;
                    overflow-y: auto;
                    padding-right: 5px;
                    margin-bottom: 10px;
                    border: 1px solid #eee;
                    border-radius: 6px;
                }

                .comforts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 8px;
                }

                .comfort-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .comfort-item input {
                    cursor: pointer;
                }

                .comforts-scroll-container::-webkit-scrollbar {
                    width: 6px;
                }

                .comforts-scroll-container::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }

                .comforts-scroll-container::-webkit-scrollbar-thumb {
                    background: #ccc;
                    border-radius: 3px;
                }

                .comforts-scroll-container::-webkit-scrollbar-thumb:hover {
                    background: #aaa;
                }

                .comforts-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 8px;
                }

                .select-all-btn, .clear-all-btn {
                    padding: 4px 8px;
                    font-size: 12px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .select-all-btn {
                    background: #e3f2fd;
                    color: #1976d2;
                }

                .clear-all-btn {
                    background: #ffebee;
                    color: #d32f2f;
                }

                .filter-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 10px;
                }

                .reset-btn,
                .apply-btn {
                    padding: 8px 15px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                }

                .reset-btn {
                    background-color: #f5f5f5;
                    color: #e74c3c;
                }

                .reset-btn:hover {
                    background-color: #fdecea;
                }

                .apply-btn {
                    background-color: #3498db;
                    color: white;
                }

                .apply-btn:hover {
                    background-color: #2980b9;
                }

                .rooms-column {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .room-card {
                    display: flex;
                    background: white;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
                    padding: 25px;
                    margin-bottom: 25px;
                    border-left: 4px solid #2980b9;
                    transition: transform 0.2s ease;
                }

                .room-card:hover {
                    transform: translateY(-3px);
                }

                .room-image-container {
                    width: 300px;
                    height: 220px;
                    flex-shrink: 0;
                    position: relative;
                    overflow: hidden;
                }

                .room-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s;
                }

                .room-card:hover .room-image {
                    transform: scale(1.03);
                }

                .room-content {
                    flex: 1;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                }

                .room-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .room-header h3 {
                    margin: 0;
                    font-size: 20px;
                    color: #2c3e50;
                }

                .price-tag {
                    background: #3498db;
                    color: white;
                    padding: 5px 10px;
                    border-radius: 20px;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .room-details {
                    flex: 1;
                }

                .description {
                    color: #7f8c8d;
                    font-size: 14px;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                }

                .capacity {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #2c3e50;
                    margin-bottom: 15px;
                    font-size: 14px;
                }

                .comforts-section {
                    margin-bottom: 20px;
                }

                .comforts-section h4 {
                    margin: 0 0 8px 0;
                    font-size: 16px;
                    color: #2c3e50;
                }

                .comforts-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    font-size: 13px;
                    color: black;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .comforts-list li {
                    background: #f0f7ff;
                    color: #3498db;
                    padding: 4px 10px;
                    border-radius: 12px;
                }

                .room-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: auto;
                }

                .action-btn {
                    flex: 1;
                    padding: 10px;
                    text-align: center;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: all 0.3s;
                    text-decoration: none;
                }

                .action-btn.primary {
                    background-color: #3498db;
                    color: white;
                }

                .action-btn.primary:hover {
                    background-color: #2980b9;
                }

                .action-btn.secondary {
                    background-color: #f5f5f5;
                    color: #2c3e50;
                }

                .action-btn.secondary:hover {
                    background-color: #e0e0e0;
                }

                .no-rooms {
                    text-align: center;
                    padding: 40px;
                    color: #7f8c8d;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }

                .loading-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .loading-spinner {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 300px;
                }

                .spinner {
                    animation: spin 1s linear infinite;
                    font-size: 50px;
                    margin-bottom: 20px;
                    color: #3498db;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .error-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .error-message {
                    background-color: #fdecea;
                    padding: 20px;
                    border-radius: 6px;
                    color: #e74c3c;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    justify-content: center;
                    margin-top: 50px;
                }

                .availability-status {
                    margin: 15px 0;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .available {
                    color: #27ae60;
                }

                .available span {
                    font-weight: bold;
                }

                .not-available {
                    color: #e74c3c;
                }

                .not-available span {
                    font-weight: bold;
                }

                @media (max-width: 992px) {
                    .main-content {
                        flex-direction: column;
                    }

                    .filters-column {
                        width: 100%;
                        position: static;
                    }
                }

                @media (max-width: 768px) {
                    .filter-actions {
                        flex-direction: column;
                    }

                    .comforts-grid {
                        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    }

                    .comforts-scroll-container {
                        max-height: 250px;
                    }

                    .room-card {
                        flex-direction: column;
                    }

                    .room-image-container {
                        width: 100%;
                        height: 200px;
                    }
                }

                @media (max-width: 480px) {
                    .room-actions {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
};

export default RoomList;