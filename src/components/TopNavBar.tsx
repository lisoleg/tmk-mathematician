/**
 * 顶部导航栏组件
 * 包含 TMK 标题、层级切换、主题切换
 */

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ScienceIcon from '@mui/icons-material/Science';
import type { Layer } from '../types/tmk';

interface TopNavBarProps {
  layer: Layer;
  onLayerChange: (layer: Layer) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onReset: () => void;
  onLoadDemo: () => void;
}

const LAYERS: Layer[] = ['L1', 'L2', 'L3', 'L4', 'L5'];
const LAYER_LABELS: Record<Layer, string> = {
  L1: 'L₁ 元层',
  L2: 'L₂ 结构层',
  L3: 'L₃ 动力学层',
  L4: 'L₄ 现象层',
  L5: 'L₅ 截影层',
};

const TopNavBar: React.FC<TopNavBarProps> = ({
  layer,
  onLayerChange,
  darkMode,
  onToggleDarkMode,
  onReset,
  onLoadDemo,
}) => {
  return (
    <AppBar position="static" elevation={1} sx={{ bgcolor: '#1a1a2e' }}>
      <Toolbar variant="dense" sx={{ minHeight: 48 }}>
        <AutoGraphIcon sx={{ mr: 1, color: '#7c4dff' }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #7c4dff 0%, #00b0ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mr: 3,
          }}
        >
          TMK 数学家
        </Typography>

        <ToggleButtonGroup
          size="small"
          value={layer}
          exclusive
          onChange={(_, v) => v && onLayerChange(v)}
          sx={{ mr: 2, '& .MuiToggleButton-root': { color: '#aaa', borderColor: '#444', py: 0.3, fontSize: '0.75rem' } }}
        >
          {LAYERS.map(l => (
            <ToggleButton key={l} value={l} sx={{
              '&.Mui-selected': { color: '#7c4dff', bgcolor: 'rgba(124,77,255,0.15)', borderColor: '#7c4dff' }
            }}>
              {LAYER_LABELS[l]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Box sx={{ flex: 1 }} />

        <Tooltip title="加载演示数据">
          <IconButton size="small" onClick={onLoadDemo} sx={{ color: '#aaa', mr: 0.5 }}>
            <ScienceIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="重置">
          <IconButton size="small" onClick={onReset} sx={{ color: '#aaa', mr: 0.5 }}>
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={darkMode ? '切换亮色模式' : '切换暗色模式'}>
          <IconButton size="small" onClick={onToggleDarkMode} sx={{ color: '#aaa' }}>
            {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavBar;
