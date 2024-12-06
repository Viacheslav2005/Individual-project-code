document.addEventListener('DOMContentLoaded', () => {
    ymaps.ready(init);

    let map;
    let markers = [];

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
            const results = await response.json();
            clearMarkers();
            addMarkers(results);
        } catch (error) {
            console.error('Ошибка поиска:', error);
        }
    }

    function addMarkers(locations) {
        locations.forEach(location => {
            const marker = new ymaps.Placemark(
                [parseFloat(location.latitude), parseFloat(location.longitude)],
                { balloonContent: location.name }
            );

            marker.events.add('click', () => openModal(location.id));

            map.geoObjects.add(marker);
            markers.push(marker);
        });
    }

    async function openModal(locationId) {
        try {
            const response = await fetch(`/api/location/${locationId}`);
            const location = await response.json();

            document.getElementById('modal-title').textContent = location.name;
            document.getElementById('modal-description').textContent = location.description || 'Описание отсутствует.';
            document.getElementById('modal-address').textContent = location.address;

            document.getElementById('modal').style.display = 'block';
        } catch (error) {
            console.error('Ошибка загрузки информации об организации:', error);
        }
    }

    function clearMarkers() {
        markers.forEach(marker => map.geoObjects.remove(marker));
        markers = [];
    }
});
