/**
 * β-rewire 控制面板
 * 参数调节、运行控制、S_rel 实时显示
 */

import React from 'react';
import {
  Box,
  Typography,
  Slider,
  Button,
  Divider,
  Paper,
  ButtonGroup,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import StopIcon from '@mui/icons-material/Stop';
import FastForwardIcon from '@mui/icons-material/FastForward';
import type { BetaRewireParams } from '../types/tmk';

interface BetaRewirePanelProps {
  params: BetaRewireParams;
  onParamsChange: (params: BetaRewireParams) => void;
  currentSRel: { sRel: number; sM: number; sH: number };
  isRewiring: boolean;
  onRunStep: () => void;
  onRunMulti: () => void;
  onStartAuto: () => void;
  onStopAuto: () => void;
  historyLength: number;
}

const BetaRewirePanel: React.FC<BetaRewirePanelProps> = ({
  params,
  onParamsChange,
  currentSRel,
  isRewiring,
  onRunStep,
  onRunMulti,
  onStartAuto,
  onStopAuto,
  historyLength,
}) => {
  return (
    <Box sx={{ p: 1.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7c4dff', mb: 1 }}>
        β-rewire 控制
      </Typography>

      {/* S_rel 实时显示 */}
      <Paper variant="outlined" sx={{ p: 1, mb: 1.5, bgcolor: 'rgba(0,176,255,0.05)' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          当前 S_rel
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#00b0ff', fontFamily: 'monospace' }}>
          {currentSRel.sRel.toFixed(4)}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
          <Typography variant="caption" sx={{ color: '#4CAF50' }}>
            α·M = {currentSRel.sM.toFixed(4)}
          </Typography>
          <Typography variant="caption" sx={{ color: '#FF9800' }}>
            β·H = {currentSRel.sH.toFixed(4)}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          已执行 {historyLength} 步
        </Typography>
      </Paper>

      {/* 参数调节 */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary">α (边数权重) = {params.alpha.toFixed(2)}</Typography>
        <Slider
          size="small"
          value={params.alpha}
          onChange={(_, v) => onParamsChange({ ...params, alpha: v as number })}
          min={0}
          max={5}
          step={0.1}
          valueLabelDisplay="auto"
        />
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary">β (相位熵权重) = {params.beta.toFixed(2)}</Typography>
        <Slider
          size="small"
          value={params.beta}
          onChange={(_, v) => onParamsChange({ ...params, beta: v as number })}
          min={0}
          max={5}
          step={0.1}
          valueLabelDisplay="auto"
        />
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary">迭代步数 = {params.steps}</Typography>
        <Slider
          size="small"
          value={params.steps}
          onChange={(_, v) => onParamsChange({ ...params, steps: v as number })}
          min={1}
          max={50}
          step={1}
          valueLabelDisplay="auto"
        />
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* 运行按钮 */}
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={onRunStep}
          startIcon={<SkipNextIcon />}
          sx={{ fontSize: '0.7rem', borderColor: '#7c4dff', color: '#7c4dff' }}
        >
          单步
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onRunMulti}
          startIcon={<FastForwardIcon />}
          sx={{ fontSize: '0.7rem', borderColor: '#00b0ff', color: '#00b0ff' }}
        >
          {params.steps}步
        </Button>
        {!isRewiring ? (
          <Button
            variant="contained"
            size="small"
            onClick={onStartAuto}
            startIcon={<PlayArrowIcon />}
            sx={{ fontSize: '0.7rem', bgcolor: '#4CAF50' }}
          >
            自动
          </Button>
        ) : (
          <Button
            variant="contained"
            size="small"
            onClick={onStopAuto}
            startIcon={<StopIcon />}
            sx={{ fontSize: '0.7rem', bgcolor: '#f44336' }}
          >
            停止
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default BetaRewirePanel;
