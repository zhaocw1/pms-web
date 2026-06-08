<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="项目名称" prop="projectId">
        <el-select v-model="queryParams.projectId" clearable placeholder="请选择项目名称">
          <el-option
            v-for="item in projectList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="里程碑名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入里程碑名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户对接人" prop="directorName">
        <el-input
          v-model="queryParams.directorName"
          placeholder="请输入客户对接人姓名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="启动日期">
        <el-date-picker
          v-model="queryParams.choseStartTime"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          :picker-options="dateRange"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="交付日期">
        <el-date-picker
          v-model="queryParams.choseDueDate"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          :picker-options="dateRange"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['manage:milestone:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['manage:milestone:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['manage:milestone:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="milestoneList"
              ref="milestoneTable"
              @selection-change="handleSelectionChange"
              @filter-change="filterChanged"
    >
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="项目名称" align="center" prop="projectName">
        <template slot-scope="scope">
          <el-link @click="openProjectDialog(scope.row)" class="link-type" style="color: #0381bb">
            {{ scope.row.projectName }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="里程碑名称" align="center" prop="name">
        <template slot-scope="scope">
          <el-link @click="openMilestoneDialog(scope.row)" class="link-type" style="color: #0381bb">
            {{ scope.row.name }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="合同类型" align="center" prop="contractType"
                       :filter-multiple="false"
                       :filters="[{ text: '新需求', value: 1 }, { text: '维保', value: 2 }]"
                       :column-key="columnKey[0]"
      >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.contract_type" :value="scope.row.contractType"/>
        </template>
      </el-table-column>
      <el-table-column label="客户对接人" align="center" prop="directorName"/>
      <el-table-column label="启动日期" align="center" prop="startTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="交付日期" align="center" prop="dueDate" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.dueDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status"
                       :filter-multiple="false"
                       :filters="[{ text: '初步洽谈', value: 1 }, { text: '预算申报', value: 2 },{ text: '合同签署中', value: 3 },{ text: '已下单', value: 4 },{ text: '已付款', value: 5 }]"
                       :column-key="columnKey[1]"
      >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.milestone_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="合同金额" align="center" prop="contractPrice"/>
      <el-table-column label="成本" align="center" prop="cost"/>
      <el-table-column label="人天单价" align="center" prop="humanPrice"/>
      <el-table-column label="盈亏" align="center" prop="isProfit"
                       :filter-multiple="false"
                       :filters="[{ text: '盈利', value: '1' }, { text: '亏损', value: '2' },{ text: '持平', value: '0' }]"
                       :column-key="columnKey[2]"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.contractPrice > scope.row.cost" style="color: #10f309">
            {{ '盈利' }} <img class="pic-up__parent" src="@/assets/images/up.png"
                              alt="up" width="15"
          ></div>
          <div v-if="scope.row.contractPrice < scope.row.cost" style="color: #ff0008">
            {{ '亏损' }} <img class="pic-down__parent"
                              src="@/assets/images/down.png" alt="down" width="15"
          >
          </div>
          <div v-if="scope.row.contractPrice === scope.row.cost" style="color: #0c0001">
            {{ '持平' }} <img class="pic-flat__parent"
                              src="@/assets/images/flat.png" alt="flat" width="15"
          >
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            @click="openFileDialog(scope.row)"
          >文档
          </el-button>
          <el-button
            size="mini"
            type="text"
            @click="openCostDialog(scope.row)"
          >成本
          </el-button>
          <el-dropdown size="mini" @command="(command) => handleCommand(command, scope.row)"
                       v-hasPermi="['manage:milestone:edit', 'manage:milestone:remove']"
          >
            <el-button size="mini" type="text" icon="el-icon-d-arrow-right">更多</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="handleUpdate" icon="el-icon-edit"
                                v-hasPermi="['manage:milestone:edit']"
              >修改
              </el-dropdown-item>
              <el-dropdown-item command="handleDelete" icon="el-icon-delete"
                                v-hasPermi="['manage:milestone:remove']"
              >删除
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="900px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px" :disabled="isDisable">
        <el-form-item label="项目名称" prop="projectId">
          <el-select v-model="form.projectId" clearable placeholder="请选择项目名称" style="width:720px">
            <el-option
              v-for="item in projectList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="里程碑名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入里程碑名称" style="width:720px"/>
        </el-form-item>
        <el-form-item label="客户对接人姓名" prop="directorName">
          <el-input v-model="form.directorName" placeholder="请输入客户对接人姓名" style="width:720px"/>
        </el-form-item>
        <el-form-item label="合同类型" prop="contractType">
          <el-select v-model="form.contractType"  clearable placeholder="请选择合同类型" style="width:720px">
            <el-option
              v-for="dict in dict.type.contract_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="交付日期" prop="dueDate">
          <el-date-picker clearable
                          v-model="form.dueDate"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="请选择交付日期" style="width:720px"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="启动日期" prop="startTime">
          <el-date-picker clearable
                          v-model="form.startTime"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="请选择启动日期" style="width:720px"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" clearable placeholder="请选择里程碑状态" style="width:720px">
            <el-option
              v-for="dict in dict.type.milestone_status"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="合同金额" prop="contractPrice">
          <el-input v-model.number="form.contractPrice" placeholder="请输入合同金额" style="width:720px"/>
        </el-form-item>
        <el-form-item label="人天单价" prop="humanPrice">
          <el-input-number v-model.number="form.humanPrice" :step="100" step-strictly :min="0" controls-position="left"
                           placeholder="请输入人天单价"
          />
        </el-form-item>
        <el-form-item label="里程碑描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" style="width:720px"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm"  v-if="title !== '【里程碑详情】'">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 文档对话框 -->
    <el-dialog :title="title" :visible.sync="openDes" width="1200px" append-to-body>
      <template>
        <div class="app-container">
          <el-form :model="fileQueryParams" ref="fileQueryForm" size="small" :inline="true" v-show="showFileSearch"
                   label-width="90px"
          >
            <el-form-item label="项目名称" prop="projectName">
              <el-select v-model="fileQueryParams.projectName" disabled placeholder="请选择项目名称">
                <el-input
                  v-model="fileQueryParams.projectName"
                  placeholder="请输入里程碑名称"
                  @keyup.enter.native="handleFileQuery"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="里程碑名称" prop="milestoneName">
              <el-input
                v-model="fileQueryParams.milestoneName"
                placeholder="请输入里程碑名称"
                clearable
                disabled
                @keyup.enter.native="handleFileQuery"
              />
            </el-form-item>
            <el-form-item label="文件名称" prop="name">
              <el-input
                v-model="fileQueryParams.name"
                placeholder="请输入文件名称"
                clearable
                @keyup.enter.native="handleFileQuery"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" size="mini" @click="handleFileQuery">搜索</el-button>
              <el-button icon="el-icon-refresh" size="mini" @click="resetFileQuery">重置</el-button>
            </el-form-item>
          </el-form>
          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button
                type="info"
                plain
                icon="el-icon-upload2"
                size="mini"
                @click="handleImport"
              >上传文档
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                type="danger"
                plain
                icon="el-icon-delete"
                size="mini"
                :disabled="multiple"
                @click="handleFileDelete"
                v-hasPermi="['manage:file:remove']"
              >批量删除
              </el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showFileSearch" @queryTable="getFileList"></right-toolbar>
          </el-row>
          <el-table v-loading="loading" :data="fileList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column label="文件名称" align="center" prop="name">
              <template slot-scope="scope">
                <el-link @click="downloadFile(scope.row)" class="link-type" style="color: #00afff">
                  {{ scope.row.name }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column label="项目名称" align="center" prop="projectName"/>
            <el-table-column label="里程碑名称" align="center" prop="milestoneName"/>
            <el-table-column label="上传日期" align="center" prop="createTime"/>
            <el-table-column label="文档类型" align="center" prop="fileType">
              <template slot-scope="scope">
                <dict-tag :options="dict.type.file_type" :value="scope.row.fileType"/>
              </template>
            </el-table-column>
            <el-table-column label="备注" align="center" prop="des"/>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="handleFileUpdate(scope.row)"
                  v-hasPermi="['manage:file:edit']"
                >替换
                </el-button>
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                  @click="handleFileDelete(scope.row)"
                  v-hasPermi="['manage:file:remove']"
                >删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination
            :total="fileTotal"
            :page.sync="fileQueryParams.pageNum"
            :limit.sync="fileQueryParams.pageSize"
            @pagination="getFileList"
          />
        </div>
      </template>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="550px" style="height: 700px" append-to-body>
      <el-form ref="fileForm" :model="fileForm" :rules="upload.rules" label-width="80px">
        <el-form-item>
          <el-upload
            ref="upload"
            :limit="1"
            accept=".xlsx, .xls,.png,.jpg,.doc,.docx,.txt"
            :headers="upload.headers"
            :action="upload.url"
            :disabled="upload.isUploading"
            :on-progress="handleFileUploadProgress"
            :on-success="handleFileSuccess"
            :auto-upload="false"
            :data="fileForm"
            drag
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <span>仅允许导入xls,xlsx,jpg,png,doc,docx,txt格式文件。</span>
          </el-upload>
        </el-form-item>
        <el-form-item label="文件类型" prop="fileType">
          <el-select v-model="fileForm.fileType" clearable placeholder="请选择文件类型" style="width: 380px">
            <el-option
              v-for="dict in dict.type.file_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文件备注" prop="des">
          <el-input v-model="fileForm.des" placeholder="文件备注" type="textarea"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog :title="title" :visible.sync="openCost" width="1200px" class="style" sappend-to-body>
      <template>
        <div class="app-container">
          <el-form :model="costQueryParams" ref="costQueryForm" :rules="costSelectRules" size="small" :inline="true"
                   v-show="showCostSearch"
                   label-width="90px"
          >
            <el-form-item label="里程碑名称" prop="milestoneName">
              <el-input
                disabled
                v-model="costQueryParams.milestoneName"
                placeholder="请输入里程碑名称"
                clearable
                @keyup.enter.native="handleCostQuery"
              />
            </el-form-item>
            <el-form-item
              label="金额区间"
              class="priceFormItem"
              prop="amount"
            >
              <el-form-item prop="min">
                <el-input v-model.number="costQueryParams.min" clearable=""/>
              </el-form-item>
              --
              <el-form-item prop="max">
                <el-input v-model.number="costQueryParams.max" clearable=""/>
              </el-form-item>
              <el-button type="primary" icon="el-icon-search" size="mini" @click="handleCostQuery">搜索</el-button>
              <el-button icon="el-icon-refresh" size="mini" @click="resetCostQuery">重置</el-button>
            </el-form-item>
          </el-form>
          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button
                type="primary"
                plain
                icon="el-icon-plus"
                size="mini"
                @click="handleCostAdd"
                v-hasPermi="['manage:cost:add']"
              >新增
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                type="info"
                plain
                icon="el-icon-upload2"
                size="mini"
                @click="handleCostImport"
              >上传
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                type="danger"
                plain
                icon="el-icon-delete"
                size="mini"
                :disabled="multiple"
                @click="handleCostDelete"
                v-hasPermi="['manage:cost:remove']"
              >删除
              </el-button>
              <el-button
                type="warning"
                plain
                icon="el-icon-download"
                size="mini"
                @click="handleCostExport"
                v-hasPermi="['manage:cost:export']"
              >导出
              </el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showCostSearch" @queryTable="getCostList"></right-toolbar>
          </el-row>

          <el-table v-loading="loading" :data="costList"
                    ref="costTable"
                    @filter-change="filterCostChanged"
                    @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column label="项目名称" align="center" prop="projectName"/>
            <el-table-column label="里程碑名称" align="center" prop="milestoneName"/>
            <el-table-column label="成本类型" align="center" prop="costType"
                             :filter-multiple="false"
                             :filters="[{ text: '人力成本', value: 1 }, { text: '物料成本', value: 2 }, { text: '差旅费用', value: 3 }, { text: '其他费用', value: 4 }]"
                             column-key="costType"
            >
              <template slot-scope="scope">
                <dict-tag :options="dict.type.cost_type" :value="scope.row.costType"/>
              </template>
            </el-table-column>
            <el-table-column label="金额" align="center" prop="amount"/>
            <el-table-column label="人天" align="center" prop="manDay"/>
            <el-table-column label="实际日期" align="center" prop="actualDate" width="180">
              <template slot-scope="scope">
                <span>{{ scope.row.actualDate }}</span>
              </template>
            </el-table-column>
            <el-table-column label="花费描述" align="center" prop="description"/>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="handleCostUpdate(scope.row)"
                  v-hasPermi="['manage:cost:edit']"
                >修改
                </el-button>
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                  @click="handleCostDelete(scope.row)"
                  v-hasPermi="['manage:cost:remove']"
                >删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-show="costTotal>0"
            :total="costTotal"
            :page.sync="costQueryParams.pageNum"
            :limit.sync="costQueryParams.pageSize"
            @pagination="getCostList"
          />

          <!-- 添加或修改【成本】对话框 -->
          <el-dialog :title="costTitle" :visible.sync="openCostChange" width="900px" append-to-body>
            <el-form ref="costForm" :model="costForm" :rules="costRules" label-width="100px">
              <el-form-item label="里程碑名称" prop="milestoneName">
                <el-input v-model="costForm.milestoneName" placeholder="请输入里程碑名称" style="width:720px" disabled/>
              </el-form-item>
              <el-form-item label="成本类型" prop="costType">
                <el-select v-model="costForm.costType" placeholder="请选择成本类型" style="width:720px"
                           @change="handleCostTypeChange"
                >
                  <el-option
                    v-for="dict in dict.type.cost_type"
                    :key="dict.value"
                    :label="dict.label"
                    :value="parseInt(dict.value)"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="金额" prop="amount">
                <el-input v-if="showNewInput === false" v-model.number="costForm.amount" placeholder="请输入金额"
                          style="width:720px"
                />
                <el-input v-if="showNewInput" v-model.number="costForm.amount" placeholder="请输入金额"
                          disabled style="width:720px"
                />
              </el-form-item>
              <el-form-item v-if="showNewInput" label="人天" prop="manDay">
                <el-input v-model.number="costForm.manDay" placeholder="请输入人天" style="width:720px"
                          @input="calculateCost"
                ></el-input>
              </el-form-item>
              <el-form-item label="实际日期" prop="actualDate">
                <el-date-picker clearable
                                v-model="costForm.actualDate"
                                type="date"
                                value-format="yyyy-MM-dd"
                                placeholder="请选择实际日期" style="width:720px"
                >
                </el-date-picker>
              </el-form-item>
              <el-form-item label="花费描述" prop="description">
                <el-input v-model="costForm.description" placeholder="请输入花费描述"
                          type="textarea"
                          :rows="2"
                          style="width:720px"
                />
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button type="primary" @click="submitCostForm">确 定</el-button>
              <el-button @click="cancelCost">取 消</el-button>
            </div>
          </el-dialog>
        </div>
      </template>
    </el-dialog>

    <!-- 项目对话框 -->
    <el-dialog :title="title" :visible.sync="openProject" width="800px" append-to-body>
      <el-form ref="projectForm" :model="projectForm" label-width="120px" :disabled="true">
        <el-form-item label="项目名称" prop="name">
          <el-input :value="projectForm.name" placeholder="项目名称" disabled style="width:600px"/>
        </el-form-item>
        <el-form-item label="公司名称" prop="companyName">
          <el-input :value="projectForm.companyName" placeholder="公司名称" disabled style="width:600px"/>
        </el-form-item>
        <el-form-item label="项目类型" prop="projectType">
          <el-select :value="projectForm.projectType" placeholder="项目类型" disabled style="width:600px">
            <el-option
              v-for="dict in dict.type.project_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="管理标准" prop="manageStandard">
          <el-select :value="projectForm.manageStandard" placeholder="管理标准" disabled style="width:600px">
            <el-option
              v-for="dict in dict.type.manage_standard"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目状态" prop="status">
          <el-select :value="projectForm.status" placeholder="项目状态" disabled style="width:600px">
            <el-option
              v-for="dict in dict.type.project_status"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目负责人" prop="directorName">
          <el-input :value="projectForm.directorName" placeholder="项目负责人" disabled style="width:600px"/>
        </el-form-item>
        <el-form-item label="客户对接人" prop="headName">
          <el-input :value="projectForm.headName" placeholder="客户对接人" disabled style="width:600px"/>
        </el-form-item>
        <el-form-item label="项目简介" prop="description">
          <el-input :value="projectForm.description" type="textarea" placeholder="项目简介" disabled
                    style="width:600px"
          />
        </el-form-item>
        <el-form-item label="评价" prop="des">
          <el-input :value="projectForm.des" type="textarea" placeholder="评价" disabled style="width:600px"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelProjectDialog">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 成本导入对话框 -->
    <el-dialog :title="uploadCost.title" :visible.sync="uploadCost.open" width="400px" style="height: 500px" append-to-body>
      <el-upload
        ref="uploadCostRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="uploadCost.headers"
        :action="uploadCost.url + '?updateSupport=' + uploadCost.updateSupport"
        :disabled="uploadCost.isUploading"
        :on-progress="handleCostFileUploadProgress"
        :on-success="handleCostFileSuccess"
        :auto-upload="false"
        :data="{
          milestoneId: dataMilestoneId,
        }"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <div class="el-upload__tip" slot="tip">
            <el-checkbox v-model="uploadCost.updateSupport"/>
            是否更新已经存在的成本数据
          </div>
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
                   @click="importTemplate"
          >下载模板
          </el-link>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitCostFileForm">确 定</el-button>
        <el-button @click="uploadCost.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addMilestone,
  delMilestone,
  getMilestone,
  listMilestone,
  milestoneListByProjectId,
  updateMilestone
} from '@/api/manage/milestone'
import { getProject, projectList } from '@/api/manage/project'
import { delFile, download, getFile, listFile } from '@/api/manage/file'
import { getToken } from '@/utils/auth'
import { addCost, delCost, getCost, listCost, updateCost } from '@/api/manage/cost'

export default {
  name: 'Milestone',
  dicts: ['milestone_status', 'contract_type', 'cost_type', 'profit_status', 'project_type', 'manage_standard', 'project_status', 'file_type'],
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
      // 显示文档搜索条件
      showFileSearch: true,
      // 显示文档搜索条件
      showCostSearch: true,
      // 总条数
      total: 0,
      // 文档总条数
      fileTotal: 0,
      // 文档总条数
      costTotal: 0,
      // 【里程碑】表格数据
      milestoneList: [],
      // 【文档】表格数据
      fileList: [],
      // 【成本】表格数据
      costList: [],
      // 弹出层标题
      title: '',
      // 成本弹出层标题
      costTitle: '',
      // 是否显示弹出层
      open: false,
      // 是否显示文档弹出层
      openDes: false,
      // 是否显示成本弹出层
      openCost: false,
      // 成本编辑对话框
      openCostChange: false,
      // 项目详情对话框
      openProject: false,
      //是否禁用参数
      isDisable: false,
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: '',
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/manage/file/upload',
        // 表单校验
        rules: {
          fileType: [
            {required: true, message: "文件类型不能为空", trigger: "change"}
          ]
        },
      },
      // 成本导入参数
      uploadCost: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: '',
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的成本数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: 'Bearer ' + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/manage/cost/importData'
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        projectId: null,
        projectName: null,
        status: null,
        dueDate: null,
        choseDueDate: [],
        dueDateStart: null,
        dueDateEnd: null,
        startTime: null,
        choseStartTime: [],
        startTimeStart: null,
        startTimeEnd: null,
        directorName: null,
        headName: null,
        contractPrice: null,
        contractType: null,
        humanPrice: null,
        description: null,
        isProfit: null,
        isDelete: null
      },
      // 查询参数
      fileQueryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        filePath: null,
        fileType: null,
        projectId: null,
        milestoneId: null,
        projectName: null,
        milestoneName: null,
        des: null,
        isDelete: null
      },
      // 查询参数
      costQueryParams: {
        pageNum: 1,
        pageSize: 10,
        projectId: null,
        milestoneId: null,
        costType: null,
        projectName: null,
        milestoneName: null,
        amount: null,
        manDay: null,
        actualDate: null,
        description: null,
        isDelete: null,
        min: '',
        max: ''
      },
      // 表单参数
      form: {},
      // 表单参数
      fileForm: {},
      // 表单参数
      costForm: {},
      // 项目表单参数
      projectForm: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: '里程碑名称不能为空', trigger: 'blur' }
        ],
        projectId: [
          { required: true, message: '项目id不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '里程碑状态不能为空', trigger: 'change' }
        ],
        contractPrice: [
          { required: true, type: 'number', message: '必须是数字', trigger: ['blur', 'change'] }
        ],
        humanPrice: [
          { required: true, type: 'number', message: '必须是数字', trigger: ['blur', 'change'] }
        ]
      },
      costRules: {
        costType: [
          { required: true, message: '成本类型不能为空', trigger: 'change' }
        ],
        amount: [
          { required: true, type: 'number', message: '必须是数字', trigger: ['blur', 'change'] }
        ],
        manDay: [
          { type: 'number', message: '必须是数字', trigger: ['blur', 'change'] }
        ],
        actualDate: [
          { required: true, message: '实际日期不能为空', trigger: 'change' }
        ]
      },
      costSelectRules: {
        min: [
          { required: true, message: '请输入最小值', trigger: 'blur' },
          { type: 'number', message: '最小值必须是数字', trigger: ['blur', 'change'] },
          { validator: this.validateMinMax('min'), trigger: 'blur' }
        ],
        max: [
          { required: true, message: '请输入最大值', trigger: 'blur' },
          { type: 'number', message: '最大值必须是数字', trigger: ['blur', 'change'] },
          { validator: this.validateMinMax('max'), trigger: 'blur' }
        ]
      },
      // 用于存储筛选后的里程碑数据
      filteredMilestones: [],
      // 项目列表
      projectList: [],
      // 控制新输入框的显示状态
      showNewInput: false,
      // 人天单价
      humanPrice: null,
      //日期校验
      dateRange: {
        disabledDate(time) {
          return new Date(time).getTime() < new Date(time).getTime()
        }
      },
      //表头筛选
      columnKey: ['contractType', 'status', 'isProfit'],
      dataMilestoneId: ''
    }
  },
  created() {
    this.queryParams.projectId = this.$route.query.projectId
    this.getProjectList()
    if (this.$route.query.projectId) {
      this.fetchMilestones()
    } else {
      this.getList()
    }
  },
  methods: {
    fetchMilestones() {
      // 如果 projectId 存在，则根据 projectId 获取里程碑数据
      this.loading = true
      milestoneListByProjectId(this.$route.query.projectId).then(response => {
        this.milestoneList = response.rows
        this.total = response.total
        this.loading = false
      }).catch(error => {
        // 处理错误，比如显示错误消息或重置加载状态
        console.error('Failed to fetch milestones:', error)
        this.loading = false
      })
    },

    getProjectList() {
      projectList().then(response => {
        this.projectList = response.data
      })
    },
    /** 查询【请填写功能名称】列表 */
    getList() {
      this.loading = true
      listMilestone(this.queryParams).then(response => {
        this.milestoneList = response.rows
        this.total = response.total
        this.loading = false
        console.log(this.milestoneList)

      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.isDisable = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        name: null,
        projectId: null,
        projectName: null,
        status: null,
        dueDate: null,
        startTime: null,
        directorName: null,
        headName: null,
        contractPrice: null,
        contractType: null,
        humanPrice: null,
        cost: null,
        description: null,
        isDelete: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      }
      this.resetForm('form')
    },
    // 表单重置
    resetFile() {
      this.fileForm = {
        id: null,
        name: null,
        filePath: null,
        fileType: null,
        projectId: null,
        milestoneId: null,
        projectName: null,
        milestoneName: null,
        des: null,
        isDelete: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      }
      this.resetForm('fileForm')
    },
    // 成本表单重置
    resetCost() {
      this.costForm = {
        id: null,
        projectId: null,
        milestoneId: null,
        costType: null,
        projectName: null,
        milestoneName: null,
        amount: null,
        manDay: null,
        actualDate: null,
        description: null,
        isDelete: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      }
      this.resetForm('costForm')
    },
    // 项目表单重置
    resetProject() {
      this.projectForm = {
        id: null,
        name: null,
        companyName: null,
        projectType: null,
        manageStandard: null,
        status: null,
        directorName: null,
        headName: null,
        description: null,
        amount: null,
        cost: null,
        des: null,
        isDelete: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      }
      this.resetForm('projectForm')
    },
    /** 打开文件对话框 */
    openFileDialog(row) {
      this.resetFile()
      const id = row.id
      this.fileForm.projectName = row.projectName
      this.fileForm.projectId = row.projectId
      this.fileForm.milestoneId = row.id
      this.fileForm.milestoneName = row.name
      this.fileQueryParams.projectName = row.projectName
      this.fileQueryParams.projectId = row.projectId
      this.fileQueryParams.milestoneName = row.name
      this.title = '【文档上传】'
      this.getFileList()
      this.openDes = true
    },
    /** 查询【请填写功能名称】列表 */
    getFileList() {
      this.loading = true
      listFile(this.fileQueryParams).then(response => {
        this.fileList = response.rows
        this.fileTotal = response.total
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleFileQuery() {
      this.fileQueryParams.pageNum = 1
      this.getFileList()
    },
    /** 重置按钮操作 */
    resetFileQuery() {
      this.fileQueryParams.name = null
      this.handleFileQuery()
    },
    /** 删除文件 */
    handleFileDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除该文件？').then(function() {
        return delFile(ids)
      }).then(() => {
        this.getFileList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    },
    handleFileUpdate(row) {
      this.resetFile();
      const id = row.id
      getFile(id).then(response => {
        this.fileForm = response.data
        this.upload.open = true
        this.upload.title = '文件替换'
      })
    },

    /** 里程碑过滤器  */
    filterChanged(filters) {
      for (const key in filters) {
        if (key === 'contractType') {
          this.queryParams.contractType = filters['contractType'][0]
        }
        if (key === 'status') {
          this.queryParams.status = filters['status'][0]
        }
        if (key === 'isProfit') {
          this.queryParams.isProfit = filters['isProfit'][0]
        }
      }
      this.queryParams.pageNum = 1
      this.getList()
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case 'handleUpdate':
          this.handleUpdate(row)
          break
        case 'handleDelete':
          this.handleDelete(row)
          break
        default:
          break
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      // 处理日期
      this.queryParams.dueDateStart = this.queryParams.choseDueDate ? this.queryParams.choseDueDate[0] : null
      this.queryParams.dueDateEnd = this.queryParams.choseDueDate ? this.queryParams.choseDueDate[1] : null
      this.queryParams.startTimeStart = this.queryParams.choseStartTime ? this.queryParams.choseStartTime[0] : null
      this.queryParams.startTimeEnd = this.queryParams.choseStartTime ? this.queryParams.choseStartTime[1] : null
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.$refs.milestoneTable.clearFilter()
      this.resetForm('queryForm')
      this.queryParams.contractType = null
      this.queryParams.status = null
      this.queryParams.isProfit = null
      this.queryParams.projectId = null
      this.queryParams.choseDueDate = []
      this.queryParams.choseStartTime = []
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.isDisable = false
      this.reset()
      this.open = true
      this.form.projectId = this.queryParams.projectId
      this.title = '【新增里程碑】'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.isDisable = false
      this.reset()
      const id = row.id || this.ids
      getMilestone(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '【修改里程碑】'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateMilestone(this.form).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addMilestone(this.form).then(response => {
              this.$modal.msgSuccess('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除该里程碑？').then(function() {
        return delMilestone(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    },
    /** 导入按钮操作 */
    handleImport() {
      this.fileForm.id = null
      this.fileForm.fileType = null
      this.fileForm.des = null
      this.upload.title = '用户导入'
      this.upload.open = true
      this.$nextTick(()=>{
        this.$refs.upload.clearFiles()
      })
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false
      this.upload.isUploading = false
      this.$refs.upload.clearFiles()
      this.getFileList()
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs['fileForm'].validate(valid => {
        if (valid) {
          this.$refs.upload.submit()
        }
      })
    },

    //下载文件
    downloadFile(row) {
      download(row.id).then(response => {
        const blob = new Blob([response])
        let objectUrl = window.URL.createObjectURL(blob) // 创建URL
        let link = document.createElement('a')
        link.href = objectUrl
        link.download = row.name // 自定义文件名
        link.click() // 下载文件
      })
    },
    /** 打开成本对话框 */
    openCostDialog(row) {
      this.dataMilestoneId = row.id
      this.resetCost()
      const id = row.id
      this.costQueryParams.projectId = row.projectId
      this.costQueryParams.milestoneId = row.id
      this.costQueryParams.milestoneName = row.name
      this.humanPrice = row.humanPrice
      this.getCostList()
      this.title = '【成本清单】'
      this.openCost = true
    },
    /** 项目状态过滤器  */
    filterCostChanged(filters) {
      for (const key in filters) {
        if (key === 'costType') {
          this.costQueryParams.costType = filters['costType'][0]
        }
      }
      this.costQueryParams.pageNum = 1
      this.getCostList()
    },
    /** 查询【成本】列表 */
    getCostList() {
      this.loading = true
      listCost(this.costQueryParams).then(response => {
        this.costList = response.rows
        this.costTotal = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancelCost() {
      this.openCostChange = false
      this.resetCost()
    },
    /** 搜索按钮操作 */
    handleCostQuery() {
      this.costQueryParams.pageNum = 1
      this.getCostList()
    },
    /** 重置按钮操作 */
    resetCostQuery() {
      this.$refs.costTable.clearFilter()
      this.resetForm('costQueryForm')
      this.costQueryParams.costType = null
      this.handleCostQuery()
    },
    /** 新增按钮操作 */
    handleCostAdd() {
      this.resetCost()
      this.showNewInput = false
      this.costForm.projectId = this.costQueryParams.projectId
      this.costForm.projectName = this.costQueryParams.projectName
      this.costForm.milestoneId = this.costQueryParams.milestoneId
      this.costForm.milestoneName = this.costQueryParams.milestoneName
      this.openCostChange = true
      this.costTitle = '【新增成本】'
    },
    /** 修改按钮操作 */
    handleCostUpdate(row) {
      this.resetCost()
      if (row.costType === 1) {
        this.showNewInput = true
      } else {
        this.showNewInput = false
      }
      const id = row.id || this.ids
      this.costForm.projectId = this.costQueryParams.projectId
      this.costForm.projectName = this.costQueryParams.projectName
      this.costForm.milestoneId = this.costQueryParams.milestoneId
      this.costForm.milestoneName = this.costQueryParams.milestoneName
      getCost(id).then(response => {
        this.costForm = response.data
        this.openCostChange = true
        this.costTitle = '【修改成本】'
      })
    },
    /** 提交按钮 */
    submitCostForm() {
      if (this.showNewInput === false) {
        this.costForm.manDay = 0
      }
      this.$refs['costForm'].validate(valid => {
        if (valid) {
          if (this.costForm.id != null) {
            updateCost(this.costForm).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.openCostChange = false
              this.getCostList()
              this.getList()
            })
          } else {
            addCost(this.costForm).then(response => {
              this.$modal.msgSuccess('新增成功')
              this.openCostChange = false
              this.getCostList()
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleCostDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除改成本数据项？').then(function() {
        return delCost(ids)
      }).then(() => {
        this.getCostList()
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {
      })
    },
    /** 金额区间判断 */
    validateMinMax(type) {
      return (rule, value, callback) => {
        const min = this.costQueryParams.min
        const max = this.costQueryParams.max

        if (type === 'min') {
          if (value && max && Number(value) > Number(max)) {
            callback(new Error('最小值不能大于最大值'))
          }
          // 检查最小值是否小于0（如果需要的话）
          else if (Number(value) < 0) {
            callback(new Error('最小值不能小于0'))
          } else {
            callback()
          }
        } else if (type === 'max') {
          if (value && min && Number(value) < Number(min)) {
            callback(new Error('最大值不能小于最小值'))
          } // 检查最小值是否小于0（如果需要的话）
          else if (Number(value) < 0) {
            callback(new Error('最大值不能小于0'))
          } else {
            callback()
          }
        }
      }
    },
    /** 打开项目详情对话框 */
    openProjectDialog(row) {
      this.resetProject()
      const id = row.projectId
      getProject(id).then(response => {
        this.projectForm = response.data
        this.openProject = true
        this.title = '【项目详情】'
      })
    },
    /** 取消项目详情对话框 */
    cancelProjectDialog() {
      this.resetProject()
      this.openProject = false
    },
    /** 打开项目详情对话框 */
    openMilestoneDialog(row) {
      this.reset();
      const id = row.id || this.ids
      getMilestone(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.isDisable = true;
        this.title = "【里程碑详情】";
      });
    },
    /** 成本类型判断 */
    handleCostTypeChange(value) {
      this.showNewInput = value === 1
    },
    /** 人天单价成本计算 */
    calculateCost() {
      if (this.costForm.manDay && this.humanPrice) {
        this.costForm.amount = this.costForm.manDay * this.humanPrice
      } else {
        this.costForm.amount = null
      }
    },
    /** 导出按钮操作 */
    handleCostExport() {
      this.download('manage/cost/export', {
        ...this.costQueryParams
      }, `cost_${new Date().getTime()}.xlsx`)
    },
    /** 导入按钮操作 */
    handleCostImport() {
      this.uploadCost.title = '成本导入'
      this.uploadCost.open = true
    },
    /** 下载成本导入模板 */
    importTemplate() {
      this.download('manage/cost/importTemplate', {}, `成本导入模板.xlsx`)
    },
    // 文件上传中处理
    handleCostFileUploadProgress(event, file, fileList) {
      this.uploadCost.isUploading = true
    },
    // 文件上传成功处理
    handleCostFileSuccess(response, file, fileList) {
      this.uploadCost.open = false
      this.uploadCost.isUploading = false
      this.$refs.uploadCostRef.clearFiles()
      this.$alert('<div style=\'overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;\'>' + response.msg + '</div>', '导入结果', { dangerouslyUseHTMLString: true })
      this.getCostList()
    },
    // 提交上传文件
    submitCostFileForm() {
      this.$refs.uploadCostRef.submit();
      this.getList()
    }
  },
  watch: {
    showNewInput(newVal) {
      if (newVal) {
        this.costForm.amount = null // 同样的清空逻辑
      }
    }
  }
}
</script>
<style scoped>
::v-deep .el-dialog {
  height: 84vh;
  overflow: auto;
}
</style>
