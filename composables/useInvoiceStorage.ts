// composables/useInvoiceStorage.js
import { ref, onMounted } from 'vue';
import { Invoice } from '~/types/Invoice';

// Save the invoices to localStorage
// Save the invoices to localStorage
function saveInvoices(invoices: Invoice[]) {
    if (process.client) {
        localStorage.setItem('invoices', JSON.stringify(invoices));
    }
}

// Get the invoices from localStorage
function getInvoices(): Invoice[] {
    if (process.client) {
        const storedInvoices = localStorage.getItem('invoices');
        if (storedInvoices) {
            return JSON.parse(storedInvoices);
        }
    }
    return [];
}

// Generate a random 5-digit ID
function generateRandomId(): string {
    return Math.floor(Math.random() * 90000) + 10000 + ''; // Generate a random 5-digit number as string
}

export function useInvoiceStorage() {
    const invoices = ref<Invoice[]>(getInvoices());

    function saveInvoice(invoice: Invoice) {
        invoice.id = generateRandomId(); // Set the ID to the generated random 5-digit number
        invoices.value.push(invoice);
        saveInvoices(invoices.value);
    }

    function getInvoiceById(invoiceId: string): Invoice | undefined {
        return invoices.value.find((invoice) => invoice.id === invoiceId);
    }

    function updateInvoice(updatedInvoice: Invoice, id: string): Invoice | null {
        const index = invoices.value.findIndex((invoice) => invoice.id === id);
        console.log("🌍 updatedInvoice", updatedInvoice);
        console.log("🌍 index updateInvoice", index);

        if (index !== -1) {
            Object.assign(invoices.value[index], updatedInvoice);
            saveInvoices(invoices.value);
            return invoices.value[index]; // Return the updated invoice
        } else {
            return null; // Return null if invoice with the specified ID is not found
        }
    }


    function deleteInvoice(invoiceId: string) {
        invoices.value = invoices.value.filter((invoice) => invoice.id !== invoiceId);
        saveInvoices(invoices.value);
    }

    // Save the invoices to localStorage when the component is mounted
    onMounted(() => {
        saveInvoices(invoices.value);
    });

    return {
        invoices,
        saveInvoice,
        getInvoiceById,
        updateInvoice,
        deleteInvoice,
    };
}