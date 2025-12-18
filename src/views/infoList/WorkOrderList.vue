<template>
  <div class="work-order-list-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="工单ID">
          <el-input
            v-model.number="searchForm.id"
            placeholder="请输入ID"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="工单状态">
          <el-select
            v-model="searchForm.statusText"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="待处理" value="待处理"></el-option>
            <el-option label="处理中" value="处理中"></el-option>
            <el-option label="已完成" value="已完成"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="工单内容">
          <el-input
            v-model="searchForm.content"
            placeholder="请输入内容"
            clearable
            style="width: 250px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getWorkOrderList">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <el-button type="success" @click="openAddDialog">新增工单</el-button>
    </div>

    <!-- 工单表格 -->
    <el-table
      :data="workOrderList"
      border
      stripe
      v-loading="loading"
      style="width: 100%; margin-top: 10px"
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="orderNo" label="工单编号" min-width="150" align="center" />
      <el-table-column prop="statusText" label="工单状态" min-width="120" align="center" />
      <el-table-column prop="content" label="工单内容" min-width="300" />
      <el-table-column prop="createdAt" label="发布时间" width="180" align="center">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" width="180" align="center">
        <template #default="{ row }">
          {{ formatDate(row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" @click="openEditDialog(scope.row)">
            编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
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
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增工单' : '编辑工单'"
      width="500px"
      @close="resetDialogForm"
    >
      <el-form
        :model="dialogForm"
        :rules="dialogRules"
        ref="dialogFormRef"
        label-width="80px"
      >
        <!-- 工单编号（只显示，用户不填写） -->
        <el-form-item label="工单编号">
          <template v-if="dialogType === 'add'">
            <el-input :value="dialogForm.orderNo || '提交后自动生成'" disabled />
          </template>
          <template v-else>
            <el-input :value="dialogForm.orderNo" disabled />
          </template>
        </el-form-item>
        <!-- 用户选择状态 -->
        <el-form-item label="工单状态" prop="statusText">
          <el-select v-model="dialogForm.statusText" placeholder="请选择工单状态">
            <el-option label="待处理" value="待处理"></el-option>
            <el-option label="处理中" value="处理中"></el-option>
            <el-option label="已完成" value="已完成"></el-option>
          </el-select>
        </el-form-item>
        
        <!-- 用户填写内容 -->
        <el-form-item label="工单内容" prop="content">
          <el-input
            v-model="dialogForm.content"
            type="textarea"
            rows="5"
            placeholder="请输入工单内容"
          />
        </el-form-item>
        
        <!-- 发布时间（只显示） -->
        <el-form-item label="发布时间">
          <template v-if="dialogType === 'add'">
            <el-input :value="'提交后自动生成'" disabled />
          </template>
          <template v-else>
            <el-input :value="formatDate(dialogForm.createdAt)" disabled />
          </template>
        </el-form-item>
        
        <!-- 更新时间（编辑时显示） -->
        <el-form-item label="更新时间" v-if="dialogType === 'edit'">
          <el-input :value="formatDate(dialogForm.updatedAt)" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import workOrderApi from '@/api/workOrder';

const statusMap = {
  '待处理': 'pending',
  '处理中': 'process', 
  '已完成': 'done'
};

// 生成工单编号
const generateOrderNo = () => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `WX${timestamp}${random}`;
};

// 列表与加载状态
const loading = ref(false);
const workOrderList = ref([]);
const total = ref(0);

// 搜索表单
const searchForm = reactive({
  id: '',
  statusText: '',
  content: '',
  page: 1,
  size: 5
});

// 弹窗相关
const dialogVisible = ref(false);
const dialogType = ref('add');
const dialogFormRef = ref(null);
const dialogForm = reactive({
  id: '',
  orderNo: '',
  statusText: '',
  content: '',
  createdAt: null,
  updatedAt: null
});

// 弹窗校验规则
const dialogRules = reactive({
  statusText: [{ required: true, message: '请选择工单状态', trigger: 'change' }],
  content: [{ required: true, message: '请输入工单内容', trigger: 'blur' }]
});

// 获取工单列表
const getWorkOrderList = async () => {
  loading.value = true;
  try {
    const res = await workOrderApi.getWorkOrderList(searchForm);
    const data = res.data || {};
    const extractList = (r) => Array.isArray(r.list) ? r.list : Array.isArray(r) ? r : [];
    let fullList = extractList(data);

    // 尝试获取全量数据用于前端过滤
    if (data.list?.length < data.total) {
      const fullRes = await workOrderApi.getWorkOrderList({ page: 1, size: data.total });
      fullList = extractList(fullRes.data || fullRes);
    }

    // 前端过滤
    let filtered = [...fullList];
    if (searchForm.id) filtered = filtered.filter(item => String(item.id) === String(searchForm.id));
    if (searchForm.statusText) filtered = filtered.filter(item => item.statusText === searchForm.statusText);
    if (searchForm.content) {
      const key = searchForm.content.toLowerCase();
      filtered = filtered.filter(item => (item.content || '').toLowerCase().includes(key));
    }

    // 客户端分页
    total.value = filtered.length;
    const start = (searchForm.page - 1) * searchForm.size;
    workOrderList.value = filtered.slice(start, start + searchForm.size);
  } catch (err) {
    workOrderList.value = [];
    total.value = 0;
    ElMessage.error('获取工单失败');
  } finally {
    loading.value = false;
  }
};

// 时间格式化
const formatDate = (val) => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// 重置搜索条件
const resetSearch = () => {
  searchForm.id = '';
  searchForm.statusText = '';
  searchForm.content = '';
  searchForm.page = 1;
  getWorkOrderList();
};

// 打开新增弹窗
const openAddDialog = () => {
  dialogType.value = 'add';
  resetDialogForm();
  // 新增时预生成工单编号（让用户能看到）
  dialogForm.orderNo = generateOrderNo();
  dialogVisible.value = true;
};

// 打开编辑弹窗
const openEditDialog = async (row) => {
  dialogType.value = 'edit';
  dialogVisible.value = true;
  try {
    const res = await workOrderApi.getWorkOrderDetail(row.id);
    Object.assign(dialogForm, res.data);
  } catch (err) {
    ElMessage.error('获取工单详情失败');
    dialogVisible.value = false;
  }
};

// 重置弹窗表单
const resetDialogForm = () => {
  dialogForm.id = '';
  dialogForm.orderNo = '';
  dialogForm.statusText = '';
  dialogForm.content = '';
  dialogForm.createdAt = null;
  dialogForm.updatedAt = null;
  dialogFormRef.value?.clearValidate();
};

// 提交新增/编辑（核心修复）
const handleSubmit = async () => {
  // 表单校验
  try {
    await dialogFormRef.value.validate();
  } catch (err) {
    return; // 校验失败不提交
  }

  try {
    // 用户只需要选状态和填内容，其他字段前端自动补全
    const payload = {
      order_no: dialogForm.orderNo, 
      status: statusMap[dialogForm.statusText],
      status_text: dialogForm.statusText, 
      content: dialogForm.content 
    };

    if (dialogType.value === 'add') {
      await workOrderApi.addWorkOrder(payload);
      ElMessage.success('新增成功');
    } else {
      await workOrderApi.updateWorkOrder(dialogForm.id, payload);
      ElMessage.success('编辑成功');
    }
    dialogVisible.value = false;
    getWorkOrderList();
  } catch (err) {
    ElMessage.error(dialogType.value === 'add' ? '新增失败' : '编辑失败');
  }
};

// 删除工单
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该工单吗？', 
    '提示', 
    { 
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    });
    await workOrderApi.deleteWorkOrder(id);
    ElMessage.success('删除成功');
    getWorkOrderList();
  } catch (err) {
    ElMessage.info('已取消');
  }
};

// 分页事件
const handleSizeChange = (val) => {
  searchForm.size = val;
  getWorkOrderList();
};
const handleCurrentChange = (val) => {
  searchForm.page = val;
  getWorkOrderList();
};

onMounted(() => {
  getWorkOrderList();
});
</script>

<style scoped>
.work-order-list-container {
  padding: 20px;
  background: #fff;
  min-height: calc(100vh - 80px);
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.search-form {
  flex: 1;
}
</style>