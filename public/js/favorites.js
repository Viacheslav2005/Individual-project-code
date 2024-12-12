document.addEventListener('DOMContentLoaded', () => {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');

    favoriteButtons.forEach(button => {
        button.addEventListener('click', async () => {
            // const locationId = button.getAttribute('data-id');
            // console.log('ID заведения:', locationId);
            const locationId = button.getAttribute('data-id');

            try {
                const response = await fetch('http://localhost:3306/locations/favorites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ locationId }),
                    credentials: 'include', // Для работы с сессиями
                });
            
                if (!response.ok) {
                    throw new Error(`Ошибка сервера: ${response.statusText}`);
                }
            
                const data = await response.json();
                console.log('Успех:', data);
            } catch (error) {
                console.error('Ошибка запроса:', error);
            }
        });
    });
});
