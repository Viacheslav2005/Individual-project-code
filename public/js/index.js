document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchBox = document.getElementById('search-box');
    const filterSelect = document.getElementById('filter-select');
    const institutionsList = document.getElementById('institutions-list');
    const pagination = document.getElementById('pagination');


    async function fetchData(page = 1) {
        const search = searchBox?.value.trim();
        const filter = filterSelect?.value;

        const queryParams = new URLSearchParams({ page, search, type: filter }).toString();
        const response = await fetch(`/?${queryParams}`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });

        if (!response.ok) {
            console.error('Ошибка загрузки данных:', response.statusText);
            return;
        }

        const data = await response.json();
        updateUI(data);
    }


    function updateUI(data) {
        // Генерация списка заведений
        institutionsList.innerHTML = data.institutions.map(inst => `
            <li>
                <a href="/institution/${inst.id}">${inst.name}</a>
                <p>${inst.description || 'Описание отсутствует'}</p>
                ${user
                    ? `<button 
                        class="btn btn-success favorite-btn ${data.favorites?.includes(inst.id) ? 'added-to-favorites' : ''}" 
                        data-id="${inst.id}" 
                        ${data.favorites?.includes(inst.id) ? 'disabled' : ''}>
                        ${data.favorites?.includes(inst.id) ? 'Добавлено' : 'Добавить в избранное'}
                    </button>` 
                    : ''}
                <a href="/reviews/${inst.id}" class="btn btn-primary">Отзывы</a>
            </li>
            
        `).join('');
    
        // Генерация пагинации
        pagination.innerHTML = `
            ${data.currentPage > 1
                ? `<li><a href="#" class="page-link" data-page="${data.currentPage - 1}">Предыдущая</a></li>` : ''}
            ${Array.from({ length: data.totalPages }, (_, i) => i + 1).map(page => `
                <li>
                    ${page === data.currentPage
                        ? `<strong><a href="#" class="page-link" data-page="${page}">${page}</a></strong>`
                        : `<a href="#" class="page-link" data-page="${page}">${page}</a>`}
                </li>
            `).join('')}
            ${data.currentPage < data.totalPages
                ? `<li><a href="#" class="page-link" data-page="${data.currentPage + 1}">Следующая</a></li>` : ''}
        `;
    
        // Привязка событий для кнопок "Добавить в избранное"
        const favoriteButtons = document.querySelectorAll('.favorite-btn');
        favoriteButtons.forEach(button => {
            if (!button.classList.contains('added-to-favorites')) {
                button.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const institutionId = button.getAttribute('data-id');
                    await addToFavorites(institutionId);
    
                    // Обновление кнопки после успешного добавления
                    button.textContent = 'Добавлено';
                    button.disabled = true;
                    button.classList.add('added-to-favorites');
                });
            }
        });
    
        // Привязка событий для пагинации
        const paginationLinks = document.querySelectorAll('#pagination a');
        paginationLinks.forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                await fetchData(page);
            });
        });
    }

    async function addToFavorites(institutionId) {
        try {
            // Отправляем запрос на добавление в избранное
            const response = await fetch('/add-favorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ institutionId }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Ошибка сервера');
            }
    
            // Проверяем, что сервер вернул корректный JSON
            const result = await response.json();
    
            // Обработка ответа
            if (response.ok && result.success) {
                alert(result.message); // Сообщение об успешном добавлении
    
                // Находим соответствующую кнопку
                const button = document.querySelector(`.favorite-btn[data-id="${institutionId}"]`);
                if (button) {
                    button.textContent = 'Добавлено'; // Меняем текст кнопки
                    button.disabled = true; // Делаем кнопку неактивной
                    button.classList.add('added-to-favorites'); // Добавляем класс для стилизации, если нужно
                }
            } else {
                // Если сервер вернул ошибку
                alert(result.message || 'Не удалось добавить в избранное.');
            }
        } catch (error) {
            // Обработка ошибок сети или других неполадок
            console.error('Ошибка при добавлении в избранное:', error);
            alert('Произошла ошибка при добавлении в избранное. Попробуйте позже.');
        }
    }

    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await fetchData();
        });
    }

    if (pagination) {
        pagination.addEventListener('click', async (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                await fetchData(page);
            }
        });
    }

    fetchData(); // Инициализация данных при загрузке страницы
});
