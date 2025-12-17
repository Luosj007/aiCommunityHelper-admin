<template>
  <div class="login-bg">
    <div class="login-form-container">
      <h2 class="login-title">社区助手管理系统</h2>
      <el-form
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        class="login-form"
        size="large"
      >
        <el-form-item prop="username" class="form-item">
          <label class="form-label">*账户:</label>
          <el-input
            v-model="loginForm.username"
            placeholder="请输入账户"
            :prefix-icon="User"
            class="login-input account-input"
          />
        </el-form-item>
        <el-form-item prop="password" class="form-item">
          <label class="form-label">*密码:</label>
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            class="login-input pwd-input"
          />
        </el-form-item>
        <el-form-item prop="verifyCode" class="form-item verify-code-item">
          <label class="form-label">*验证码:</label>
          <div class="verify-code-wrap">
            <el-input
              v-model="loginForm.verifyCode"
              placeholder="请输入验证码"
              class="login-input code-input"
            />
            <canvas
              ref="captchaCanvas"
              class="verify-code-canvas"
              @click="refreshCaptcha"
              title="点击刷新验证码"
            ></canvas>
          </div>
        </el-form-item>
        <el-form-item class="login-btn-item">
          <el-button
            type="primary"
            size="large"
            @click="handleLogin"
            class="login-btn"
            :loading="isLoading"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { User, Lock } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";
import loginApi from "@/api/login";

const router = useRouter();
const isLoading = ref(false);

// Canvas验证码核心逻辑
const captchaCanvas = ref(null);
const generatedCaptcha = ref("");

const refreshCaptcha = () => {
  const canvas = captchaCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const chars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";
  const charCount = 4;
  const width = 100;
  const height = 40;
  
  canvas.width = width;
  canvas.height = height;

  generatedCaptcha.value = "";
  for (let i = 0; i < charCount; i++) {
    generatedCaptcha.value += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // 绘制背景
  ctx.fillStyle = `rgb(${180 + Math.random() * 50}, ${200 + Math.random() * 30}, ${180 + Math.random() * 50})`;
  ctx.fillRect(0, 0, width, height);

  // 绘制干扰线
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.strokeStyle = `rgb(${120 + Math.random() * 80}, ${150 + Math.random() * 80}, ${120 + Math.random() * 80})`;
    ctx.lineWidth = Math.random() * 1.5 + 0.5;
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  // 绘制干扰点
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgb(${100 + Math.random() * 100}, ${130 + Math.random() * 100}, ${100 + Math.random() * 100})`;
    ctx.beginPath();
    ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1 + 0.5, 0, 2 * Math.PI);
    ctx.fill();
  }

  // 绘制验证码字符
  for (let i = 0; i < generatedCaptcha.value.length; i++) {
    const char = generatedCaptcha.value.charAt(i);
    const fontSize = Math.random() * 10 + 20;
    ctx.font = `${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = `rgb(${30 + Math.random() * 80}, ${60 + Math.random() * 80}, ${30 + Math.random() * 80})`;
    ctx.save();
    ctx.translate(20 * i + 15, height / 2 + fontSize / 4);
    ctx.rotate((Math.random() - 0.5) * 0.5);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }
};

onMounted(() => {
  refreshCaptcha();
});

// 登录表单
const loginForm = ref({
  username: "",
  password: "",
  verifyCode: "",
});

// ========== 核心修改：验证码大小写不敏感 ==========
const loginRules = ref({
  username: [{ required: true, message: "请输入账户", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不少于6位", trigger: "blur" },
  ],
  verifyCode: [
    { required: true, message: "请输入验证码", trigger: "blur" },
    { 
      validator: (rule, value, callback) => {
        // 转成小写后比较，实现大小写不敏感
        if (value.toLowerCase() !== generatedCaptcha.value.toLowerCase()) {
          callback(new Error("验证码输入错误"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});

const loginFormRef = ref(null);

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  try {
    await loginFormRef.value.validate();
  } catch (err) {
    ElMessage.warning("请完善登录信息");
    return;
  }

  isLoading.value = true;
  try {
    const response = await loginApi.adminLogin(loginForm.value);
    console.log("【后端返回】", response);

    if (response.code === 200 && response.data?.token) {
      Cookies.set("admin_token", response.data.token, { expires: 7 });
      ElMessage.success(response.msg || "登录成功！正在跳转...");
      setTimeout(() => {
        router.push("/home");
      }, 1000);
    } else {
      ElMessage.error(response.msg || "登录失败，账户或密码错误");
      refreshCaptcha();
    }
  } catch (error) {
    const errMsg = error.response?.data?.msg || "服务器异常，请稍后重试";
    ElMessage.error(errMsg);
    console.error("【登录异常】", error);
    refreshCaptcha();
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* 样式部分完全不变 */
.login-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url("@/assets/bg.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.02);
  background-blend-mode: overlay;
}

.login-form-container {
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(80, 120, 80, 0.1);
  padding: 45px 40px;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.login-title {
  text-align: center;
  font-size: 30px;
  font-weight: 600;
  color: #2d5d2e;
  margin-bottom: 40px;
  letter-spacing: 2px;
  font-family: "Microsoft YaHei", "SimHei", sans-serif;
}

.form-item {
  margin-bottom: 20px !important;
}

.form-label {
  display: inline-block;
  width: 70px;
  color: #2d5d2e;
  font-size: 16px;
  margin-right: 10px;
  text-align: right;
  font-weight: 500;
}

.login-input {
  flex: 1;
  height: 48px;
  font-size: 16px;
}

:deep(.account-input .el-input__wrapper),
:deep(.pwd-input .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #4CAF50 !important;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.08);
  padding: 0 15px;
  transition: all 0.2s ease;
}
:deep(.account-input .el-input__wrapper:hover),
:deep(.pwd-input .el-input__wrapper:hover) {
  border-color: #388E3C !important;
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.12);
}
:deep(.account-input .el-input__inner),
:deep(.pwd-input .el-input__inner) {
  color: #2d5d2e;
  background: transparent;
}

:deep(.code-input .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #2196F3 !important;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(33, 150, 243, 0.08);
  padding: 0 15px;
  flex: 1;
  transition: all 0.2s ease;
}
:deep(.code-input .el-input__wrapper:hover) {
  border-color: #1976D2 !important;
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.12);
}
:deep(.code-input .el-input__inner) {
  color: #2d5d2e;
  background: transparent;
}

.verify-code-item {
  display: flex;
  align-items: center;
}
.verify-code-wrap {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 12px;
}
.verify-code-canvas {
  width: 100px;
  height: 48px;
  border-radius: 10px;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}
.verify-code-canvas:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.login-btn-item {
  margin-top: 30px;
  margin-bottom: 0;
}
.login-btn {
  width: 100%;
  height: 52px;
  font-size: 18px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(90deg, #4CAF50, #2196F3);
  color: #fff;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
  transition: all 0.3s ease;
}
:deep(.login-btn:hover) {
  background: linear-gradient(90deg, #388E3C, #1976D2);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.25);
}
:deep(.login-btn:active) {
  transform: translateY(0);
}

:deep(.el-input__inner::placeholder) {
  color: rgba(45, 93, 46, 0.4);
  font-size: 15px;
}

:deep(.account-input .el-input__prefix),
:deep(.pwd-input .el-input__prefix) {
  color: #4CAF50;
}
:deep(.code-input .el-input__prefix) {
  color: #2196F3;
}

:deep(.el-form-item__error) {
  color: #F44336;
  font-size: 12px;
  margin-top: 4px;
}

@media (max-width: 480px) {
  .login-form-container {
    padding: 35px 25px;
  }
  .login-title {
    font-size: 26px;
  }
  .form-label {
    width: 60px;
    font-size: 15px;
  }
  .verify-code-canvas {
    width: 90px;
    height: 44px;
  }
}
</style>