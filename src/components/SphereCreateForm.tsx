/**
 * 金灵球创建表单
 * 支持设置 sid, ports, chi, mod, phase
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Slider,
  Divider,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import type { JinlingSphere } from '../types/tmk';
import { PORT } from '../types/tmk';
import { createSphere } from '../core/JinlingSphere';

interface SphereCreateFormProps {
  onAdd: (sphere: JinlingSphere) => void;
}

const SphereCreateForm: React.FC<SphereCreateFormProps> = ({ onAdd }) => {
  const [chi, setChi] = useState<number>(1);
  const [mod, setMod] = useState<number>(10);
  const [phase, setPhase] = useState<number>(0);
  const [ports, setPorts] = useState<number>(0b1111111111);

  const portList = [
    { mask: PORT.cn, label: 'CN 构造北入' },
    { mask: PORT.cx, label: 'CX 构造南出' },
    { mask: PORT.ce, label: 'CE 构造东入' },
    { mask: PORT.cw, label: 'CW 构造西出' },
    { mask: PORT.an, label: 'AN 消解北入' },
    { mask: PORT.ax, label: 'AX 消解南出' },
    { mask: PORT.ae, label: 'AE 消解东入' },
    { mask: PORT.aw, label: 'AW 消解西出' },
    { mask: PORT.obs, label: 'OBS 观察' },
    { mask: PORT.self, label: 'SELF 自指' },
  ];

  const togglePort = (mask: number) => {
    setPorts(prev => prev ^ mask);
  };

  const handleAdd = () => {
    const sphere = createSphere({ chi, mod, phase, ports });
    onAdd(sphere);
  };

  return (
    <Box sx={{ px: 1.5, py: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7c4dff', mb: 1 }}>
        创建金灵球
      </Typography>

      <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary">手性 χ</Typography>
        <ToggleButtonGroup
          size="small"
          value={chi}
          exclusive
          onChange={(_, v) => v && setChi(v)}
          fullWidth
        >
          <ToggleButton value={1} sx={{ color: '#2e7d32', '&.Mui-selected': { bgcolor: 'rgba(46,125,50,0.15)' } }}>
            +1 构造
          </ToggleButton>
          <ToggleButton value={-1} sx={{ color: '#c62828', '&.Mui-selected': { bgcolor: 'rgba(198,40,40,0.15)' } }}>
            -1 消解
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary">模 m = {mod}</Typography>
        <Slider
          size="small"
          value={mod}
          onChange={(_, v) => setMod(v as number)}
          min={1}
          max={100}
          valueLabelDisplay="auto"
        />
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary">相位 θ = {phase.toFixed(2)}</Typography>
        <Slider
          size="small"
          value={phase}
          onChange={(_, v) => setPhase(v as number)}
          min={0}
          max={Math.PI * 2}
          step={0.01}
          valueLabelDisplay="auto"
          valueLabelFormat={v => v.toFixed(2)}
        />
      </Box>

      <Divider sx={{ my: 1 }} />

      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        N₈ 端口 (二进制: {ports.toString(2).padStart(10, '0')})
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {portList.map(p => (
          <FormControlLabel
            key={p.mask}
            control={
              <Checkbox
                size="small"
                checked={(ports & p.mask) !== 0}
                onChange={() => togglePort(p.mask)}
                sx={{ py: 0.2 }}
              />
            }
            label={<Typography variant="caption" sx={{ fontSize: '0.65rem' }}>{p.label}</Typography>}
          />
        ))}
      </Box>

      <Button
        variant="contained"
        size="small"
        fullWidth
        onClick={handleAdd}
        startIcon={<AddCircleIcon />}
        sx={{ mt: 1, bgcolor: '#7c4dff', '&:hover': { bgcolor: '#6a3de8' } }}
      >
        添加球体
      </Button>
    </Box>
  );
};

export default SphereCreateForm;
