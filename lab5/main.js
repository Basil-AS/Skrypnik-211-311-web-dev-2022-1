//==================================================//
// Получение поля поиска
var field = document.querySelector('.search-field');
// Получение кнопки поиска
let searchButton = document.querySelector('.search-btn');
// Получение элеменов автодополнения
let autoCompleteList = document.querySelector('.list-auto-completion');
var ul = document.getElementById('list');
// Получение списка фактов
let factsList = document.querySelector('.facts-list');
//==================================================//

//==================================================//
// Функция создания записи об авторе
function createAuthorElement(record) {
    // Если нет имени и фамилии то записываются пустые значения
    let user = record.user || { 'name': { 'first': '', 'last': '' } };
    let authorElement = document.createElement('div');
    authorElement.classList.add('author-name');
    authorElement.innerHTML = user.name.first + ' ' + user.name.last;
    return authorElement;
}

// Функция создания положительных голосов
function createUpvotesElement(record) {
    let upvotesElement = document.createElement('div');
    upvotesElement.classList.add('upvotes');
    upvotesElement.innerHTML = record.upvotes;
    return upvotesElement;
}

// Функция создания нижней части элементов контента
function createFooterElement(record) {
    let footerElement = document.createElement('div');
    footerElement.classList.add('item-footer');
    footerElement.append(createAuthorElement(record));
    footerElement.append(createUpvotesElement(record));
    return footerElement;
}

// Функция создания верхней части элементов контента
function createContentElement(record) {
    let contentElement = document.createElement('div');
    contentElement.classList.add('item-content');
    contentElement.innerHTML = record.text;
    return contentElement;
}

// Функция создания элементов контента
function createListItemElement(record) {
    let itemElement = document.createElement('div');
    itemElement.classList.add('facts-list-item');
    itemElement.append(createContentElement(record));
    itemElement.append(createFooterElement(record));
    return itemElement;
}

// Функция для отрисовки элементов контента
function renderRecords(records) {
    let factsList = document.querySelector('.facts-list');
    factsList.innerHTML = '';
    for (let i = 0; i < records.length; i++) {
        factsList.append(createListItemElement(records[i]));
    }
}

// Функция для создания информации о количестве записей
function setPaginationInfo(info) {
    document.querySelector('.total-count').innerHTML = info.total_count;
    let start = info.total_count && (info.current_page - 1) * info.per_page + 1;
    document.querySelector('.current-interval-start').innerHTML = start;
    let end = Math.min(info.total_count, start + info.per_page - 1);
    document.querySelector('.current-interval-end').innerHTML = end;
}

// Функция для создания кнопок навигации
function createPageBtn(page, classes = []) {
    let btn = document.createElement('button');
    classes.push('btn');
    for (cls of classes) {
        btn.classList.add(cls);
    }
    btn.dataset.page = page;
    btn.innerHTML = page;
    return btn;
}

// Функция для отрисовки кнопок навигации
function renderPaginationElement(info) {
    let btn;
    let paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    btn = createPageBtn(1, ['first-page-btn']);
    btn.innerHTML = 'Первая страница';
    if (info.current_page == 1) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);

    let buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('pages-btns');
    paginationContainer.append(buttonsContainer);

    let start = Math.max(info.current_page - 2, 1);
    let end = Math.min(info.current_page + 2, info.total_pages);
    for (let i = start; i <= end; i++) {
        btn = createPageBtn(i, i == info.current_page ? ['active'] : []);
        buttonsContainer.append(btn);
    }

    btn = createPageBtn(info.total_pages, ['last-page-btn']);
    btn.innerHTML = 'Последняя страница';
    if (info.current_page == info.total_pages) {
        btn.style.visibility = 'hidden';
    }
    if (info.total_count == 0) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);
}
//==================================================//

//==================================================//
// Функция для загрузки данных
function downloadData(page = 1, param) {
    let url = new URL(factsList.dataset.url);
    let perPage = document.querySelector('.per-page-btn').value;
    if (param) url.searchParams.append('q', param);
    url.searchParams.append('page', page);
    url.searchParams.append('per-page', perPage);
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function () {
        renderRecords(this.response.records);
        setPaginationInfo(this.response['_pagination']);
        renderPaginationElement(this.response['_pagination']);
    };
    xhr.send();
}

// Функция-обработчик для селектора (выбор количества записей на одной странице)
function perPageBtnHandler(event) {
    downloadData(1, field.value);
}

// Функция-обработчик для навигации по страницам, содержащих записи
function pageBtnHandler(event) {
    if (event.target.dataset.page) {
        downloadData(event.target.dataset.page, field.value);
        window.scrollTo(0, 0);
    }
}
//==================================================//

//==================================================//
// Функция для удаления массива (списка) автодополнения
function deleteArray() {
    ul.classList.add("hidden");
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }
}

// Функция-обработчик для кнопки поиска
function searchButtonHandler(event) {
    downloadData(1, field.value);
    deleteArray();
}

// Функция-обработчик для элементов списка автодополнения
function autocompleteLiHandler(event) {
    field.value = event.target.innerHTML;
    deleteArray();
};

// Функция для отрисовки элементов автодополнения
function renderAutocompleat(list) {
    // Если записей не получено
    if (list.length == 0) {
        // Назначение класса, который скрывает элемент (см. styles.css)
        ul.classList.add("hidden");
    } else {
        // Удаление класса, который скрывает элемент (см. styles.css)
        ul.classList.remove("hidden");
    }
    // Создание элемент-список для элементов автодополнения
    let listItems = document.createElement('ul');
    // Создание элементов списка
    for (let i = 0; i <= list.length - 1; i++) {
        // Создание элементов списка
        let li = document.createElement('li');
        // Запись значения элементов массива в элементы списка
        li.innerHTML = list[i];
        // Назначение обработчикам элементам списка
        li.onclick = autocompleteLiHandler;
        // Добавление элементов списка в список
        listItems.append(li);
    }
    // Добавление списка в структуру html документа
    ul.append(listItems);
};


// Функция-обработчик для обработки поля ввода и предложения вариантов
function autocompleteHandler() {
    deleteArray();

    let url = new URL(autoCompleteList.dataset.url);
    url.searchParams.append('q', field.value);

    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function (data) {
        renderAutocompleat(this.response);
    };
    xhr.send();
}
//==================================================//

//==================================================//
// Функция для загрузки данных и назначения обработчиков
window.onload = function () {
    // Загрузка данных
    downloadData();
    // Назначение обработчика для навигации по страницам записей
    document.querySelector('.pagination').onclick = pageBtnHandler;
    // Назначение обработчика для выбора количества отображаемых записей
    document.querySelector('.per-page-btn').onchange = perPageBtnHandler;


    // Назначение обработчика кнопке для поиска по запросу
    searchButton.onclick = searchButtonHandler;
    // Назначение обработчика для автодополнения вводимого запроса
    field.oninput = autocompleteHandler;
};
//==================================================//