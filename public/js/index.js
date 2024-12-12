document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchBox = document.getElementById('search-box');
    const filterSelect = document.getElementById('filter-select');
    const institutionsList = document.getElementById('institutions-list');
    const pagination = document.getElementById('pagination');

    // Проверяем, определён ли user
    console.log('User:', typeof user !== 'undefined' ? user : 'undefined'); // Для отладки

    async function fetchData(page = 1) {
        const search = searchBox.value.trim();
        const filter = filterSelect.value;

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
        // Обновление списка заведений
        institutionsList.innerHTML = data.institutions.map(inst => `
            <li>
                <a href="/institution/${inst.id}">${inst.name}</a>
                <p>${inst.description || 'Описание отсутствует'}</p>
                ${typeof user !== 'undefined' && user 
                    ? `<button class="favorite-btn" data-id="${inst.id}">Добавить в избранное</button>` 
                    : ''}
            </li>
        `).join('');

        // Обновление пагинации
        pagination.innerHTML = `
            ${data.currentPage > 1
                ? `<li><a href="#" data-page="${data.currentPage - 1}">Предыдущая</a></li>` : ''}
            ${Array.from({ length: data.totalPages }, (_, i) => i + 1).map(page => `
                <li>
                    ${page === data.currentPage
                        ? `<strong>${page}</strong>`
                        : `<a href="#" data-page="${page}">${page}</a>`}
                </li>
            `).join('')}
            ${data.currentPage < data.totalPages
                ? `<li><a href="#" data-page="${data.currentPage + 1}">Следующая</a></li>` : ''}
        `;
    }

    // Обработчики событий
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await fetchData();
    });

    pagination.addEventListener('click', async (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            await fetchData(page);
        }
    });
});
