import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listMilestone(query) {
  return request({
    url: '/manage/milestone/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getMilestone(id) {
  return request({
    url: '/manage/milestone/' + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addMilestone(data) {
  return request({
    url: '/manage/milestone',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateMilestone(data) {
  return request({
    url: '/manage/milestone',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delMilestone(id) {
  return request({
    url: '/manage/milestone/' + id,
    method: 'delete'
  })
}

// 通过projectId查询
export function milestoneListByProjectId(id) {
  return request({
    url: '/manage/milestone/listByProjectId/' + id,
    method: 'get',
  })
}

// 查询饼状图数据
export function pieDataList(query) {
  return request({
    url: '/manage/milestone/pieDataList',
    method: 'get',
    params: query
  })
}

// 查询饼状图数据
export function getMilestoneNameList() {
  return request({
    url: '/manage/milestone/milestoneNameList',
    method: 'get'
  })
}
