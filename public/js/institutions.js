document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchBox = document.getElementById('search-box');
    const filterSelect = document.getElementById('filter-select');
    const institutionsList = document.getElementById('institutions-list');
    const pagination = document.getElementById('pagination');

    async function fetchData(page = 1) {
        const search = searchBox.value.trim();
        const filter = filterSelect.value;
    
        const queryParams = new URLSearchParams({ page, search, type: filter }).toString();
        const response = await fetch(`/admin/institutions?${queryParams}`, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    
        if (!response.ok) {
            console.error('Ошибка загрузки данных:', response.statusText);
            return;
        }
    
        const data = await response.json();
        updateUI(data);
    }

    function updateUI(data) {
        // Обновление списка заведений
        institutionsList.innerHTML = data.institutions.map(institution => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${institution.name}</strong>
                    <p>${institution.description || 'Описание отсутствует.'}</p>
                </div>
                <div>
                     <form action="/admin/institutions/delete/${institution.id}" method="POST">
                         <button type="submit" class="btn btn-danger">Удалить</button>
                     </form>
                     <!-- Ссылка на страницу редактирования -->
                     <a href="/admin/institutions/edit/${institution.id}" class="btn btn-secondary">Редактировать</a>
                </div>
            </li>
        `).join('');

        // Обновление пагинации
        pagination.innerHTML = `
            ${data.currentPage > 1
                ? `<li class="page-item"><a href="#" class="page-link" data-page="${data.currentPage - 1}">Предыдущая</a></li>` : ''}
            ${Array.from({ length: data.totalPages }, (_, i) => i + 1).map(page => `
                <li class="page-item">
                    ${page === data.currentPage
                        ? `<strong><a href="#" class="page-link" data-page="${page}">${page}</a></strong>`
                        : `<a href="#" class="page-link" data-page="${page}">${page}</a>`}
                </li>
            `).join('')}
            ${data.currentPage < data.totalPages
                ? `<li class="page-item"><a href="#" class="page-link" data-page="${data.currentPage + 1}">Следующая</a></li>` : ''}
        `;
    }

    // Обработчик формы поиска
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await fetchData();
    });

    // Обработчик пагинации
    pagination.addEventListener('click', async (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            await fetchData(page);
        }
    });
});
