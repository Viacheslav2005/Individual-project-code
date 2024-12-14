document.addEventListener('DOMContentLoaded', () => {
    ymaps.ready(init);

    let map;
    let markers = [];
    let currentMarker = null; // Для хранения текущей выбранной метки

    function init() {
        map = new ymaps.Map('map', {
            center: [54.7388, 55.9721],
            zoom: 12,
        });

        loadLocations();

        document.getElementById('filter-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const type = document.getElementById('type').value;
            loadLocations(type);
        });

        document.getElementById('search-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('search-box').value.trim();
            if (query) searchLocations(query);
        });

        document.getElementById('reset-button').addEventListener('click', () => {
            document.getElementById('search-box').value = '';
            document.getElementById('type').value = '';
            loadLocations();
        });

        document.querySelector('.close').onclick = () => {
            document.getElementById('modal').style.display = 'none';
        };

        window.onclick = (event) => {
            if (event.target === document.getElementById('modal')) {
                document.getElementById('modal').style.display = 'none';
            }
        };
    }

    // Загружаем локации на карту
    async function loadLocations(type = '') {
        try {
            const response = await fetch(`/api/locations?type=${encodeURIComponent(type)}`);
            const locations = await response.json();
            clearMarkers();
            addMarkers(locations);
        } catch (error) {
            console.error('Ошибка загрузки меток:', error);
        }
    }

    // Поиск локаций
    async function searchLocations(query) {
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            clearMarkers();
            addMarkers(results);
        } catch (error) {
            console.error('Ошибка поиска:', error);
        }
    }



    // Функция для получения иконки в зависимости от типа заведения
    function getIconForType(type) {
        switch (type) {
            case 'school':
                return 'images/school_icon.png';
            case 'college':
                return 'images/college_icon.png';
            case 'university':
                return 'images/university_icon.png';
            default:
                return 'images/default_icon.png'; // По умолчанию
        }
    }

    // Обработчик формы фильтрации
    document.getElementById('filter-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('type').value; // Получаем значение типа
        loadLocations(type); // Загружаем данные с учетом выбранного типа
    });

    // Загружаем все метки на карту
    async function loadLocations() {
        try {
            const response = await fetch('/api/locations');
            const locations = await response.json();
            addMarkers(locations);
        } catch (error) {
            console.error('Ошибка загрузки меток:', error);
        }
    }

    async function searchLocations() {
        const query = document.getElementById('search-box').value.trim();
        if (!query) return;
    
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                console.error(`Ошибка поиска: ${response.status}`);
                alert('Введите название заведения.');
                return;
            }
    
            const results = await response.json();
            if (!results || results.length === 0) {
                console.warn('Результаты поиска пусты.');
                return;
            }
    
            results.forEach(result => {
                if (!result.id) {
                    console.error('Ошибка: ID отсутствует в результате поиска:', result);
                }
            });
    
            clearMarkers();
            addMarkers(results);
        } catch (error) {
            console.error('Ошибка поиска:', error);
        }
    }

    function addMarkers(locations) {
        locations.forEach(location => {
            if (!location.latitude || !location.longitude || !location.id) {
                console.warn('Пропущена локация из-за отсутствия данных:', location);
                return;
            }
    
            // Создаем содержимое балуна
            // const balloonContent = `
            //     <div class="balloon-content">
            //         <h3 class="balloon-title">${location.name || 'Название отсутствует'}</h3>
            //         <p class="balloon-description">${location.description || 'Описание отсутствует.'}</p>
            //         <p class="balloon-address">${location.address || 'Адрес не указан.'}</p>
            //     </div>
            // `;
    
            // Создаем маркер с привязкой ID
            const marker = new ymaps.Placemark(
                [parseFloat(location.latitude), parseFloat(location.longitude)],
                {
                    // balloonContent: balloonContent, //Убрать
                    id: location.id, // Сохраняем ID в свойствах метки
                },
                {
                    // balloonContentLayout: ymaps.templateLayoutFactory.createClass('<div class="custom-balloon">{{ properties.balloonContent | raw }}</div>'),
                    // hideIconOnBalloonOpen: false,
                }
            );
    
            // Добавляем обработчик клика
            marker.events.add('click', () => {
                const locationId = marker.properties.get('id'); // Получаем ID из свойств метки
                if (!locationId) {
                    console.error('Ошибка: ID отсутствует для метки!');
                    return;
                }
                console.log('Клик по метке, ID:', locationId);
                openModal(locationId); // Открываем модальное окно с ID
            });
    
            map.geoObjects.add(marker);
            markers.push(marker);
        });
    }

    async function openModal(id) {
        if (!id) {
            console.error('Ошибка: ID не передан в openModal!');
            return;
        }

        try {
            const response = await fetch(`/api/location/${id}`);
            if (!response.ok) {
                console.error(`Ошибка загрузки данных: ${response.status}`);
                alert('Не удалось загрузить данные заведения.');
                return;
            }

            const location = await response.json();
            const modal = document.getElementById('modal');
            const favoritesButton = document.getElementById('add-to-favorites');

            // Заполняем модальное окно данными
            document.getElementById('modal-title').textContent = location.name || 'Название отсутствует';
            document.getElementById('modal-description').textContent = location.description || 'Описание отсутствует.';
            document.getElementById('modal-address').textContent = location.address || 'Адрес не указан.';

            const isAuthenticated = (await fetch('/auth/check')).ok;
            if (isAuthenticated) {
                const favoritesResponse = await fetch('/api/user-favorites', {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });

                let isInFavorites = false;
                if (favoritesResponse.ok) {
                    const favorites = await favoritesResponse.json();
                    isInFavorites = favorites.some(fav => fav.id === id);
                }

                if (isInFavorites) {
                    favoritesButton.textContent = 'Добавлено';
                    favoritesButton.disabled = true;
                } else {
                    favoritesButton.textContent = 'Добавить в избранное';
                    favoritesButton.disabled = false;
                    favoritesButton.onclick = async () => {
                        try {
                            const favResponse = await fetch('/add-favorite', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ institutionId: id }),
                            });

                            if (!favResponse.ok) {
                                console.error('Ошибка добавления в избранное');
                                return;
                            }

                            const result = await favResponse.json();
                            if (result.success) {
                                alert(result.message || 'Добавлено в избранное.');
                                favoritesButton.textContent = 'Добавлено';
                                favoritesButton.disabled = true;
                            }
                        } catch (error) {
                            console.error('Ошибка добавления в избранное:', error);
                        }
                    };
                }

                favoritesButton.style.display = 'inline-block';
            } else {
                favoritesButton.style.display = 'none';
            }

            modal.style.display = 'block';
        } catch (error) {
            console.error('Ошибка загрузки информации об организации:', error);
        }
    }
    

    // Очистка всех маркеров
    function clearMarkers() {
        markers.forEach(marker => map.geoObjects.remove(marker));
        markers = [];
    }

    function resetSearch() {
        document.getElementById('search-box').value = ''; // Сбрасываем поле поиска
        document.getElementById('type').value = ''; // Сбрасываем фильтр типа
        loadLocations(); // Загрузка всех локаций

        // // Закрываем все модальные окна
        // const modal = document.getElementById('modal');
        // if (modal) {
        //     modal.style.display = 'none';
        // }

        // // Закрываем дополнительное модальное окно, если оно было открыто
        // const extraModal = document.getElementById('extra-modal');
        // if (extraModal) {
        //     extraModal.style.display = 'none';
        // }
    }

    // // Сброс поиска и отображение всех меток
    // function resetSearch() {
    //     // Очищаем поле поиска
    //     const searchInput = document.getElementById('search-box');
    //     if (searchInput) {
    //         searchInput.value = '';
    //     }

    //     // Показываем все метки
    //     loadLocations();

    //     // Закрываем все модальные окна
    //     const modal = document.getElementById('modal');
    //     if (modal) {
    //         modal.style.display = 'none';
    //     }

    //     // Закрываем дополнительное модальное окно, если оно было открыто
    //     const extraModal = document.getElementById('extra-modal');
    //     if (extraModal) {
    //         extraModal.style.display = 'none';
    //     }
    // }
});

