<template>
    <div class="main-container">
        <div class="main-header">
            <div>
                <h1>Invoices</h1>
                <h2>There are total {{ invoices.length }} invoices</h2>
            </div>

            <div class="header-action">
                <el-select v-model="filter" class="m-2" placeholder="Filter invoices" size="small">
                    <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                    />
                </el-select>

                <el-button :icon="CirclePlus" size="large" round type="primary" @click="drawerVisible = true">
                    New Invoice
                </el-button>
            </div>
        </div>

        <div v-if="invoices.length > 0">
            <div class="main-content">
                <el-card v-for="invoice in invoices" :key="invoice.id">
                    <div class="card-container">
                        <div class="desktop-view">
                            <!-- Content for desktop view -->
                            <p class="font-bold">#{{ invoice.id }}</p>
                            <p>{{ invoice.client.name }}</p>
                            <p>Due: {{ formatDate(invoice.dueDate) }}</p>
                            <p>Rp {{ invoice.amount.toLocaleString() }}</p>
                            <el-tag :type="getStatusTagType(invoice.status)" size="large" class="capitalize">{{ invoice.status }}</el-tag>
                            <CaretRight style="width: 1em; height: 1em;" />
                        </div>
                        <div class="mobile-view">
                            <!-- Content for mobile view -->
                            <div style="display: flex; justify-content: space-between; width: 100%">
                                <p>#{{ invoice.id }}</p>
                                <p>{{ invoice.client.name }}</p>
                            </div>
                            <div style="display: flex; justify-content: space-between; width: 100%; align-items: flex-end">
                                <div>
                                    <p>Due: {{ formatDate(invoice.due) }}</p>
                                    <p>Rp {{ invoice.amount.toLocaleString() }}</p>
                                </div>
                                <el-tag :type="getStatusTagType(invoice.status)" class="capitalize p-4">{{ invoice.status }}</el-tag>
                            </div>
                        </div>
                    </div>
                </el-card>
            </div>

        </div>
        <div v-else>
            <p>No invoices found.</p>
        </div>
    </div>

    <el-drawer
            v-model="drawerVisible"
            title="Create Invoice"
            :before-close="handleDrawerClose"
            @close="closeDrawer"
    >
    </el-drawer>

    <el-drawer
            v-model="drawerVisible"
            title="Create Invoice"
            :before-close="handleDrawerClose"
            @close="closeDrawer"
            size="90%"
            :close-on-click-modal="false"
    >
        <el-form
                ref="ruleFormRef"
                :model="invoiceRuleForm"
                :rules="invoiceFormRules"
                size="default"
                label-position="top"
                class="flex flex-col gap-1"
        >
            <div class="bg-blue/10 p-2 rounded rounded-box mb-1">
                <h2>Bill From</h2>
                <el-form-item label="Street Address" prop="senderStreetAddress">
                    <el-input v-model="invoiceRuleForm.senderStreetAddress"
                              placeholder="Enter street address"></el-input>
                </el-form-item>
                <div class="item-row flex-1">
                    <el-form-item label="City" prop="senderCity">
                        <el-input v-model="invoiceRuleForm.senderCity" placeholder="Enter city"></el-input>
                    </el-form-item>
                    <el-form-item label="Post Code" prop="senderPostCode">
                        <el-input-number v-model="invoiceRuleForm.senderPostCode" :precision="0"
                                         placeholder="Enter post code" :controls="false"></el-input-number>
                    </el-form-item>
                    <el-form-item label="Country" prop="senderCountry">
                        <el-input v-model="invoiceRuleForm.senderCountry" placeholder="Enter country"></el-input>
                    </el-form-item>
                </div>
            </div>

            <div class="bg-green/10 p-2 rounded rounded-box mb-1">
                <h2>Bill To</h2>
                <el-form-item label="Client's Name" prop="clientName">
                    <el-input v-model="invoiceRuleForm.clientName" placeholder="Enter client's name"></el-input>
                </el-form-item>
                <el-form-item label="Client's Email" prop="clientEmail">
                    <el-input v-model="invoiceRuleForm.clientEmail" placeholder="Enter client's name"></el-input>
                </el-form-item>
                <el-form-item label="Client's Address" prop="clientStreetAddress">
                    <el-input v-model="invoiceRuleForm.clientStreetAddress"
                              placeholder="Enter client's address"></el-input>
                </el-form-item>
                <div class="item-row flex-1">
                    <el-form-item label="City" prop="clientCity">
                        <el-input v-model="invoiceRuleForm.clientCity" placeholder="Enter city"></el-input>
                    </el-form-item>
                    <el-form-item label="Post Code" prop="clientPostCode">
                        <el-input-number v-model="invoiceRuleForm.clientPostCode" :precision="0"
                                         placeholder="Enter post code" :controls="false"></el-input-number>
                    </el-form-item>
                    <el-form-item label="Country" prop="clientCountry">
                        <el-input v-model="invoiceRuleForm.clientCountry" placeholder="Enter country"></el-input>
                    </el-form-item>
                </div>
            </div>

            <div class="bg-red/10 p-2 rounded rounded-box mb-1">
                <el-form-item label="Due Date" required prop="dueDate">
                    <el-date-picker v-model="invoiceRuleForm.dueDate" type="date"
                                    placeholder="Select due date"></el-date-picker>
                </el-form-item>
            </div>

            <div class="bg-orange/10 p-2 rounded rounded-box mb-1">
                <h2>Item List</h2>
                <div v-for="(item, index) in invoiceRuleForm.itemList" :key="index" class="item-row">

                    <el-form-item
                            label="Item Name"
                            :prop="'itemList.' + index + '.item_name'"
                            :rules="{
                          required: true,
                          message: 'Item Name can not be null',
                          trigger: 'blur',
                        }"
                    >
                        <el-input v-model="item.item_name" placeholder="Enter item name"></el-input>
                    </el-form-item>
                    <el-form-item
                            label="Qty"
                            :prop="'itemList.'+ index + '.qty'"
                            :rules="{
                          validator: checkQty,
                          trigger: 'blur',
                        }"
                    >
                        <el-input-number
                                v-model="item.qty"
                                :min="1"
                                :precision="0"
                                @change="updateTotal(item)"
                        ></el-input-number>
                    </el-form-item>
                    <el-form-item
                            label="Price"
                            :prop="'itemList.'+ index + '.price'"
                    >
                        <el-input-number v-model="item.price" :controls="false"
                                         @change="updateTotal(item)"></el-input-number>
                    </el-form-item>
                    <el-form-item
                            label="Total"
                            :prop="'itemList.'+ index + '.total'"
                    >
                        <el-input-number v-model="item.total" :controls="false" :disabled="true"></el-input-number>
                    </el-form-item>

                    <el-form-item>
                        <el-button @click="removeItem(item)" type="danger" :icon="Delete" class="mt-8"></el-button>
                    </el-form-item>
                </div>
            </div>

            <el-button @click="addItem" plain>Add Item</el-button>

            <div class="mt-2">
                <el-button type="primary" @click="submitForm" :loading="formSubmitLoading">Create</el-button>
                <el-button @click="closeDrawer">Cancel</el-button>
            </div>
        </el-form>
    </el-drawer>
</template>

<script lang="ts" setup>
import {CaretRight, CirclePlus, Delete} from '@element-plus/icons-vue'
import {reactive, ref} from 'vue'
import type {FormInstance, FormRules} from 'element-plus'
import {useInvoiceStorage} from '@/composables/useInvoiceStorage';
import {Invoice} from "~/types/Invoice";

const filter = ref('')
const options = [
    {
        value: 'status',
        label: 'Filter by status',
    },
]

const {invoices, saveInvoice} = useInvoiceStorage();

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
    return new Date(date).toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'})
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

const drawerVisible = ref(false);

const ruleFormRef = ref<FormInstance>()

interface ItemList {
    item_name: string;
    qty: number;
    price: number;
    total: number;
}

interface InvoiceRuleForm {
    senderStreetAddress: string,
    senderCity: string,
    senderPostCode: number | null,
    senderCountry: string,
    clientName: string,
    clientEmail: string,
    clientStreetAddress: string,
    clientCity: string,
    clientPostCode: number | null,
    clientCountry: string,
    dueDate: string,
    itemList: ItemList[]
}

const invoiceRuleForm = reactive<InvoiceRuleForm>({
    senderStreetAddress: '',
    senderCity: '',
    senderPostCode: null,
    senderCountry: '',
    clientName: '',
    clientEmail: '',
    clientStreetAddress: '',
    clientCity: '',
    clientPostCode: null,
    clientCountry: '',
    dueDate: '',
    itemList: [
        {
            item_name: '',
            qty: 0,
            price: 0,
            total: 0
        }
    ]
})

const invoiceFormRules = reactive<FormRules<InvoiceRuleForm>>({
    senderStreetAddress: [{required: true, message: "Bill sender address is required", trigger: 'blur'}],
    senderCity: [{required: true, message: 'Bill sender city is required', trigger: 'blur'}],
    senderPostCode: [{required: true, message: 'Bill sender post code is required', trigger: 'blur'}],
    senderCountry: [{required: true, message: 'Bill sender country is required', trigger: 'blur'}],
    clientName: [{required: true, message: "Client's name is required", trigger: 'blur'}],
    clientEmail: [
        {required: true, message: "Client's email is required", trigger: 'blur'},
        {type: 'email', message: 'Invalid email format', trigger: 'blur'},
    ],
    clientStreetAddress: [{required: true, message: "Client's street address is required", trigger: 'blur'}],
    clientCity: [{required: true, message: "Client's city is required", trigger: 'blur'}],
    clientPostCode: [{required: true, message: "Client's post code is required", trigger: 'blur'}],
    clientCountry: [{required: true, message: "Client's country is required", trigger: 'blur'}],
    dueDate: [{type: 'date', required: true, message: 'Please select due date', trigger: 'change'}],
})
const checkQty = (rule: any, value: any, callback: any) => {
    if (!value) {
        return callback(new Error('Please input the Qty'))
    }

    if (!Number.isInteger(value)) {
        callback(new Error('Please input digits'))
    } else {
        if (value < 1) {
            callback(new Error('Qty must be greater than 0'))
        } else {
            callback()
        }
    }
}

const updateTotal = (item) => {
    item.total = item.qty * item.price;
};

const formSubmitLoading = ref(false);

const submitForm = async () => {
    formSubmitLoading.value = true;
    try {
        if (ruleFormRef.value) {
            await ruleFormRef.value!.validate(); // Add the non-null assertion '!'

            const formData = {
                dueDate: new Date(invoiceRuleForm.dueDate),
                itemList: invoiceRuleForm.itemList.map((item) => ({
                    item_name: item.item_name,
                    qty: item.qty,
                    price: item.price,
                    total: item.qty * item.price,
                })),
                amount: invoiceRuleForm.itemList.reduce((total, item) => total + item.qty * item.price, 0),
                sender: {
                    streetAddress: invoiceRuleForm.senderStreetAddress,
                    city: invoiceRuleForm.senderCity,
                    postCode: invoiceRuleForm.senderPostCode,
                    country: invoiceRuleForm.senderCountry,
                },
                client: {
                    name: invoiceRuleForm.clientName,
                    email: invoiceRuleForm.clientEmail,
                    streetAddress: invoiceRuleForm.clientStreetAddress,
                    city: invoiceRuleForm.clientCity,
                    postCode: invoiceRuleForm.clientPostCode,
                    country: invoiceRuleForm.clientCountry,
                },
                status: "draft",
            };

            // Now formData is in the format of the Invoice interface
            console.log("🌍 Parsed form data:", formData);

            saveInvoice(formData as Invoice)

            // saveInvoice(invoiceRuleForm as Invoice)
            console.log('🌍 Form data submitted successfully:');
            // Proceed with form submission logic here...
        } else {
            console.log('🌍 Form instance not found. Unable to submit form.');
        }
    } catch (error) {
        console.error('🌍 An error occurred during form validation:', error);
        // Handle any form validation errors or other unexpected errors here...
    }
    formSubmitLoading.value = false;
};

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
}

const closeDrawer = () => {
    drawerVisible.value = false;
    resetForm(ruleFormRef.value)
};

const handleDrawerClose = (done) => {
    // You can perform additional actions here before closing the drawer if needed
    resetForm(ruleFormRef.value)
    done();
};

const addItem = () => {
    invoiceRuleForm.itemList.push({
        item_name: '',
        qty: 0,
        price: 0,
        total: 0
    });
};

const removeItem = (item: ItemList) => {
    const index = invoiceRuleForm.itemList.indexOf(item)
    if (index !== -1) {
        invoiceRuleForm.itemList.splice(index, 1)
    }
};


</script>

<style>

.main-container {
    margin-inline: 8rem;
}

@media screen and (max-width: 768px) {
    .main-container {
        margin-inline: auto;
    }
}

.main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-action {
    display: flex;
}

@media (max-width: 767px) {
    .main-header {
        align-items: flex-start;
        flex-direction: column;
    }
    .header-action {
        width: 100%;
        justify-content: space-between;
    }
}

.main-content {
    margin-top: 4rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.card-container {
    /* Default styles for desktop view */
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
}

.desktop-view {
    /* Apply this style only for screens larger than 768px (desktop view) */
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
}

.mobile-view {
    /* Apply this style only for screens less than or equal to 768px (mobile view) */
    display: none;
}

/* Media query for mobile view */
@media screen and (max-width: 768px) {
    .card-container {
        flex-direction: column;
        align-items: stretch;
    }

    .desktop-view {
        display: none;
    }

    .mobile-view {
        display: flex;
        flex-direction: column;
    }
}

.item-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.item-row div {
    display: flex;
    flex: 1;
}

@media (max-width: 767px) {
    .item-row {
        flex-direction: column;
        align-items: stretch;
    }
}

h1 {
    font-size: var(--el-font-size-extra-large); /* Apply the Main Title font size */
}

h2 {
    font-size: var(--el-font-size-base); /* Apply the Main Title font size */
}
</style>
