let createNewTask = document.querySelector('.create-new-task');
let taskTemplate = document.querySelector('#task-template');
let listToDo = document.querySelector('#ToDo ul');
let listDone = document.querySelector('#Done ul');
let url = new URL('http://tasks-api.std-900.ist.mospolytech.ru/api/tasks?api_key=50d2199a-42dc-447d-81ed-d68a443b697e');
let alertSuccess = document.querySelector('.alert-success');
let alertDanger = document.querySelector('.alert-danger');
let spanError = document.querySelector('.error');

let titles = {
    create: 'Новая задача',
    edit: 'Редактирование',
    show: 'Просмотр задачи',
}

let titlesBtn = {
    create: 'Создать',
    edit: 'Сохранить',
    show: 'ОК',
}

//Функция создания задачи
// передаём в эту ф-ю значения name, desc и status
async function createTask(name, desc, status) {
    let taskCreateData = new FormData();
    taskCreateData.append('name', name);
    taskCreateData.append('desc', desc);
    taskCreateData.append('status', status);

    let response = await fetch(url, { method: 'POST', body: taskCreateData });
    if (response.ok) {
        let responsePars = await response.json();
        alertSuccess.classList.remove('d-none');
        return responsePars;
    } else {
        spanError.innerHTML = response.status;
        alertDanger.classList.remove('d-none');
    }
}
// загрузка задач
async function loadTasks() {
    let response = await fetch(url);
    if (response.ok) {
        response = await response.json();
    } else {
        spanError.innerHTML = response.status;
        alertDanger.classList.remove('d-none');
    }
    for (let i = 0; i < response.tasks.length; i++) {
        let taskValue = response.tasks[i];
        let task = createElemTask(taskValue);
        console.log(taskValue.name, taskValue.id);
        taskValue.status == "to-do" ? listToDo.append(task) : listDone.append(task);
    }

}

// на основе шаблона генерирует элемент новой задачи и заполняет его содержимым
function createElemTask(task) {
    let taskLi = taskTemplate.content.firstElementChild.cloneNode(true);
    taskLi.id = task.id;
    let name = taskLi.querySelector('.task-name');
    name.innerHTML = task.name;
    return taskLi;
}

// добавление задачи в список + изм-е кнопок на ред-е + на просмотр
async function createNewTaskHandler(event) {
    // поиск среди потомков closest
    let modalWindow = event.target.closest('.modal');
    let formInputs = modalWindow.querySelector('form').elements;
    let name = formInputs['task-name'].value;
    let desc = formInputs['task-desc'].value;
    let status = formInputs['task-status'].value;
    let action = formInputs['action'].value;

    //получаем значение id 
    let taskId = formInputs['task-id'].value;

    if (action == 'create') {
        let task = await createTask(name, desc, status); //
        let taskLi = createElemTask(task); //
        status == "to-do" ? listToDo.append(taskLi) : listDone.append(taskLi);
    } else
        if (action == 'edit') {
            let taskData = new FormData();
            taskData.append('name', name);
            taskData.append('desc', desc);

            url.pathname += '/' + taskId;
            let response = await fetch(url, { method: 'PUT', body: taskData });
            if (response.ok) {
                alertSuccess.classList.remove('d-none');
            } else {
                spanError.innerHTML = response.status;
                alertDanger.classList.remove('d-none');
            }
            url.pathname = '/api/tasks';

            document.getElementById(taskId).querySelector('.task-name').innerHTML = name;
        }
    formInputs['task-status'].closest('.row').classList.remove('d-none');
    modalWindow.querySelector('form').reset(); //обнуляем форму после создания новой задачи
}

//подсчёт кол-ва задач
function updateCounters(event) {
    let card = event.target.closest('.card');
    let counterTasks = card.querySelector('.counter-tasks');
    let count = event.target.children.length;
    counterTasks.innerHTML = count;
}

//ОПЦИИ
//удаление - появление модального окна с именем задачи
async function deleteTaskHandler(event) {
    let modalWindow = event.target.closest('.modal');
    let taskId = event.relatedTarget.closest('.task').id; //ищем элемент li, внутри которого лежит интересующий id 
    url.pathname += '/' + taskId;

    let response = await fetch(url);
    response = await response.json();
    url.pathname = '/api/tasks';

    let span = modalWindow.querySelector('.name-task');
    span.innerHTML = response.name;
    let form = modalWindow.querySelector('form');
    form.elements['task-id'].value = taskId;
}

async function deleteTaskBtnHandler(event) {
    //получаем значение id 
    let form = event.target.closest('.modal').querySelector('form');
    let taskId = form.elements['task-id'].value;
    url.pathname += '/' + taskId;
    let responseFromServer = await fetch(url, { method: 'DELETE' });
    if (responseFromServer.ok) {
        responseFromServer = await responseFromServer.json();
        alertSuccess.classList.remove('d-none');
    } else {
        spanError.innerHTML = responseFromServer.status;
        alertDanger.classList.remove('d-none');
    }

    url.pathname = '/api/tasks';
    // localStorage.removeItem(`task-${taskId}`);
    let task = document.getElementById(taskId);
    task.remove();
}

// перемещение задач по спискам
async function arrowHandler(event) {
    let taskId = event.target.closest('.task').id;
    url.pathname += '/' + taskId;
    let task = await fetch(url);
    task = await task.json();

    task['status'] == "to-do" ? task['status'] = "done" : task['status'] = "to-do";
    let switchTask = document.getElementById(taskId);
    task['status'] == "to-do" ? listToDo.append(switchTask) : listDone.append(switchTask);

    let formData = new FormData();
    formData.append('status', task.status);
    let response = await fetch(url, { method: 'PUT', body: formData });
    url.pathname = '/api/tasks';
}

//редактирование
async function actionModalHandler(event) {
    let action = event.relatedTarget.dataset.action; //узнаём, какое действие сейчас выполняет пользователь
    let form = event.target.querySelector('form');
    form.elements['action'].value = action;
    event.target.querySelector('.modal-title').innerHTML = titles[action];
    event.target.querySelector('.create-new-task').innerHTML = titlesBtn[action];

    if (action != 'show') {
        form['task-name'].removeAttribute('disabled');
        form['task-desc'].removeAttribute('disabled');
    } else {
        form.elements['task-name'].setAttribute('disabled', 1);
        form.elements['task-desc'].setAttribute('disabled', 1);
    }

    if (action == 'edit' || action == 'show') {
        let taskId = event.relatedTarget.closest('.task').id;
        form.elements['task-id'].value = taskId;

        url.pathname += '/' + taskId;
        let task = await fetch(url);
        task = await task.json();
        url.pathname = '/api/tasks';
        form.elements['task-name'].value = task.name;
        form.elements['task-desc'].value = task.desc;
        form.elements['task-status'].closest('.row').classList.add('d-none');

    } else
        if (action == 'create') {
            form.reset(); //обнуляем форму
            form.elements['task-status'].closest('.row').classList.remove('d-none');
        }
}

window.onload = async function () {
    createNewTask.addEventListener('click', createNewTaskHandler);

    listToDo.addEventListener('DOMSubtreeModified', updateCounters);
    listDone.addEventListener('DOMSubtreeModified', updateCounters);

    await loadTasks();

    let modalDel = document.getElementById('del-task');
    modalDel.addEventListener('show.bs.modal', deleteTaskHandler); //show.bs.modal срабатывает сразу после нажатия на кнопку, но до того, как окно показывается пользователю

    let deleteBtn = document.getElementsByClassName('delete-task-btn')[0];
    deleteBtn.addEventListener('click', deleteTaskBtnHandler);

    let arrows = document.querySelectorAll('.arrow');
    for (let i = 0; i < arrows.length; i++) {
        arrows[i].addEventListener('click', arrowHandler); //стрелки
    }

    let actionModal = document.getElementById('new-task');
    actionModal.addEventListener('show.bs.modal', actionModalHandler);
}