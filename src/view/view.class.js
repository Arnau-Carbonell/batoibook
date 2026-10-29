export default class View {
    constructor() {
        this.booksList = document.getElementById('list');
        this.about = document.getElementById('about');
        this.form = document.getElementById('form');
        this.bookForm = document.getElementById('bookForm');
        this.moduleSelect = document.getElementById('moduleCode');
        this.remove = document.getElementById('remove');
        this.removeInput = document.getElementById('id-remove');
        this.removeButton = document.getElementById('remove-button');
        this.messages = document.getElementById('messages');
    }

    renderModulesSelect(modules) {
        modules.forEach(module => {
            const option = document.createElement('option');
            option.value = module.code;
            option.textContent = module.cliteral;
            this.moduleSelect.appendChild(option);
        });
    }

    renderBooksList(books, modules = []) {
        this.booksList.innerHTML = '';
        books.forEach(book => this.renderBook(book, modules.find(module => module.code === book.moduleCode)));
    }

    renderBook(book, module) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = book.id;
        card.innerHTML = `
            <div class="card-img">
                <img src="${book.photos}" alt="Libro: ${book.id}">
            </div>
            <div class="card-body">
                <h3>${module ? module.cliteral : book.moduleCode} (${book.id})</h3>
                <h4>${book.publisher}</h4>
                <p>${book.pages} páginas</p>
                <p>Estado: ${book.status}</p>
                <p>${book.soldDate ? 'Vendido el ' + new Date(book.soldDate).toLocaleDateString('es-ES') : 'En venta'}</p>
                <p>${book.comments}</p>
                <h4>${book.price} €</h4>
            </div>`;
        this.booksList.appendChild(card);
        return card;
    }

    removeBook(bookId) {
        const card = this.booksList.querySelector(`.card[data-id="${bookId}"]`);
        if (card) {
            card.remove();
        }
    }

    getBookFormValues() {
        const data = new FormData(this.bookForm);
        return {
            userId: Number(data.get('userId')),
            moduleCode: data.get('moduleCode'),
            publisher: data.get('publisher'),
            price: Number(data.get('price')),
            pages: Number(data.get('pages')),
            status: data.get('status'),
            photo: data.get('photo'),
            comments: data.get('comments'),
            soldDate: data.get('soldDate'),
        };
    }

    getRemoveId() {
        return this.removeInput.value.trim();
    }

    resetForm() {
        this.bookForm.reset();
    }

    bindAddBook(handler) {
        this.bookForm.addEventListener('submit', event => {
            event.preventDefault();
            handler(this.getBookFormValues());
        });
    }

    bindRemoveBook(handler) {
        this.removeButton.addEventListener('click', () => {
            const bookId = this.getRemoveId();
            if (bookId === '') {
                this.showMessage('error', 'Debes indicar la id del libro a borrar');
                return;
            }
            handler(bookId);
        });
    }

    showMessage(type, message) {
        const div = document.createElement('div');
        div.className = `${type} alert alert-${type} alert-dismissible`;
        div.setAttribute('role', 'alert');
        div.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" onclick="this.parentElement.remove()">x</button>`;
        div.querySelector('.btn-close').addEventListener('click', () => div.remove());
        this.messages.appendChild(div);

        if (type !== 'error') {
            setTimeout(() => div.remove(), 3000);
        }
    }
}
