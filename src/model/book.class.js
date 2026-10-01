export default class Book {
    constructor(bookData) {
        this.id = bookData.id;
        this.userId = bookData.userId;
        this.moduleCode = bookData.moduleCode;
        this.publisher = bookData.publisher;
        this.price = bookData.price;
        this.pages = bookData.pages;
        this.status = bookData.status;
        this.photos = bookData.photos ?? bookData.photo ?? "";
        this.comments = bookData.comments ?? "";
        this.soldDate = bookData.soldDate ?? "";
    }
}