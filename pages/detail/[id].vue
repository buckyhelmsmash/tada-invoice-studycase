<script setup lang="ts">
import {Invoice} from "~/types/Invoice";
import {reactive, ref} from 'vue';
import type {FormInstance, FormRules} from 'element-plus';
import {Delete} from "@element-plus/icons-vue";

const route = useRoute()
const router = useRouter()
const id = route.params.id

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'})
};
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

const {getInvoiceById, updateInvoice, deleteInvoice} = useInvoiceStorage();

let invoice = reactive<Invoice | undefined>(getInvoiceById(id as string));

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
                status: invoice?.status,
            };

            console.log("🌍 Parsed form data:", formData);

            const updatedInvoiceData = {
                id,
                ...formData
            };

            const updatedInvoice = updateInvoice(updatedInvoiceData as Invoice, id as string);
            if (updatedInvoice) {
                console.log('🌍 Invoice updated successfully:', updatedInvoice);

                invoice = getInvoiceById(id as string)

            } else {
                console.log('🌍 Invoice with ID:', id, 'not found.');
            }

            console.log('🌍 Form data submitted successfully:');
            ElNotification({
                title: 'Success',
                message: "Invoice Updated",
                type: 'success',
            })
        } else {
            console.log('🌍 Form instance not found. Unable to submit form.');
        }
    } catch (error) {
        console.error('🌍 An error occurred during form validation:', error);
    }
    formSubmitLoading.value = false;
    closeDrawer()
};

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
}

const updateStatus = (status: "pending" | "paid") => {
    console.log("🌍 invoice", invoice?.id)
    const updatedInvoiceData = {
        ...invoice,
        status
    }
    const updatedInvoice = updateInvoice(updatedInvoiceData as Invoice, id as string);
    if (updatedInvoice) {
        console.log('🌍 Invoice updated successfully:', updatedInvoice);

        invoice = getInvoiceById(id as string)
        ElNotification({
            title: 'Success',
            message: status === "pending" ? 'Invoice Sent' : 'Invoice marked as Paid',
            type: 'success',
        })
    } else {
        console.log('🌍 Invoice with ID:', id, 'not found.');
    }
}

const removeInvoice = () => {
    deleteInvoice(id as string)
    ElNotification({
        title: 'Success',
        message: 'Invoice Deleted',
        type: 'success',
    })
    setTimeout(() => {
        goBack()
    }, 1500)

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

const loadInvoiceDataIntoForm = () => {
    if (invoice) {
        invoiceRuleForm.senderStreetAddress = invoice.sender.streetAddress;
        invoiceRuleForm.senderCity = invoice.sender.city;
        invoiceRuleForm.senderPostCode = invoice.sender.postCode;
        invoiceRuleForm.senderCountry = invoice.sender.country;
        invoiceRuleForm.clientName = invoice.client.name;
        invoiceRuleForm.clientEmail = invoice.client.email;
        invoiceRuleForm.clientStreetAddress = invoice.client.streetAddress;
        invoiceRuleForm.clientCity = invoice.client.city;
        invoiceRuleForm.clientPostCode = invoice.client.postCode;
        invoiceRuleForm.clientCountry = invoice.client.country;
        invoiceRuleForm.dueDate = formatDate(invoice.dueDate);
        invoiceRuleForm.itemList = invoice.itemList.map((item) => ({
            item_name: item.item_name,
            qty: item.qty,
            price: item.price,
            total: item.total,
        }));
    }
};
onMounted(() => {
    loadInvoiceDataIntoForm();
});

const goBack = () => {
    const url = new URL(`/`, window.location.origin)
    window.location.href = url.toString()
};
</script>

<template>
    <div v-if="invoice" class="bg-black/8 max-h-content mx-4 my-auto p-16">
        <el-drawer
                v-model="drawerVisible"
                title="Edit Invoice"
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
                    <el-button type="primary" @click="submitForm()" :loading="formSubmitLoading">Edit</el-button>
                    <el-button @click="closeDrawer">Cancel</el-button>
                </div>
            </el-form>
        </el-drawer>

        <div class="flex justify-between">
            <el-button size="large" round type="ghost" @click="goBack">
                Back
            </el-button>
            <div>
                <el-button size="large" round type="primary" @click="drawerVisible = true">
                    Edit
                </el-button>
                <template v-if="invoice">
                    <!-- Display the "Send" button if the invoice status is "draft" -->
                    <el-button v-if="invoice.status === 'draft'" type="success" @click="updateStatus('pending')" size="large" round>
                        Send
                    </el-button>

                    <!-- Display the "Mark as Paid" button if the invoice status is "pending" -->
                    <el-button v-if="invoice.status === 'pending'" type="warning" @click="updateStatus('paid')" size="large" round>
                        Mark as Paid
                    </el-button>
                </template>
                <el-button size="large" round type="danger" @click="removeInvoice">
                    Delete
                </el-button>
            </div>
        </div>

        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">#{{ invoice?.id }}</h1>
            <el-tag :type="getStatusTagType(invoice?.status)" size="large" class="capitalize">{{
                invoice?.status
                }}
            </el-tag>
        </div>
        <div class="flex justify-between mb-4">
            <div class="w-1/2">
                <p class="text-lg text-slate font-bold ">Sender</p>
                <p class="text-sm ">{{ invoice?.sender.streetAddress }}</p>
                <p class="text-sm ">{{ invoice?.sender.city }}, {{ invoice?.sender.country }}</p>
                <p class="text-sm ">{{ invoice?.sender.postCode }}</p>
            </div>
            <div class="w-1/2 text-right">
                <p class="text-lg text-slate font-bold ">To</p>
                <p class="text-sm ">{{ invoice?.client.name }}</p>
                <p class="text-sm ">{{ invoice?.client.email }}</p>
                <p class="text-sm ">{{ invoice?.client.streetAddress }}</p>
                <p class="text-sm ">{{ invoice?.client.city }}, {{ invoice?.client.country }}</p>
                <p class="text-sm ">{{ invoice?.client.postCode }}</p>
            </div>
        </div>
        <div class="mb-4">
            <p class="text-sm ">Due: {{ formatDate(invoice?.dueDate) }}</p>
        </div>
        <div class="mt-8">
            <table class="w-full border-collapse">
                <thead>
                <tr>
                    <th class="px-4 py-2 bg-black/5">Item Name</th>
                    <th class="px-4 py-2 bg-black/5 text-right">Qty</th>
                    <th class="px-4 py-2 bg-black/5 text-right">Price</th>
                    <th class="px-4 py-2 bg-black/5 text-right">Total</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item, index) in invoice?.itemList" :key="index">
                    <td class="border px-4 py-2">{{ item.item_name }}</td>
                    <td class="border px-4 py-2 text-right">{{ item.qty }}</td>
                    <td class="border px-4 py-2 text-right">{{ item.price }}</td>
                    <td class="border px-4 py-2 text-right">{{ item.total }}</td>
                </tr>
                </tbody>
                <tfoot>
                <tr class="bg-black/10">
                    <td colspan="3" class="border px-4 py-2 text-right font-bold">Total</td>
                    <td class="border px-4 py-2 text-right font-bold">{{ invoice?.amount }}</td>
                </tr>
                </tfoot>
            </table>
        </div>
    </div>
    <div v-else>
        <p>Loading...</p>
    </div>
</template>

<style scoped>
.detail-container {

}
</style>