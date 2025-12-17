<template>
  <div class="home-container">
    <h1 class="page-title">社区助手管理系统 - 数据可视化</h1>
    
    <!-- 图表容器：三栏布局（响应式） -->
    <div class="charts-wrapper">
      <!-- 1. 报修类型占比（饼图） -->
      <div class="chart-card">
        <h3 class="chart-title">报修类型占比</h3>
        <div ref="repairChart" class="chart-box"></div>
      </div>

      <!-- 2. 垃圾分类识别次数（柱状图） -->
      <div class="chart-card">
        <h3 class="chart-title">垃圾分类识别次数</h3>
        <div ref="garbageChart" class="chart-box"></div>
      </div>

      <!-- 3. 热门问答TOP10（横向柱状图） -->
      <div class="chart-card full-width">
        <h3 class="chart-title">热门问答TOP10</h3>
        <div ref="qaChart" class="chart-box qa-chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";

// 1. 定义图表DOM引用
const repairChart = ref(null); // 报修占比饼图
const garbageChart = ref(null); // 垃圾分类柱状图
const qaChart = ref(null); // 热门问答横向柱状图

// 2. 定义echarts实例变量（用于销毁）
let repairEchart = null;
let garbageEchart = null;
let qaEchart = null;

// 3. 模拟业务数据（可替换为接口请求）
// 报修类型占比数据
const repairData = [
  { name: "水电故障", value: 35 },
  { name: "设施损坏", value: 25 },
  { name: "环境卫生", value: 20 },
  { name: "噪音投诉", value: 10 },
  { name: "其他报修", value: 10 },
];

// 垃圾分类识别次数数据
const garbageData = {
  categories: ["可回收物", "厨余垃圾", "有害垃圾", "其他垃圾", "易腐垃圾"],
  values: [1280, 2560, 420, 980, 1850],
};

// 热门问答TOP10数据
const qaData = [
  { name: "垃圾分类投放时间", count: 589 },
  { name: "物业费缴纳方式", count: 456 },
  { name: "停车位申请流程", count: 398 },
  { name: "装修报备要求", count: 321 },
  { name: "宠物饲养规定", count: 289 },
  { name: "快递柜使用说明", count: 256 },
  { name: "社区活动报名", count: 210 },
  { name: "门禁卡补办流程", count: 189 },
  { name: "公共区域使用申请", count: 156 },
  { name: "投诉建议反馈渠道", count: 123 },
];

// 4. 初始化图表函数
const initCharts = () => {
  // === 4.1 初始化报修类型占比饼图 ===
  repairEchart = echarts.init(repairChart.value);
  repairEchart.setOption({
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
      textStyle: { fontSize: 12 },
    },
    legend: {
      orient: "vertical",
      left: "left",
      textStyle: { fontSize: 11 },
    },
    series: [
      {
        name: "报修类型",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["50%", "50%"],
        data: repairData,
        label: {
          show: true,
          formatter: "{b}: {d}%",
          fontSize: 11,
        },
        color: ["#4CAF50", "#2196F3", "#FFC107", "#FF5722", "#9C27B0"],
      },
    ],
    responsive: true,
  });

  // === 4.2 初始化垃圾分类识别次数柱状图 ===
  garbageEchart = echarts.init(garbageChart.value);
  garbageEchart.setOption({
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      textStyle: { fontSize: 12 },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: garbageData.categories,
        axisTick: { alignWithLabel: true },
        axisLabel: { fontSize: 11 },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: "识别次数",
        nameTextStyle: { fontSize: 11 },
        axisLabel: { fontSize: 11 },
      },
    ],
    series: [
      {
        name: "识别次数",
        type: "bar",
        barWidth: "60%",
        data: garbageData.values,
        itemStyle: {
          color: (params) => {
            const colors = ["#4CAF50", "#2196F3", "#FFC107", "#FF5722", "#9C27B0"];
            return colors[params.dataIndex];
          },
        },
      },
    ],
    responsive: true,
  });

  // === 4.3 初始化热门问答TOP10横向柱状图 ===
  qaEchart = echarts.init(qaChart.value);
  qaEchart.setOption({
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      textStyle: { fontSize: 12 },
    },
    grid: {
      left: "10%",
      right: "4%",
      bottom: "3%",
      top: "10%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "value",
        name: "访问量",
        nameTextStyle: { fontSize: 11 },
        axisLabel: { fontSize: 11 },
      },
    ],
    yAxis: [
      {
        type: "category",
        data: qaData.map((item) => item.name),
        axisLabel: { 
          fontSize: 10,
          width: 150, // 限制标签宽度
          overflow: "truncate" 
        },
        inverse: true, // 倒序展示（TOP1在最上方）
      },
    ],
    series: [
      {
        name: "访问量",
        type: "bar",
        data: qaData.map((item) => item.count),
        itemStyle: {
          color: "#2196F3",
          borderRadius: [0, 5, 5, 0], // 圆角美化
        },
      },
    ],
    responsive: true,
  });
};

// 5. 窗口自适应函数
const resizeCharts = () => {
  repairEchart?.resize();
  garbageEchart?.resize();
  qaEchart?.resize();
};

// 6. 生命周期：挂载时初始化图表
onMounted(() => {
  initCharts();
  window.addEventListener("resize", resizeCharts);
});

// 7. 生命周期：卸载时销毁图表（防止内存泄漏）
onUnmounted(() => {
  window.removeEventListener("resize", resizeCharts);
  repairEchart?.dispose();
  garbageEchart?.dispose();
  qaEchart?.dispose();
});
</script>

<style scoped>
/* 页面容器样式 */
.home-container {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f5f7fa;
}

/* 页面标题 */
.page-title {
  text-align: center;
  color: #2d5d2e;
  margin: 0 0 30px 0;
  font-size: 28px;
  font-weight: 600;
}

/* 图表容器布局 */
.charts-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* 图表卡片样式 */
.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.chart-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

/* 热门问答图表占满整行 */
.full-width {
  grid-column: 1 / -1;
}

/* 图表标题 */
.chart-title {
  color: #2d5d2e;
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

/* 图表盒子（必须设置宽高） */
.chart-box {
  width: 100%;
  height: 400px;
}

/* 热门问答图表高度适配 */
.qa-chart {
  height: 500px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .page-title {
    font-size: 22px;
  }
  .chart-box {
    height: 300px;
  }
  .qa-chart {
    height: 400px;
  }
  .chart-card {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .charts-wrapper {
    grid-template-columns: 1fr;
  }
  .chart-box {
    height: 250px;
  }
  .qa-chart {
    height: 350px;
  }
}
</style>