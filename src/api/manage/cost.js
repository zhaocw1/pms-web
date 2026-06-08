import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listCost(query) {
  return request({
    url: '/manage/cost/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getCost(id) {
  return request({
    url: '/manage/cost/' + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addCost(data) {
  return request({
    url: '/manage/cost',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateCost(data) {
  return request({
    url: '/manage/cost',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delCost(id) {
  return request({
    url: '/manage/cost/' + id,
    method: 'delete'
  })
}

// 获取cost
export function costByMilestoneId(id) {
  return request({
    url: '/manage/cost/getByMilestoneId/' + id,
    method: 'get'
  })
}

// 成本类型
export function costTypeList(id) {
  return request({
    url: '/manage/cost/costTypeList/' + id,
    method: 'get'
  })
}

// 成本类型
export function getBarDataList(data) {
  return request({
    url: '/manage/cost/getBarDataList',
    method: 'post',
    data: data,
  })
}
// 成本类型
export function getLineDataList(data) {
  return request({
    url: '/manage/cost/getLineDataList',
    method: 'post',
    data: data,
  })
}
