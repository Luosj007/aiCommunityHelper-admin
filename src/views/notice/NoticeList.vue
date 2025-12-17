<template>
  <div class="notice-list-container">
    <!-- 搜索 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="通知ID">
          <el-input
            v-model.number="searchForm.id"
            placeholder="输入ID精确搜索"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="通知标题">
          <el-input
            v-model="searchForm.title"
            placeholder="输入标题模糊搜索"
            clearable
            style="width: 250px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getNoticeList">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <el-button type="success" @click="openAddDialog">新增通知</el-button>
    </div>

    <!-- 通知列表 -->
    <el-table
      :data="noticeList"
      border
      stripe
      v-loading="loading"
      style="width: 100%; margin-top: 10px"
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="title" label="通知标题" min-width="200" />
      <el-table-column prop="content" label="通知内容" min-width="300" />
      <el-table-column prop="time" label="发布时间" width="180" align="center" />
      <el-table-column prop="createdAt" label="创建时间" width="180" align="center" />
      <el-table-column prop="updatedAt" label="更新时间" width="180" align="center" />
      <!-- 操作列 -->
      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            @click="openEditDialog(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增通知' : '编辑通知'"
      width="500px"
      @close="resetDialogForm"
    >
      <el-form
        :model="dialogForm"
        :rules="dialogRules"
        ref="dialogFormRef"
        label-width="80px"
      >
        <el-form-item label="通知标题" prop="title">
          <el-input v-model="dialogForm.title" placeholder="请输入通知标题" />
        </el-form-item>
        <el-form-item label="发布时间" prop="time">
          <el-date-picker
            v-model="dialogForm.time"
            type="datetime"
            placeholder="选择发布时间"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="dialogForm.content"
            type="textarea"
            rows="5"
            placeholder="请输入通知内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
        >
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import noticeApi from '@/api/notice';

const loading = ref(false);
const noticeList = ref([]);
const total = ref(0);

const searchForm = reactive({
  id: '', 
  title: '', 
  page: 1, 
  size: 5
});

// 弹窗相关
const dialogVisible = ref(false);
const dialogType = ref('add'); 
const dialogFormRef = ref(null);
// 弹窗表单
const dialogForm = reactive({
  id: '',
  title: '',
  content: '',
  time: null 
});

const dialogRules = reactive({
  title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
  time: [{ required: true, message: '请选择发布时间', trigger: 'change' }],
  content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }]
});

// 1. 获取通知列表
const getNoticeList = async () => {
  loading.value = true;
  try {
    // 先请求
    const res = await noticeApi.getNoticeList(searchForm);
    const data = res.data || {};
    const hasList = Array.isArray(data.list);
    const hasTotal = typeof data.total === 'number';
    const extractList = (r) => (Array.isArray(r.list) ? r.list : Array.isArray(r) ? r : []);

    let fullList = [];
    if (hasList && hasTotal) {
      // 后端支持分页并返回 total
      if (data.list.length < data.total) {
        // 后端只返回当前页，需要额外请求完整数据以保证全局排序/过滤正确
        try {
          const fullRes = await noticeApi.getNoticeList({ page: 1, size: data.total });
          fullList = extractList(fullRes.data || fullRes);
        } catch (e) {
          // 若获取全量失败，则回退为当前页数据
          fullList = extractList(data);
        }
      } else {
        // 后端返回的 list 已包含全部数据
        fullList = extractList(data);
      }
    } else {
      // 后端未返回分页结构，视为返回全量数组或对象
      fullList = extractList(data);
    }

    // 在完整列表上做前端搜索过滤：id 精确，title 模糊（不区分大小写）
    let filtered = Array.isArray(fullList) ? fullList.slice() : [];
    if (searchForm.id !== '' && searchForm.id !== null && searchForm.id !== undefined) {
      const idStr = String(searchForm.id).trim();
      filtered = filtered.filter(item => String(item.id) === idStr);
    }
    if (searchForm.title && String(searchForm.title).trim() !== '') {
      const titleLower = String(searchForm.title).toLowerCase().trim();
      filtered = filtered.filter(item => (item.title || '').toLowerCase().includes(titleLower));
    }

    // 对过滤后的列表按 id 做数值升序排序
    filtered.sort((a, b) => Number(a.id) - Number(b.id));

    // 客户端分页展示并设置 total
    total.value = filtered.length;
    const start = (Math.max(1, searchForm.page) - 1) * searchForm.size;
    noticeList.value = filtered.slice(start, start + searchForm.size);
  } catch (err) {
    noticeList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 2. 重置搜索条件
const resetSearch = () => {
  searchForm.id = '';
  searchForm.title = '';
  searchForm.page = 1;
  getNoticeList();
};

// 3. 打开新增弹窗
const openAddDialog = () => {
  dialogType.value = 'add';
  dialogForm.time = new Date();
  dialogVisible.value = true;
};

// 4. 打开编辑弹窗
const openEditDialog = async (row) => {
  dialogType.value = 'edit';
  dialogVisible.value = true;
  // 获取详情并回显
  try {
    const res = await noticeApi.getNoticeDetail(row.id);
    dialogForm.id = res.data.id;
    dialogForm.title = res.data.title;
    dialogForm.content = res.data.content;
    // 回显 time：若后端返回字符串，转为 Date；若已为 Date 则直接赋值
    if (res.data.time) {
      try {
        dialogForm.time = new Date(res.data.time);
      } catch {
        dialogForm.time = res.data.time;
      }
    } else {
      dialogForm.time = null;
    }
  } catch (err) {
    ElMessage.error('获取详情失败');
  }
};

// 5. 重置弹窗表单
const resetDialogForm = () => {
  dialogForm.id = '';
  dialogForm.title = '';
  dialogForm.content = '';
  dialogForm.time = null;
  if (dialogFormRef.value) {
    dialogFormRef.value.clearValidate(); 
  }
};

// 6. 提交新增/编辑
const handleSubmit = async () => {
  // 表单校验
  try {
    await dialogFormRef.value.validate();
  } catch (err) {
    return; // 校验失败不提交
  }

  try {
    // 提交前将 time 转为后端可接受的字符串（若为 Date）
    const payload = {
      ...dialogForm,
      time: dialogForm.time instanceof Date ? dialogForm.time.toISOString() : dialogForm.time
    };
    if (dialogType.value === 'add') {
      await noticeApi.addNotice(payload);
      ElMessage.success('新增成功');
    } else {
      await noticeApi.updateNotice(dialogForm.id, payload);
      ElMessage.success('编辑成功');
    }
    dialogVisible.value = false;
    getNoticeList(); 
  } catch (err) {
    ElMessage.error(dialogType.value === 'add' ? '新增失败' : '编辑失败');
  }
};

// 7. 删除通知
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该通知吗？',
      '提示',
      { type: 'warning', confirmButtonText: '确认', cancelButtonText: '取消' }
    );
    await noticeApi.deleteNotice(id);
    ElMessage.success('删除通知成功');
    getNoticeList(); 
  } catch (err) {
    ElMessage.info('已取消删除');
  }
};

// 8. 分页相关
const handleSizeChange = (val) => {
  searchForm.size = val;
  getNoticeList();
};
const handleCurrentChange = (val) => {
  searchForm.page = val;
  getNoticeList();
};

onMounted(() => {
  getNoticeList();
});
</script>

<style scoped>
.notice-list-container {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 80px);
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  flex: 1;
}
</style>