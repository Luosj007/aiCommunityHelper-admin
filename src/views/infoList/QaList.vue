<template>
  <div class="qa-list-container">
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="问答ID">
          <el-input
            v-model.number="searchForm.id"
            placeholder="请输入ID"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="问题内容">
          <el-input
            v-model="searchForm.question"
            placeholder="请输入问题关键词"
            clearable
            style="width: 250px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getQaList">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table
      :data="qaList"
      border
      stripe
      v-loading="loading"
      style="width: 100%; margin-top: 10px"
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="question" label="问题内容" min-width="300" />
      <el-table-column prop="answer" label="答案内容" min-width="400" />
      <el-table-column prop="createdAt" label="提问时间" width="180" align="center">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <!-- <el-table-column prop="updatedAt" label="更新时间" width="180" align="center">
        <template #default="{ row }">
          {{ formatDate(row.updatedAt) }}
        </template>
      </el-table-column> -->
    </el-table>

    <el-pagination
      v-if="total > 0"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="searchForm.page"
      :page-sizes="[5, 10, 15]"
      :page-size="searchForm.size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      style="margin-top: 15px; text-align: right"
    >
    </el-pagination>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import qaApi from '@/api/qa'; 

const loading = ref(false);
const qaList = ref([]); 
const total = ref(0); 

const searchForm = reactive({
  id: '', 
  question: '', 
  page: 1, 
  size: 5 
});

const getQaList = async () => {
  loading.value = true;
  try {
    const res = await qaApi.getQaList(searchForm);
    const data = res.data || {};
    const hasList = Array.isArray(data.list);
    const hasTotal = typeof data.total === 'number';
    const extractList = (r) => (Array.isArray(r.list) ? r.list : Array.isArray(r) ? r : []);

    let fullList = [];
    if (hasList && hasTotal) {
      if (data.list.length < data.total) {
        try {
          const fullRes = await qaApi.getQaList({ page: 1, size: data.total });
          fullList = extractList(fullRes.data || fullRes);
        } catch (e) {
          fullList = extractList(data);
        }
      } else {
        fullList = extractList(data);
      }
    } else {
      fullList = extractList(data);
    }

    let filtered = Array.isArray(fullList) ? fullList.slice() : [];
    if (searchForm.id !== '' && searchForm.id !== null && searchForm.id !== undefined) {
      const idStr = String(searchForm.id).trim();
      filtered = filtered.filter(item => String(item.id) === idStr);
    }
    if (searchForm.question && String(searchForm.question).trim() !== '') {
      const questionLower = String(searchForm.question).toLowerCase().trim();
      filtered = filtered.filter(item => (item.question || '').toLowerCase().includes(questionLower));
    }

    total.value = filtered.length;
    const start = (Math.max(1, searchForm.page) - 1) * searchForm.size;
    qaList.value = filtered.slice(start, start + searchForm.size);
  } catch (err) {
    qaList.value = [];
    total.value = 0;
    ElMessage.error('获取问答列表失败');
  } finally {
    loading.value = false;
  }
};

const formatDate = (val) => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const resetSearch = () => {
  searchForm.id = '';
  searchForm.question = '';
  searchForm.page = 1;
  getQaList();
};

const handleSizeChange = (val) => {
  searchForm.size = val;
  getQaList();
};
const handleCurrentChange = (val) => {
  searchForm.page = val;
  getQaList();
};

onMounted(() => {
  getQaList();
});
</script>

<style scoped>
.qa-list-container {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 80px);
}

.search-bar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.search-form {
  flex: 1;
}
</style>