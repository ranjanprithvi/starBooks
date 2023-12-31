import { Book } from "./book";
import { User } from "./user";

export interface Rental {
    _id: string;
    book: Book;
    user: User;
    dateReturned?: Date;
}

export interface RentalQuery {
    search?: string;
    sortBy?: string;
    populate?: string;
}
