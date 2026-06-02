/**
 * ICEPanel.tsx — ICE 自指闭环面板
 * 显示 ICE 激活状态、循环计数、快照时间线、当前假说
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  keyframes,
} from '@mui/material';
import type { ICEState } from '../core/iceEngine';

interface ICEPanelProps {
  iceState: ICEState;
  onTickICE: () => void;
  onToggleICE: () => void;
  onClearICE: () => void;
}

/** ℐ ℂ ℰ 脉冲动画 */
const glow = keyframes`
  0% { text-shadow: 0 0 4px currentColor; }
  50% { text-shadow: 0 0 12px currentColor; }
  100% { text-shadow: 0 0 4px currentColor; }
`;

const ACTION_ICONS: Record<string, { symbol: string; color: string; label: string }> = {
  introspect: { symbol: 'ℐ', color: '#2196F3', label: '内省' },
  conjecture: { symbol: 'ℂ', color: '#9C27B0', label: '假说' },
  execute: { symbol: 'ℰ', color: '#4CAF50', label: '执行' },
  idle: { symbol: '○', color: '#666', label: '空闲' },
};

const ICEPanel: React.FC<ICEPanelProps> = ({
  iceState,
  onTickICE,
  onToggleICE,
  onClearICE,
}) => {
  const currentAction = ACTION_ICONS[iceState.lastActionType];
  const recentSnapshots = iceState.snapshots.slice(-5);

  return (
    <Box sx={{ p: 1.5 }}>
      {/* 控制栏 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Switch
          checked={iceState.isActive}
          onChange={onToggleICE}
          size="small"
          color="primary"
        />
        <Typography variant="subtitle2" sx={{ flex: 1 }}>
          ICE 自指闭环
        </Typography>
        <Chip
          label={iceState.isActive ? '运行中' : '已暂停'}
          size="small"
          color={iceState.isActive ? 'success' : 'default'}
          variant="outlined"
          sx={{ fontSize: '0.7rem', height: 20 }}
        />
      </Box>

      {/* 循环计数器 + 当前动作 */}
      <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              循环计数
            </Typography>
            <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              {iceState.cycleCount}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: currentAction.color,
                animation: iceState.isActive ? `${glow} 2s ease-in-out infinite` : 'none',
                lineHeight: 1,
              }}
            >
              {currentAction.symbol}
            </Typography>
            <Typography variant="caption" sx={{ color: currentAction.color }}>
              {currentAction.label}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column' }}>
            <Button
              variant="contained"
              size="small"
              onClick={onTickICE}
              disabled={!iceState.isActive}
              sx={{ fontSize: '0.65rem', py: 0.3 }}
            >
              手动 TICK
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={onClearICE}
              sx={{ fontSize: '0.65rem', py: 0.3 }}
            >
              清空
            </Button>
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ my: 1 }} />

      {/* 快照时间线 */}
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        📸 快照时间线
      </Typography>
      {recentSnapshots.length > 0 ? (
        <List dense sx={{ py: 0 }}>
          {recentSnapshots.map((snapshot) => (
            <ListItem key={snapshot.id} sx={{ py: 0.3, px: 1 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    color: 'primary.main',
                    fontWeight: 'bold',
                  }}
                >
                  #{snapshot.id}
                </Typography>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                    {snapshot.heapSummary.topologyHash} · S_rel={snapshot.heapSummary.sRel.toFixed(3)} · N={snapshot.heapSummary.nodeCount}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }} noWrap>
                    {snapshot.selfReflection.substring(0, 80)}...
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          尚无快照记录
        </Typography>
      )}

      <Divider sx={{ my: 1 }} />

      {/* 当前 Conjecture */}
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        💡 当前假说
      </Typography>
      <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'rgba(156,39,176,0.05)' }}>
        <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.6 }}>
          {iceState.currentConjecture}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ICEPanel;
