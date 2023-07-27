<template>
    <div class="main-container">
        <div class="main-header">
            <div>
                <h1>Invoices</h1>
                <h2>There are total 7 invoices</h2>
            </div>

            <div>
                <el-select v-model="filter" class="m-2" placeholder="Filter invoices" size="small">
                    <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>

                <el-button :icon="CirclePlus" size="large" round type="primary" @click="saveManualInvoice">
                    New Invoice
                </el-button>
            </div>
        </div>
        <div class="main-content">
            <div v-if="invoices.length > 0">
                <el-card v-for="invoice in invoices" :key="invoice.id">
                    <div class="card-container">
                        <p>#{{invoice.id}}</p>
                        <p>Due: {{ formatDate(invoice.due) }}</p>
                        <p>{{invoice.client.name}}</p>
                        <p>Rp {{ invoice.amount.toLocaleString() }}</p>
                        <el-tag :type="getStatusTagType(invoice.status)">{{ invoice.status }}</el-tag>
                        <CaretRight style="width: 1em; height: 1em;"/>
                    </div>
                </el-card>
            </div>
            <div v-else>
                <p>No invoices found.</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { CirclePlus, CaretRight } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useInvoiceStorage } from '@/composables/useInvoiceStorage';
import {Invoice} from "~/types/Invoice";

const filter = ref('')
const options = [
    {
        value: 'status',
        label: 'Filter by status',
    },
]

const { invoices, saveInvoice } = useInvoiceStorage();

const getStatusTagType = (status) => {
    switch (status) {
        case 'draft':
            return 'info';
        case 'pending':
            return 'warning';
        case 'paid':
            return 'success';
        default:
            return 'info';
    }
};

const formatDate = (date) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
};

const saveManualInvoice = () => {
    const newInvoice = {
        id: 'RT3082',
        due: new Date('2023-08-20'),
        clientName: 'Jane Smith',
        amount: 2500,
        status: 'pending',
        sender: {
            streetAddress: '123 Main St',
            city: 'Anytown',
            postCode: 12345,
            country: 'Example Country',
        },
        client: {
            name: 'Client Co.',
            email: 'client@example.com',
            streetAddress: '456 Client Ave',
            city: 'Client City',
            postCode: 54321,
            country: 'Client Country',
        },
        dueDate: new Date('2023-08-20'),
        itemList: [
            {
                item_name: 'Item 1',
                qty: 2,
                price: 500,
                total: 1000,
            },
            {
                item_name: 'Item 2',
                qty: 3,
                price: 300,
                total: 900,
            },
        ],
    };

    saveInvoice(newInvoice as Invoice);
    alert('Invoice saved successfully!');
};

</script>

<style>
.main-container {
    margin-inline: 8rem;
}
.main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.main-content{
    margin-top: 4rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.card-container{
    display: flex;
    justify-content: space-between;
    align-items: center;
}
h1 {
    font-size: var(--el-font-size-extra-large); /* Apply the Main Title font size */
}
h2 {
    font-size: var(--el-font-size-base); /* Apply the Main Title font size */
}
</style>
