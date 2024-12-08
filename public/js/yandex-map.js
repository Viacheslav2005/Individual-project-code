document.addEventListener('DOMContentLoaded', () => {
    ymaps.ready(init);

    let map;
    let markers = [];
    let currentMarker = null; // Для хранения текущей выбранной метки

    function init() {
        map = new ymaps.Map('map', {
            center: [54.7388, 55.9721], // Уфа
            zoom: 12
        });

        loadLocations();

        // Обработчик отправки формы поиска
        const searchForm = document.getElementById('search-form');
        searchForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Предотвращаем перезагрузку страницы
            searchLocations();
        });

        // Кнопка сброса поиска
        const resetButton = document.getElementById('reset-button');
        if (resetButton) {
            resetButton.addEventListener('click', resetSearch);
        }

        // Закрытие модального окна
        const modal = document.getElementById('modal');
        const closeBtn = document.querySelector('.close');
        closeBtn.onclick = () => modal.style.display = 'none';
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

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
            console.log('Данные заведения:', location); // Убедитесь, что данные приходят
    
            // Обновляем данные в модальном окне
            document.getElementById('modal-title').textContent = location.name || 'Название отсутствует';
            document.getElementById('modal-description').textContent = location.description || 'Описание отсутствует.';
            document.getElementById('modal-address').textContent = location.address || 'Адрес не указан.';
            document.getElementById('modal').style.display = 'block';
        } catch (error) {
            console.error('Ошибка загрузки информации об организации:', error);
        }
    }

    // async function openModal(id) {
    //     if (!id) {
    //         console.error('Ошибка: ID не передан в openModal!');
    //         return;
    //     }
    
    //     try {
    //         const response = await fetch(`/api/location/${id}`);
    //         if (!response.ok) {
    //             console.error(`Ошибка загрузки данных: ${response.status}`);
    //             alert('Не удалось загрузить данные заведения.');
    //             return;
    //         }
    //         const location = await response.json();
    //         console.log('Данные заведения:', location);
    
    //         // Обновляем данные в модальном окне
    //         document.getElementById('modal-title').textContent = location.name || 'Название отсутствует';
    //         document.getElementById('modal-description').textContent = location.description || 'Описание отсутствует.';
    //         document.getElementById('modal-address').textContent = location.address || 'Адрес не указан.';
    
    //         // Проверяем авторизацию
    //         const authResponse = await fetch('/auth/check');
    //         const isAuthenticated = authResponse.ok;
    
    //         const favoritesButton = document.getElementById('add-to-favorites');
    //         if (isAuthenticated) {
    //             favoritesButton.style.display = 'inline-block'; // Показываем кнопку
    //             favoritesButton.onclick = async () => {
    //                 try {
    //                     const favResponse = await fetch('/favorites/add', {
    //                         method: 'POST',
    //                         headers: {
    //                             'Content-Type': 'application/json',
    //                         },
    //                         body: JSON.stringify({ locationId: id }),
    //                     });
    
    //                     const result = await favResponse.json();
    //                     if (favResponse.ok) {
    //                         alert(result.message);
    //                     } else {
    //                         alert(result.error || 'Не удалось добавить в избранное.');
    //                     }
    //                 } catch (error) {
    //                     console.error('Ошибка добавления в избранное:', error);
    //                 }
    //             };
    //         } else {
    //             favoritesButton.style.display = 'none'; // Скрываем кнопку
    //         }
    
    //         // Показываем модальное окно
    //         document.getElementById('modal').style.display = 'block';
    //     } catch (error) {
    //         console.error('Ошибка загрузки информации об организации:', error);
    //     }
    // }
    
    // async function openModal(id) {
    //     if (!id) {
    //         console.error('Ошибка: ID не передан в openModal!');
    //         return;
    //     }
    
    //     try {
    //         const response = await fetch(`/api/location/${id}`);
    //         if (!response.ok) {
    //             console.error(`Ошибка загрузки данных: ${response.status}`);
    //             alert('Не удалось загрузить данные заведения.');
    //             return;
    //         }
    //         const location = await response.json();
    //         console.log('Данные заведения:', location);
    
    //         // Обновляем данные в модальном окне
    //         document.getElementById('modal-title').textContent = location.name || 'Название отсутствует';
    //         document.getElementById('modal-description').textContent = location.description || 'Описание отсутствует.';
    //         document.getElementById('modal-address').textContent = location.address || 'Адрес не указан.';
    
    //         // Проверяем авторизацию
    //         const authResponse = await fetch('/auth/check');
    //         const isAuthenticated = authResponse.ok;
    
    //         const favoritesButton = document.getElementById('add-to-favorites');
    //         if (isAuthenticated) {
    //             favoritesButton.style.display = 'inline-block'; // Показываем кнопку
    //             favoritesButton.onclick = async () => {
    //                 try {
    //                     const favResponse = await fetch('/locations/favorite', {
    //                         method: 'POST',
    //                         headers: {
    //                             'Content-Type': 'application/json',
    //                         },
    //                         body: JSON.stringify({ locationId: id }), // Убедитесь, что id передается корректно
    //                     });
    
    //                     const result = await favResponse.json();
    //                     if (favResponse.ok) {
    //                         alert(result.message);
    //                     } else {
    //                         alert(result.error || 'Не удалось добавить в избранное.');
    //                     }
    //                 } catch (error) {
    //                     console.error('Ошибка добавления в избранное:', error);
    //                 }
    //             };
    //         } else {
    //             favoritesButton.style.display = 'none'; // Скрываем кнопку
    //         }
    
    //         // Показываем модальное окно
    //         document.getElementById('modal').style.display = 'block';
    //     } catch (error) {
    //         console.error('Ошибка загрузки информации об организации:', error);
    //     }
    // }
    


    // Очистка всех маркеров
    function clearMarkers() {
        markers.forEach(marker => map.geoObjects.remove(marker));
        markers = [];
    }

    // Сброс поиска и отображение всех меток
    function resetSearch() {
        // Очищаем поле поиска
        const searchInput = document.getElementById('search-box');
        if (searchInput) {
            searchInput.value = '';
        }

        // Показываем все метки
        loadLocations();

        // Закрываем все модальные окна
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'none';
        }

        // Закрываем дополнительное модальное окно, если оно было открыто
        const extraModal = document.getElementById('extra-modal');
        if (extraModal) {
            extraModal.style.display = 'none';
        }
    }
});
