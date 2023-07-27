// Invoice.ts
export interface Invoice {
    id: string;
    amount: number;
    status: 'draft' | 'pending' | 'paid';
    sender: {
        streetAddress: string;
        city: string;
        postCode: number;
        country: string;
    };
    client: {
        name: string;
        email: string;
        streetAddress: string;
        city: string;
        postCode: number;
        country: string;
    };
    dueDate: Date;
    itemList: {
        item_name: string;
        qty: number;
        price: number;
        total: number;
    }[];
}
