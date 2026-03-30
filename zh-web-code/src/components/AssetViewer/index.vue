<template>
  <el-dialog
    :title="$t('common.assetViewer.title')"
    :visible.sync="dialogVisible"
    width="900px"
    :close-on-click-modal="false"
    :modal="true"
    :lock-scroll="false"
    :z-index="3000"
    append-to-body
    @open="loadAssets"
  >
    <!-- 顶部状态栏 -->
    <div class="asset-header">
      <div class="sync-info">
        <el-tag type="info" size="small">
          <i class="el-icon-time"></i>
          {{ syncInfo.last_sync_time ? formatTime(syncInfo.last_sync_time) : $t('common.assetViewer.status.notSynced') }}
        </el-tag>
        <el-tag type="success" size="small" style="margin-left: 10px;">
          <i class="el-icon-files"></i>
          {{ $t('common.assetViewer.status.totalAssets', { count: syncInfo.total_assets }) }}
        </el-tag>
        <el-tag 
          :type="syncInfo.cache_valid ? 'success' : 'warning'" 
          size="small" 
          style="margin-left: 10px;"
        >
          <i class="el-icon-circle-check"></i>
          {{ syncInfo.cache_valid ? $t('common.assetViewer.status.cacheValid') : $t('common.assetViewer.status.cacheExpired') }}
        </el-tag>
      </div>
      <div class="action-buttons">
        <el-button 
          type="primary" 
          size="mini" 
          icon="el-icon-refresh" 
          :loading="syncing"
          @click="syncAssets"
        >
          {{ $t('common.assetViewer.button.refresh') }}
        </el-button>
        <el-button 
          type="success" 
          size="mini" 
          icon="el-icon-download"
          @click="downloadYaml"
        >
          {{ $t('common.assetViewer.button.downloadYaml') }}
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchText"
        :placeholder="$t('common.assetViewer.search.placeholder')"
        prefix-icon="el-icon-search"
        clearable
        size="small"
        style="width: 300px;"
      />
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-card 
        v-for="(count, type) in statistics" 
        :key="type"
        class="stat-card"
        shadow="hover"
      >
        <div class="stat-content">
          <div class="stat-icon" :style="{ backgroundColor: getTypeColor(type) }">
            <i :class="getTypeIcon(type)"></i>
          </div>
          <div class="stat-info">
            <div class="stat-type">{{ getTypeName(type) }}</div>
            <div class="stat-count">{{ count }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 资产表格 -->
    <div class="asset-table">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 按类型分组视图 -->
        <el-tab-pane :label="$t('common.assetViewer.tabs.grouped')" name="grouped">
          <el-collapse v-model="activeCollapse" accordion>
            <el-collapse-item 
              v-for="(assets, type) in filteredAssetsByType" 
              :key="type"
              :name="type"
            >
              <template slot="title">
                <span class="collapse-title">
                  <i :class="getTypeIcon(type)" :style="{ color: getTypeColor(type) }"></i>
                  {{ getTypeName(type) }} ({{ assets.length }})
                </span>
              </template>
              
              <el-table 
                :data="assets" 
                stripe 
                size="small"
                :height="300"
              >
                <el-table-column prop="ip" :label="$t('common.assetViewer.table.ip')" width="150" />
                <el-table-column prop="port" :label="$t('common.assetViewer.table.port')" width="100" />
                <el-table-column prop="instance" :label="$t('common.assetViewer.table.instance')" width="200" />
                <el-table-column :label="$t('common.assetViewer.table.status')" width="100">
                  <template slot-scope="scope">
                    <el-tag :type="scope.row.is_active ? 'success' : 'danger'" size="mini">
                      {{ scope.row.is_active ? $t('common.assetViewer.statusText.online') : $t('common.assetViewer.statusText.offline') }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('common.assetViewer.table.prometheusLabels')" min-width="200">
                  <template slot-scope="scope">
                    <el-tag 
                      v-for="(value, key) in scope.row.prometheus_labels" 
                      :key="key"
                      size="mini"
                      style="margin: 2px;"
                    >
                      {{ key }}: {{ value }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </el-tab-pane>

        <!-- 列表视图 -->
        <el-tab-pane :label="$t('common.assetViewer.tabs.list')" name="list">
          <el-table 
            :data="filteredRawData" 
            stripe 
            size="small"
            :height="400"
          >
            <el-table-column prop="monitor_ip" :label="$t('common.assetViewer.table.ip')" width="150" />
            <el-table-column prop="monitor_port" :label="$t('common.assetViewer.table.port')" width="100">
              <template slot-scope="scope">
                {{ scope.row.monitor_port || $t('common.assetViewer.statusText.na') }}
              </template>
            </el-table-column>
            <el-table-column prop="type_name" :label="$t('common.assetViewer.table.type')" width="120">
              <template slot-scope="scope">
                <el-tag 
                  :type="getTagType(scope.row.type_name)" 
                  size="mini"
                >
                  {{ getTypeName(scope.row.type_name) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="instance" :label="$t('common.assetViewer.table.instance')" width="200" />
            <el-table-column :label="$t('common.assetViewer.table.status')" width="100">
              <template slot-scope="scope">
                <el-tag :type="scope.row.is_active ? 'success' : 'danger'" size="mini">
                  {{ scope.row.is_active ? $t('common.assetViewer.statusText.online') : $t('common.assetViewer.statusText.offline') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.assetViewer.table.prometheusLabels')" min-width="200">
              <template slot-scope="scope">
                <div class="label-tags">
                  <el-tag 
                    v-for="(value, key) in scope.row.prometheus_labels" 
                    :key="key"
                    size="mini"
                    style="margin: 2px;"
                  >
                    {{ key }}: {{ value }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">{{ $t('common.assetViewer.button.close') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'AssetViewer',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      syncing: false,
      searchText: '',
      activeTab: 'grouped',
      activeCollapse: '',
      syncInfo: {
        last_sync_time: null,
        cache_age_seconds: null,
        cache_valid: false,
        total_assets: 0
      },
      assetsByType: {},
      statistics: {},
      rawData: []
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    filteredAssetsByType() {
      if (!this.searchText) return this.assetsByType
      
      const filtered = {}
      Object.entries(this.assetsByType).forEach(([type, assets]) => {
        const matchedAssets = assets.filter(asset => 
          asset.ip.includes(this.searchText) || 
          (asset.port && asset.port.includes(this.searchText)) ||
          asset.instance.includes(this.searchText)
        )
        if (matchedAssets.length > 0) {
          filtered[type] = matchedAssets
        }
      })
      return filtered
    },
    filteredRawData() {
      if (!this.searchText) return this.rawData
      
      return this.rawData.filter(asset =>
        asset.monitor_ip.includes(this.searchText) ||
        (asset.monitor_port && asset.monitor_port.includes(this.searchText)) ||
        asset.instance.includes(this.searchText)
      )
    }
  },
  methods: {
    async loadAssets() {
      try {
        const response = await request({
          url: '/api/v1/assets/view',
          method: 'get'
        })
        
        if (response.success) {
          this.syncInfo = response.data.sync_info
          this.assetsByType = response.data.assets_by_type
          this.statistics = response.data.statistics
          this.rawData = response.data.raw_data
        } else {
          this.$message.error(this.$t('common.assetViewer.message.loadFailed'))
        }
      } catch (error) {
        console.error('加载资产失败:', error)
        this.$message.error(this.$t('common.assetViewer.message.loadFailed') + ': ' + (error.message || '未知错误'))
      }
    },
    
    async syncAssets() {
      this.syncing = true
      try {
        const response = await request({
          url: '/api/v1/assets/sync',
          method: 'post'
        })
        
        if (response.success) {
          this.$message.success(
            this.$t('common.assetViewer.message.syncSuccess', {
              total: response.data.total,
              new: response.data.new,
              updated: response.data.updated
            })
          )
          await this.loadAssets()
        } else {
          this.$message.error(response.message || this.$t('common.assetViewer.message.syncFailed'))
        }
      } catch (error) {
        console.error('同步资产失败:', error)
        this.$message.error(this.$t('common.assetViewer.message.syncFailed') + ': ' + (error.message || '未知错误'))
      } finally {
        this.syncing = false
      }
    },
    
    async downloadYaml() {
      try {
        // 直接使用完整路径，window.open不会使用axios的baseURL配置
        const downloadUrl = '/admin-api/api/v1/assets/export/yaml'
        window.open(downloadUrl, '_blank')
        this.$message.success(this.$t('common.assetViewer.message.downloadStarted'))
      } catch (error) {
        console.error('下载YAML失败:', error)
        this.$message.error(this.$t('common.assetViewer.message.downloadFailed'))
      }
    },
    
    formatTime(timeStr) {
      if (!timeStr) return 'N/A'
      const date = new Date(timeStr)
      const now = new Date()
      const diff = Math.floor((now - date) / 1000)
      
      if (diff < 60) return `${diff}秒前`
      if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
      if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
      return `${Math.floor(diff / 86400)}天前`
    },
    
    getTypeName(type) {
      return this.$t(`common.assetViewer.type.${type}`) || type
    },
    
    getTypeIcon(type) {
      const icons = {
        mysql: 'el-icon-coin',
        system: 'el-icon-cpu',
        redis: 'el-icon-box',
        kafka: 'el-icon-message',
        elasticsearch: 'el-icon-search',
        nginx: 'el-icon-truck',
        docker: 'el-icon-files',
        tomcat: 'el-icon-coffee-cup'
      }
      return icons[type] || 'el-icon-document'
    },
    
    getTypeColor(type) {
      const colors = {
        mysql: '#409EFF',
        system: '#67C23A',
        redis: '#E6A23C',
        kafka: '#F56C6C',
        elasticsearch: '#909399',
        nginx: '#00C1DE',
        docker: '#2496ED',
        tomcat: '#F8991D'
      }
      return colors[type] || '#909399'
    },
    
    getTagType(type) {
      const types = {
        mysql: 'primary',
        system: 'success',
        redis: 'warning',
        kafka: 'danger',
        elasticsearch: 'info',
        nginx: 'primary',
        docker: 'success',
        tomcat: 'warning'
      }
      return types[type] || 'info'
    }
  }
}
</script>

<style scoped>
.asset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.sync-info {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.search-bar {
  margin-bottom: 20px;
}

.statistics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-type {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stat-count {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.asset-table {
  margin-top: 20px;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  font-size: 14px;
}

.collapse-title i {
  font-size: 18px;
}

.label-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

::v-deep .el-collapse-item__header {
  font-size: 14px;
  padding: 0 20px;
}

::v-deep .el-card__body {
  padding: 15px;
}

::v-deep .el-tabs--border-card {
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>

