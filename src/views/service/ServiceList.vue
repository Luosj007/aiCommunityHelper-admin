<template>
  <div class="service-list-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="服务ID">
          <el-input
            v-model.number="searchForm.id"
            placeholder="请输入ID"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="服务名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入名称"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="服务描述">
          <el-input
            v-model="searchForm.desc"
            placeholder="请输入描述"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getServiceList">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <el-button type="success" @click="openAddDialog">新增服务</el-button>
    </div>

    <!-- 服务表格 -->
    <el-table
      :data="serviceList"
      border
      stripe
      v-loading="loading"
      style="width: 100%; margin-top: 10px"
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="img" label="图片" width="120" align="center">
        <template #default="{ row }">
          <el-image
            v-if="row.img"
            :src="BASE_URL + row.img"
            :preview-src-list="[BASE_URL + row.img]"
            fit="cover"
            style="width: 80px; height: 60px; border-radius: 4px;"
          />
          <span v-else>无图片</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="服务名称" min-width="150" />
      <el-table-column prop="desc" label="服务描述" min-width="200" />
      <el-table-column prop="time" label="营业时间" width="150" />
      <el-table-column prop="distance" label="距离" width="100" align="center" />
      <el-table-column prop="phone" label="联系电话" width="120" align="center" />
      <el-table-column prop="content" label="服务介绍" min-width="250" />
      <el-table-column prop="createdAt" label="创建时间" width="180" align="center">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" width="180" align="center">
        <template #default="{ row }">
          {{ formatDate(row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
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
      :title="dialogType === 'add' ? '新增服务' : '编辑服务'"
      width="600px"
      @close="resetDialogForm"
    >
      <el-form
        :model="dialogForm"
        :rules="dialogRules"
        ref="dialogFormRef"
        label-width="100px"
      >
        <el-form-item label="服务图片" prop="img">
          <el-upload
            class="upload-demo"
            :show-file-list="false"
            :http-request="handleUpload"
            accept="image/*"
          >
            <el-button type="primary">上传图片</el-button>
          </el-upload>

          <div v-if="dialogForm.img" style="margin-top: 10px">
            <el-image
              :src="BASE_URL + dialogForm.img"
              style="width: 100px; height: 80px"
              fit="cover"
            />
          </div>
        </el-form-item>
        <el-form-item label="服务名称" prop="name">
          <el-input
            v-model="dialogForm.name"
            placeholder="请输入服务名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="服务描述" prop="desc">
          <el-input
            v-model="dialogForm.desc"
            placeholder="请输入简短描述"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="营业时间" prop="time">
          <el-input
            v-model="dialogForm.time"
            placeholder="如：9:00-18:00"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="距离" prop="distance">
          <el-input
            v-model="dialogForm.distance"
            placeholder="如：500米"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="联系电话" prop="phone">
          <el-input
            v-model="dialogForm.phone"
            placeholder="请输入联系电话"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="服务介绍" prop="content">
          <el-input
            v-model="dialogForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入完整的服务介绍内容"
          />
        </el-form-item>
        
        <!-- 创建时间（只显示） -->
        <el-form-item label="创建时间">
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
import serviceApi from '@/api/service';
const BASE_URL = 'http://localhost:7001';

const handleUpload = async (options) => {
  try {
    const res = await serviceApi.uploadServiceImg(options.file);
    dialogForm.img = res.data.url;
    ElMessage.success('图片上传成功');
  } catch (err) {
    ElMessage.error('图片上传失败');
  }
};


// 列表与加载状态
const loading = ref(false);
const serviceList = ref([]);
const total = ref(0);

// 搜索表单（ID精确，name和desc模糊查询）
const searchForm = reactive({
  id: '',
  name: '',
  desc: '',
  page: 1,
  size: 5
});

// 弹窗相关
const dialogVisible = ref(false);
const dialogType = ref('add');
const dialogFormRef = ref(null);
const dialogForm = reactive({
  id: '',
  img: '',
  name: '',
  desc: '',
  time: '',
  distance: '',
  phone: '',
  content: '',
  createdAt: null,
  updatedAt: null
});

// 弹窗校验规则
const dialogRules = reactive({
  img: [{ required: true, message: '请输入图片路径', trigger: 'blur' }],
  name: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
  desc: [{ required: true, message: '请输入服务描述', trigger: 'blur' }],
  time: [{ required: true, message: '请输入营业时间', trigger: 'blur' }],
  distance: [{ required: true, message: '请输入距离', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  content: [{ required: true, message: '请输入服务介绍', trigger: 'blur' }]
});

// 获取服务列表
const getServiceList = async () => {
  loading.value = true;
  try {
    const res = await serviceApi.getServiceList(searchForm);
    const data = res.data || {};
    const extractList = (r) => Array.isArray(r.list) ? r.list : Array.isArray(r) ? r : [];
    let fullList = extractList(data);

    // 尝试获取全量数据用于前端过滤
    if (data.list?.length < data.total) {
      const fullRes = await serviceApi.getServiceList({ page: 1, size: data.total });
      fullList = extractList(fullRes.data || fullRes);
    }

    // 前端过滤：ID精确，name和desc模糊查询
    let filtered = [...fullList];
    if (searchForm.id) {
      filtered = filtered.filter(item => String(item.id) === String(searchForm.id));
    }
    if (searchForm.name) {
      const nameKey = searchForm.name.toLowerCase();
      filtered = filtered.filter(item => 
        (item.name || '').toLowerCase().includes(nameKey)
      );
    }
    if (searchForm.desc) {
      const descKey = searchForm.desc.toLowerCase();
      filtered = filtered.filter(item => 
        (item.desc || '').toLowerCase().includes(descKey)
      );
    }

    // 客户端分页
    total.value = filtered.length;
    const start = (searchForm.page - 1) * searchForm.size;
    serviceList.value = filtered.slice(start, start + searchForm.size);
  } catch (err) {
    serviceList.value = [];
    total.value = 0;
    ElMessage.error('获取服务列表失败');
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
  searchForm.name = '';
  searchForm.desc = '';
  searchForm.page = 1;
  getServiceList();
};

// 打开新增弹窗
const openAddDialog = () => {
  dialogType.value = 'add';
  resetDialogForm();
  dialogVisible.value = true;
};

// 打开编辑弹窗
const openEditDialog = async (row) => {
  dialogType.value = 'edit';
  dialogVisible.value = true;
  try {
    const res = await serviceApi.getServiceDetail(row.id);
    Object.assign(dialogForm, res.data);
  } catch (err) {
    ElMessage.error('获取服务详情失败');
    dialogVisible.value = false;
  }
};

// 重置弹窗表单
const resetDialogForm = () => {
  dialogForm.id = '';
  dialogForm.img = '';
  dialogForm.name = '';
  dialogForm.desc = '';
  dialogForm.time = '';
  dialogForm.distance = '';
  dialogForm.phone = '';
  dialogForm.content = '';
  dialogForm.createdAt = null;
  dialogForm.updatedAt = null;
  dialogFormRef.value?.clearValidate();
};

// 提交新增/编辑
const handleSubmit = async () => {
  // 表单校验
  try {
    await dialogFormRef.value.validate();
  } catch (err) {
    return; // 校验失败不提交
  }

  try {
    // 构建提交数据
    const payload = {
      img: dialogForm.img,
      name: dialogForm.name,
      desc: dialogForm.desc,
      time: dialogForm.time,
      distance: dialogForm.distance,
      phone: dialogForm.phone,
      content: dialogForm.content
    };

    if (dialogType.value === 'add') {
      await serviceApi.addService(payload);
      ElMessage.success('新增服务成功');
    } else {
      await serviceApi.updateService(dialogForm.id, payload);
      ElMessage.success('编辑服务成功');
    }
    dialogVisible.value = false;
    getServiceList();
  } catch (err) {
    console.error('提交失败:', err);
    ElMessage.error(`${dialogType.value === 'add' ? '新增失败' : '编辑失败'}: ${err.response?.data?.msg || err.message}`);
  }
};

// 删除服务
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该服务吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    });
    await serviceApi.deleteService(id);
    ElMessage.success('删除成功');
    getServiceList();
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 分页事件
const handleSizeChange = (val) => {
  searchForm.size = val;
  getServiceList();
};

const handleCurrentChange = (val) => {
  searchForm.page = val;
  getServiceList();
};

// 挂载时初始化列表
onMounted(() => getServiceList());
</script>

<style scoped>
.service-list-container {
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

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>