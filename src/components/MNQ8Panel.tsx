/**
 * MNQ8Panel.tsx — MNQ8 更新律控制面板
 * 运行 MNQ8 步骤、显示 CONFINED/DISPERSED 状态、HEX_RING_GAP 触发指示
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Divider,
  keyframes,
} from '@mui/material';
import type { JinlingHeap } from '../types/tmk';
import type { MNQ8Result } from '../core/mnq8';
import { MASS_THRESHOLD, BOUNDARY_LEAK_LIMIT } from '../core/mnq8';

interface MNQ8PanelProps {
  heap: JinlingHeap;
  mnq8Results: Map<string, MNQ8Result>;
  onRunMNQ8Step: () => void;
  onRunMNQ8Full: () => void;
  onLoadHexRingGap: () => void;
}

/** LED 脉冲动画 */
const pulse = keyframes`
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
`;

const MNQ8Panel: React.FC<MNQ8PanelProps> = ({
  heap,
  mnq8Results,
  onRunMNQ8Step,
  onRunMNQ8Full,
  onLoadHexRingGap,
}) => {
  // 统计 CONFINED / DISPERSED
  const stats = useMemo(() => {
    let confined = 0;
    let dispersed = 0;
    let totalBoundaryLeak = 0;
    const results: Array<{ sid: string; result: MNQ8Result }> = [];

    for (const [sid, result] of mnq8Results) {
      results.push({ sid, result });
      if (result.status === 'CONFINED') confined++;
      else dispersed++;
      totalBoundaryLeak += result.boundaryLeak;
    }

    const avgBoundaryLeak = mnq8Results.size > 0 ? totalBoundaryLeak / mnq8Results.size : 0;

    return { confined, dispersed, avgBoundaryLeak, results };
  }, [mnq8Results]);

  const totalSpheres = heap.V.size;
  const confinedRatio = totalSpheres > 0 ? stats.confined / totalSpheres : 0;
  const dispersedRatio = totalSpheres > 0 ? stats.dispersed / totalSpheres : 0;
  const hasHexRingGap = stats.confined > 0;

  return (
    <Box sx={{ p: 1.5 }}>
      {/* 操作按钮 */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          size="small"
          onClick={onRunMNQ8Step}
          sx={{ fontSize: '0.7rem' }}
        >
          运行 MNQ8 单步
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onRunMNQ8Full}
          sx={{ fontSize: '0.7rem' }}
        >
          运行 MNQ8 全量
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="warning"
          onClick={onLoadHexRingGap}
          sx={{ fontSize: '0.7rem' }}
        >
          载入 HEX_RING_GAP 演示
        </Button>
      </Box>

      {/* CONFINED vs DISPERSED 进度条 */}
      <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          CONFINED vs DISPERSED
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="caption" sx={{ minWidth: 60, color: 'error.main' }}>
            囚禁 {stats.confined}
          </Typography>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={confinedRatio * 100}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: 'rgba(76,175,80,0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#f44336',
                  borderRadius: 6,
                },
              }}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ minWidth: 60, color: 'success.main' }}>
            弥散 {stats.dispersed}
          </Typography>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={dispersedRatio * 100}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: 'rgba(244,67,54,0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#4CAF50',
                  borderRadius: 6,
                },
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* HEX_RING_GAP 触发指示 */}
      <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ flex: 1 }}>
            HEX_RING_GAP 触发
          </Typography>
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: hasHexRingGap ? '#4CAF50' : '#666',
              animation: hasHexRingGap ? `${pulse} 1s ease-in-out infinite` : 'none',
              boxShadow: hasHexRingGap ? '0 0 8px #4CAF50' : 'none',
              transition: 'all 0.3s',
            }}
          />
          <Typography variant="caption" color={hasHexRingGap ? 'success.main' : 'text.secondary'}>
            {hasHexRingGap ? 'ACTIVE' : 'IDLE'}
          </Typography>
        </Box>
      </Paper>

      {/* BOUNDARY_LEAK 均值仪表盘 */}
      <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          BOUNDARY_LEAK 均值
        </Typography>
        <Box sx={{ position: 'relative', height: 24, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1, overflow: 'hidden' }}>
          {/* 阈值线 */}
          <Box
            sx={{
              position: 'absolute',
              left: `${BOUNDARY_LEAK_LIMIT * 100}%`,
              top: 0,
              bottom: 0,
              width: 2,
              bgcolor: '#FF9800',
              zIndex: 2,
            }}
          />
          {/* 当前值 */}
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${Math.min(stats.avgBoundaryLeak * 100, 100)}%`,
              bgcolor: stats.avgBoundaryLeak > BOUNDARY_LEAK_LIMIT ? '#f44336' : '#4CAF50',
              borderRadius: 1,
              transition: 'width 0.3s, background-color 0.3s',
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="caption" fontFamily="monospace">
            {stats.avgBoundaryLeak.toFixed(4)}
          </Typography>
          <Typography variant="caption" color="warning.main">
            阈值: {BOUNDARY_LEAK_LIMIT}
          </Typography>
        </Box>
      </Paper>

      <Divider sx={{ my: 1 }} />

      {/* 各球状态列表 */}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        球体状态列表
      </Typography>
      {stats.results.length > 0 ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ py: 0.2, fontSize: '0.7rem' }}>SID</TableCell>
              <TableCell sx={{ py: 0.2, fontSize: '0.7rem' }} align="right">MASS_FACE</TableCell>
              <TableCell sx={{ py: 0.2, fontSize: '0.7rem' }} align="right">LEAK</TableCell>
              <TableCell sx={{ py: 0.2, fontSize: '0.7rem' }} align="center">状态</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.results.map(({ sid, result }) => (
              <TableRow key={sid}>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem' }}>{sid}</TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem', fontFamily: 'monospace' }} align="right">
                  {result.massFace.toFixed(3)}
                </TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem', fontFamily: 'monospace' }} align="right">
                  {result.boundaryLeak.toFixed(3)}
                </TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem' }} align="center">
                  <Chip
                    label={result.status === 'CONFINED' ? '囚禁' : '弥散'}
                    size="small"
                    color={result.status === 'CONFINED' ? 'error' : 'success'}
                    variant="outlined"
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="body2" color="text.secondary">
          尚未运行 MNQ8 更新
        </Typography>
      )}
    </Box>
  );
};

export default MNQ8Panel;
