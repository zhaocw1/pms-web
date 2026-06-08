<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="月份">
        <el-date-picker
          v-model="queryParams.choseTime"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          :picker-options="dateRange">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="里程碑名称" prop="milestoneId">
        <el-select v-model="queryParams.milestoneId" clearable placeholder="请选择里程碑名称">
          <el-option
            v-for="item in milestoneAllList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="成本类型" prop="costType">
        <el-select v-model="queryParams.costType" clearable placeholder="请选择成本类型">
          <el-option
            v-for="item in costTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="20">
      <el-col :span="8">
        <div id="myChartPie" style="width: 500px;height: 800px"></div>
      </el-col>
      <el-col :span="8">
        <div id="myChartLine" style="width: 500px;height: 800px"></div>
      </el-col>
      <el-col :span="6">
        <div id="myChartBar" style="width: 500px;height: 800px"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import {pieDataList} from "@/api/manage/milestone";
import {parseTime} from "@/utils/ruoyi";
import { costTypeList, getBarDataList, getLineDataList, listCost } from '@/api/manage/cost'

export default {
  name: "Index",
  dicts: ['cost_type'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 【请填写功能名称】表格数据
      milestoneList: [],
      //成本数据
      costList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 9999,
        id: "",
        milestoneId: "",
        milestoneName: null,
        choseTime: [
          '2024-01-01',
          '2024-12-31'
        ],
        startTime: '2024-01-01',
        endTime: '2024-12-31',
        costType: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
      //金额校验
      dateRange: {
        disabledDate(time) {
          return new Date(time).getTime() < new Date(time).getTime();
        },
      },
      //饼状图数据
      pieChartData: [],
      //折线图数据
      lineChartData: [],
      //里程碑名称数据
      milestoneAllList: [],
      //成本类型列表
      costTypeList: []
    };
  },
  created() {
    this.getName();
    this.getList();
    this.updateCostType();
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      const pie = {
        pageNum: 1,
        pageSize: 9999,
        milestoneId : this.queryParams.milestoneId,
        startTime: this.queryParams.startTime,
        endTime: this.queryParams.endTime,
        costType: this.queryParams.costType,
      }
      pieDataList(pie).then(response => {
        this.milestoneList = response.rows;
        console.log(response);
        this.pieChartData = this.milestoneList.map(function (item) {
          return {
            name: item.projectName + '--' + item.name,
            value: item.cost
          };
        });
        this.drawPie();
        getLineDataList(pie).then(response => {
          console.log(response);
          this.lineChartData = response.data;
          this.drawLine();
        });
        const costType = this.queryParams.costType;
        if (this.milestoneList.length > 0) {
          const costs = this.milestoneList.map(function (item) {
            return {
              costType: costType,
              milestoneId: item.id,
            }
          })
          getBarDataList(costs).then(response => {
            this.costList = response.data;
            this.drawBar();
          });
        } else {
          this.costList = [];
          this.drawBar();
        }
        this.loading = false;
      });
    },
    getName() {
      const pie = {
        pageNum: 1,
        pageSize: 9999,
        choseTime: this.queryParams.choseTime,
        startTime: this.queryParams.startTime,
        endTime: this.queryParams.endTime,
      }
      pieDataList(pie).then(response => {
        this.milestoneAllList = response.rows;
      });
    },
    drawPie() {
      // 初始化echarts实例
      var chartDomPie = document.getElementById('myChartPie');
      var myChartPie = echarts.init(chartDomPie);
      var optionPie;
      //里程碑饼状图初始化
      optionPie = {
        //标题
        title: {
          text: '里程碑',
          subtext: '选中日期内的里程碑',
          left: '35%',
          top: '20%'
        },
        tooltip: {
          trigger: 'item',
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: '45%',
            center: ['45%', '50%'],
            data: this.pieChartData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      optionPie && myChartPie.setOption(optionPie);
      myChartPie.on('click', (params) => {
        // 打印点击事件的详细信息
        // this.queryParams.name = params.data.name;
        // this.handleQuery();
      });
    },
    drawLine() {
      var chartDomLine = document.getElementById('myChartLine');
      var myChartLine = echarts.init(chartDomLine);
      var optionLine;
      const lineChartList = this.lineChartData;
      // const lineChartList = this.lineChartData.sort((a, b) => new Date(a.date) - new Date(b.date));

      //成本折线图初始化
      optionLine = {
        //标题
        title: {
          text: '成本波动折线图',
          left: '45%',
          top: '20%'
        },
        //位置
        grid: {
          left: '5%',   // 距离容器左侧的距离
          right: '10%',  // 距离容器右侧的距离
          top: '35%',    // 距离容器顶部的距离
          bottom: '30%',  // 距离容器底部的距离
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          name: '月份',
          nameTextStyle: {
            fontSize: 16
          },
          axisLabel: {
            interval: 0, // 强制显示所有标签
            rotate: 45,  // 旋转标签以避免重叠
            textStyle: {
              // 你可以在这里调整标签的字体大小、颜色等
              fontSize: 12,
            },
          },
        },
        yAxis: {
          type: 'value',
          name: '成本',
          nameTextStyle: {
            fontSize: 16
          }
        },
        series: [
          {
            radius: '40%',
            data: lineChartList,
            type: 'line'
          }
        ]
      };
      optionLine && myChartLine.setOption(optionLine);
    },
    drawBar() {
      var chartDomBar = document.getElementById('myChartBar');
      var myChartBar = echarts.init(chartDomBar);
      var optionBar;
      // 定义一个映射对象，将数字键映射到成本类型名称
      const costTypeMapping = {
        1: '人力成本',
        2: '物料成本',
        3: '差旅费用',
        4: '其他费用'
      };
      const costTypeMap = {};
      this.costList.forEach(item => {
        const mappedCostType = costTypeMapping[item.costType];
        if (!costTypeMap[mappedCostType]) {
          costTypeMap[mappedCostType] = {
            type: mappedCostType,
            amount: 0
          };
        }
        costTypeMap[mappedCostType].amount += item.amount;
      });
      // 将对象转换为数组，以便在图表中使用
      const processedCostList = Object.values(costTypeMap);
      //柱状图初始化
      optionBar = {
        //标题
        title: {
          text: '成本类型分布图',
          left: '45%',
          top: '20%'
        },
        //位置
        grid: {
          left: '5%',   // 距离容器左侧的距离
          right: '20%',  // 距离容器右侧的距离
          top: '35%',    // 距离容器顶部的距离
          bottom: '30%',  // 距离容器底部的距离
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: processedCostList.map(item => item.type),
          name: '成本类型',
          nameTextStyle: {
            fontSize: 16
          }
        },
        yAxis: {
          type: 'value',
          name: '成本',
          nameTextStyle: {
            fontSize: 16
          }
        },
        series: [
          {
            data: processedCostList.map(item => item.amount),
            type: 'bar'
          }
        ]
      };
      optionBar && myChartBar.setOption(optionBar);
    },

    /** 搜索按钮操作 */
    handleQuery() {
      // 处理日期
      this.queryParams.startTime = this.queryParams.choseTime ? this.queryParams.choseTime[0] : null;
      this.queryParams.endTime = this.queryParams.choseTime ? this.queryParams.choseTime[1] : null;
      this.getList();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.choseTime = [];
      this.handleQuery();
    },
    updateCostType(milestoneId) {
      const costTypeMapping = {
        1: '人力成本',
        2: '物料成本',
        3: '差旅费用',
        4: '其他费用'
      };
      if (milestoneId) {
        costTypeList(milestoneId).then(response => {
          const newCostTypeList = response.data.map(function (itemId) {
            const costTypeName = costTypeMapping[itemId];
            return {
              value: itemId,
              label: costTypeName
            };
          });
          this.costTypeList = newCostTypeList;
          const currentCostType = this.queryParams.costType;
          const costTypeExists = newCostTypeList.some(item => item.value === currentCostType);
          if (!costTypeExists && currentCostType) {
            this.queryParams.costType = null;
          }
        })
      } else {
        this.costTypeList = [
          {value: 1, label: '人力成本'},
          {value: 2, label: '物料成本'},
          {value: 3, label: '差旅费用'},
          {value: 4, label: '其他费用'}
        ];
      }
    },
    updateMilestoneIdByDateRange(dateRange) {
      const pie = {
        pageNum: 1,
        pageSize: 9999,
        startTime: dateRange[0],
        endTime: dateRange[1],
      }
      pieDataList(pie).then(response => {
        const newMilestoneAllList = response.rows;
        this.milestoneAllList = newMilestoneAllList;
        const currentMilestoneId = this.queryParams.milestoneId;
        const milestoneIdExists = newMilestoneAllList.some(item => item.id === currentMilestoneId);
        if (!milestoneIdExists && currentMilestoneId) {
          this.queryParams.milestoneId = null;
        }
      })
    },
    handlePieClick(params) {
    },
  },
  watch: {
    'queryParams.milestoneId'(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.updateCostType(newVal);
      }
    },
    'queryParams.choseTime': {
      handler(newVal, oldVal) {
        if (Array.isArray(newVal)) {
          if (newVal.length > 0 && newVal[0] !== '') {
            this.updateMilestoneIdByDateRange(newVal);
          } else {
            this.getName();
          }
        } else {
          console.error('queryParams.choseTime should be an array');
          this.getName();
        }
      },
      deep: true,
      immediate: true,
    },
  }
  ,
}
;
</script>


