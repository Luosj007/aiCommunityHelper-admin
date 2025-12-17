<template>
  <div class="layout-container">
    <!-- 侧边栏区域 -->
    <div class="sidebar-container">
      <div class="sidebar-header">
        <h2 class="sidebar-title">社区助手管理系统</h2>
      </div>
      <el-menu
        default-active="/home"
        class="sidebar-menu"
        router
        text-color="#333"
        active-text-color="#409eff"
        background-color="#f8f9fa"
        unique-opened
      >
        <el-menu-item index="/home">
          <el-icon><House /></el-icon>
          <template #title>首页</template>
        </el-menu-item>

        <el-sub-menu index="/info">
          <template #title>
            <el-icon><List /></el-icon>
            <span>信息列表</span>
          </template>
          <el-menu-item index="/info/qa">
            <template #title>
              <el-icon><Message /></el-icon>
              <span>问答列表</span>
            </template>
          </el-menu-item>
          <el-menu-item index="/info/workOrder">
            <template #title>
              <el-icon><Check /></el-icon>
              <span>保修列表</span>
            </template>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/notice">
          <el-icon><Bell /></el-icon>
          <template #title>通知列表</template>
        </el-menu-item>
        <el-menu-item index="/service">
          <el-icon><Suitcase /></el-icon>
          <template #title>便民推荐</template>
        </el-menu-item>
        <el-menu-item index="logout" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <template #title>退出登录</template>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <div class="navbar-container">
        <!-- 核心修改：面包屑动态渲染 -->
        <el-breadcrumb class="breadcrumb" separator="/">
          <el-breadcrumb-item 
            v-for="item in breadcrumbList" 
            :key="item.path" 
            :to="{ path: item.path }"
          >
            {{ item.title }}
          </el-breadcrumb-item>
        </el-breadcrumb>
        <div class="navbar-right">
          <span class="user-name">管理员</span>
          <el-button type="text" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            退出
          </el-button>
        </div>
      </div>
      <div class="page-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
// 1. 导入依赖
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus"; // 新增ElMessageBox
import {
  House,
  List,
  Bell,
  Suitcase,
  SwitchButton,
  Message, 
  Check 
} from "@element-plus/icons-vue";
import Cookies from "js-cookie";

// 2. 初始化路由实例
const router = useRouter();
const route = useRoute();

// 3. 定义面包屑列表（存储 { path: 路由路径, title: 显示标题 }）
const breadcrumbList = ref([]);

// 4. 重构：动态生成面包屑（核心逻辑）
const generateBreadcrumb = () => {
  // 容错：路由未匹配时清空
  if (!route || !route.matched || route.matched.length === 0) {
    breadcrumbList.value = [];
    return;
  }

  // 过滤出包含 meta.title 的路由层级，生成面包屑数据
  breadcrumbList.value = route.matched
    .filter(item => item.meta && item.meta.title) 
    .map(item => ({
      path: item.path, 
      title: item.meta.title 
    }));
};

// 5. 监听路由变化，动态更新面包屑
watch(
  () => route.fullPath, 
  () => {
    generateBreadcrumb();
  },
  { immediate: true } 
);

// 6. 退出登录逻辑
const handleLogout = async () => {
  try {
    // 弹出确认提示框，匹配截图样式
    await ElMessageBox.confirm(
      '你确认要进行退出么', // 提示文案
      '温馨提示', // 标题
      {
        type: 'warning', 
        confirmButtonText: '确认', 
        cancelButtonText: '取消', 
      }
    );
    Cookies.remove("admin_token");
    router.push("/login");
    ElMessage.success("退出登录成功！");
  } catch (err) {
    // 点击“取消”或关闭弹窗时执行（无操作）
    ElMessage.info("已取消退出");
  }
};
</script>

<style scoped>
.layout-container {
  display: flex;
  width: 100%;
  height: 100vh;
}

.sidebar-container {
  width: 220px;
  height: 100vh;
  background-color: #f8f9fa;
  border-right: 1px solid #e6e6e6;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
}

.sidebar-header {
  height: 60px;
  line-height: 60px;
  text-align: center;
  border-bottom: 1px solid #e6e6e6;
  background-color: #409eff;
  color: #fff;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.sidebar-menu {
  padding-top: 10px;
  height: calc(100vh - 60px);
  border-right: none;
}

/* :deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  font-size: 14px;
}

:deep(.el-menu-item.is-active) {
  background-color: #e5f0ff !important;
} */

.main-content {
  flex: 1;
  margin-left: 220px;
  height: 100vh;
}

.navbar-container {
  height: 60px;
  line-height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  right: 0;
  left: 220px;
  z-index: 98;
}

.breadcrumb {
  font-size: 14px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-name {
  font-size: 14px;
  color: #666;
}

.page-content {
  padding: 70px 20px 20px;
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
}

</style>