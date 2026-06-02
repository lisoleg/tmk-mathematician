/**
 * 球体详情面板
 * 展示选中金灵球的详细信息、端口状态、EML 数值
 */

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Divider,
  Grid,
  Paper,
  Tooltip,
} from '@mui/material';
import type { JinlingSphere } from '../types/tmk';
import { PORT, PORT_NAMES, PORT_DIRECTION, PORT_CHIRALITY } from '../types/tmk';
import { emlString, emlValue, getActivePorts } from '../core/JinlingSphere';

interface SphereDetailPanelProps {
  sphere: JinlingSphere | null;
  onUpdateSphere: (sid: string, updater: (s: JinlingSphere) => JinlingSphere) => void;
}

const portList = [
  { mask: PORT.cn, label: 'CN', full: '构造北入' },
  { mask: PORT.cx, label: 'CX', full: '构造南出' },
  { mask: PORT.ce, label: 'CE', full: '构造东入' },
  { mask: PORT.cw, label: 'CW', full: '构造西出' },
  { mask: PORT.an, label: 'AN', full: '消解北入' },
  { mask: PORT.ax, label: 'AX', full: '消解南出' },
  { mask: PORT.ae, label: 'AE', full: '消解东入' },
  { mask: PORT.aw, label: 'AW', full: '消解西出' },
  { mask: PORT.obs, label: 'OBS', full: '观察' },
  { mask: PORT.self, label: 'SELF', full: '自指' },
];

const SphereDetailPanel: React.FC<SphereDetailPanelProps> = ({ sphere, onUpdateSphere }) => {
  if (!sphere) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          点击画布中的球体查看详情
        </Typography>
      </Box>
    );
  }

  const [re, im] = emlValue(sphere);
  const activePorts = getActivePorts(sphere);

  return (
    <Box sx={{ p: 1.5 }}>
      {/* 球体标识 */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7c4dff', mb: 0.5 }}>
        球体详情
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
        {sphere.sid}
      </Typography>

      <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
        <Chip
          label={sphere.chi === 1 ? 'χ = +1 构造' : 'χ = -1 消解'}
          size="small"
          sx={{
            bgcolor: sphere.chi === 1 ? 'rgba(46,125,50,0.15)' : 'rgba(198,40,40,0.15)',
            color: sphere.chi === 1 ? '#2e7d32' : '#c62828',
            fontWeight: 700,
          }}
        />
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* 核心属性 */}
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        核心属性
      </Typography>
      <Grid container spacing={0.5} sx={{ mt: 0.5 }}>
        <Grid item xs={6}>
          <Paper variant="outlined" sx={{ p: 0.5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">i_int</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
              {sphere.i_int}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper variant="outlined" sx={{ p: 0.5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">模 m</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
              {sphere.mod}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper variant="outlined" sx={{ p: 0.5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">相位 θ</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
              {sphere.phase.toFixed(4)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper variant="outlined" sx={{ p: 0.5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">端口</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
              {activePorts.length}/10
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1 }} />

      {/* EML 数值 */}
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        EML 数值
      </Typography>
      <Paper variant="outlined" sx={{ p: 1, mt: 0.5, bgcolor: 'rgba(124,77,255,0.05)' }}>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
          z = {sphere.mod} ⊗ e^(i·{sphere.phase.toFixed(2)})
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
          = {re.toFixed(4)} + {im.toFixed(4)}i
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#7c4dff' }}>
          |z| = {Math.sqrt(re * re + im * im).toFixed(4)}
        </Typography>
      </Paper>

      <Divider sx={{ my: 1 }} />

      {/* N₈ 端口状态 */}
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        N₈ 端口状态
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0.5, mt: 0.5 }}>
        {portList.map(p => {
          const isActive = (sphere.ports & p.mask) !== 0;
          const direction = PORT_DIRECTION[p.mask];
          const chirality = PORT_CHIRALITY[p.mask];

          let color = '#666';
          if (chirality === 'construct') color = '#4CAF50';
          else if (chirality === 'annihilate') color = '#f44336';
          else color = '#FF9800';

          return (
            <Tooltip key={p.mask} title={`${p.full} (${direction})`} arrow>
              <Paper
                variant="outlined"
                sx={{
                  p: 0.3,
                  textAlign: 'center',
                  bgcolor: isActive ? `${color}22` : 'transparent',
                  borderColor: isActive ? color : '#444',
                  opacity: isActive ? 1 : 0.4,
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: isActive ? color : '#666', fontWeight: isActive ? 700 : 400 }}>
                  {p.label}
                </Typography>
              </Paper>
            </Tooltip>
          );
        })}
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* 二进制端口表示 */}
      <Typography variant="caption" color="text.secondary">
        端口位掩码: {sphere.ports.toString(2).padStart(10, '0')}₂ = {sphere.ports}₁₀
      </Typography>
    </Box>
  );
};

export default SphereDetailPanel;
