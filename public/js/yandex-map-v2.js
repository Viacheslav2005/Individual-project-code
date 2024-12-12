document.addEventListener('DOMContentLoaded', () => {
    ymaps.ready(init);

    function init() {
        const map = new ymaps.Map('map', {
            center: [54.7388, 55.9721], // Уфа
            zoom: 12,
        });

        // Создаём перемещаемый маркер
        const placemark = new ymaps.Placemark(map.getCenter(), {}, {
            draggable: true, // Делаем маркер перемещаемым
        });

        map.geoObjects.add(placemark);

        // Обновляем широту и долготу при перемещении маркера
        placemark.events.add('dragend', () => {
            const coords = placemark.geometry.getCoordinates();
            document.getElementById('latitude').value = coords[0];
            document.getElementById('longitude').value = coords[1];
        });

        // Автообновление координат при вводе адреса
        const addressInput = document.getElementById('address');
        addressInput.addEventListener('blur', async () => {
            const address = addressInput.value.trim();
            if (!address) return;

            try {
                const geocode = await ymaps.geocode(address);

                if (geocode.geoObjects.getLength()) {
                    const coords = geocode.geoObjects.get(0).geometry.getCoordinates();
                    map.setCenter(coords, 15); // Центрируем карту
                    placemark.geometry.setCoordinates(coords); // Перемещаем маркер
                    document.getElementById('latitude').value = coords[0];
                    document.getElementById('longitude').value = coords[1];
                } else {
                    alert('Адрес не найден');
                }
            } catch (error) {
                console.error('Ошибка геокодирования:', error);
            }
        });
    }
});
