<template>
    <div class="default-layout">
        <el-container class="min-h-screen">

            <el-header class="header flex justify-end items-center">
                <el-switch
                        v-model="colorMode"
                        inline-prompt
                        active-text="dark"
                        inactive-text="light"
                        inactive-color="gray"
                        :active-icon="Moon"
                        :inactive-icon="Sunny"
                        size="large"
                />
            </el-header>
            <el-container>
                <el-main>
                    <slot/>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<style>
:root {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.default-layout .header {
    border-bottom: 2px solid var(--el-border-color);
}
</style>

<script setup lang="ts">

import {Moon, Sunny} from "@element-plus/icons-vue";

const color = useColorMode();

const colorMode = computed({
    get: () => color.value === 'dark',
    set: () => (color.preference = color.value === 'dark' ? 'light' : 'dark'),
});
</script>
