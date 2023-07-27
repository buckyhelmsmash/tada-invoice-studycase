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

    function updateInvoice(updatedInvoice: Invoice) {
        const index = invoices.value.findIndex((invoice) => invoice.id === updatedInvoice.id);
        if (index !== -1) {
            invoices.value.splice(index, 1, updatedInvoice);
            saveInvoices(invoices.value);
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
        updateInvoice,
        deleteInvoice,
    };
}