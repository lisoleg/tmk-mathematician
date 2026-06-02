/**
 * PCT 端口兼容性校验组件
 * 选择两个球检查端口兼容性
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Paper,
  Chip,
  Divider,
  FormControl,
  InputLabel,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { JinlingHeap } from '../types/tmk';
import { checkPCT } from '../core/portCompatibility';

interface PCTCheckerProps {
  heap: JinlingHeap;
}

const PCTChecker: React.FC<PCTCheckerProps> = ({ heap }) => {
  const sids = Array.from(heap.V.keys());
  const [srcSid, setSrcSid] = useState<string>(sids[0] || '');
  const [tgtSid, setTgtSid] = useState<string>(sids[1] || '');

  const result = useMemo(() => {
    const src = heap.V.get(srcSid);
    const tgt = heap.V.get(tgtSid);
    if (!src || !tgt) return null;
    return checkPCT(src, tgt);
  }, [heap, srcSid, tgtSid]);

  const checks = result
    ? [
        { label: '方向互补', ok: result.directionOk, desc: '出端口 ↔ 入端口' },
        { label: '手性相容', ok: result.chiralityOk, desc: '构造↔构造 / 消解↔消解' },
        { label: '相位可锁', ok: result.phaseOk, desc: 'θ_u + θ_v ≡ θ_tgt (mod 2π·n)' },
        { label: '阶守恒', ok: result.gradeOk, desc: 'Clifford grade 投影守恒' },
      ]
    : [];

  return (
    <Box sx={{ p: 1.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7c4dff', mb: 1 }}>
        PCT 端口兼容性校验
      </Typography>

      {sids.length < 2 ? (
        <Typography variant="body2" color="text.secondary">
          至少需要 2 个球体
        </Typography>
      ) : (
        <>
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>源球</InputLabel>
              <Select
                value={srcSid}
                onChange={e => setSrcSid(e.target.value)}
                label="源球"
                sx={{ fontSize: '0.75rem' }}
              >
                {sids.map(sid => (
                  <MenuItem key={sid} value={sid} sx={{ fontSize: '0.75rem' }}>
                    {sid.substring(0, 12)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>目标球</InputLabel>
              <Select
                value={tgtSid}
                onChange={e => setTgtSid(e.target.value)}
                label="目标球"
                sx={{ fontSize: '0.75rem' }}
              >
                {sids.map(sid => (
                  <MenuItem key={sid} value={sid} sx={{ fontSize: '0.75rem' }}>
                    {sid.substring(0, 12)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* 兼容性结果 */}
          {result && (
            <>
              <Paper
                variant="outlined"
                sx={{
                  p: 1,
                  mb: 1,
                  bgcolor: result.compatible ? 'rgba(46,125,50,0.08)' : 'rgba(198,40,40,0.08)',
                  borderColor: result.compatible ? '#4CAF50' : '#f44336',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {result.compatible ? (
                    <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: '1.2rem' }} />
                  ) : (
                    <CancelIcon sx={{ color: '#f44336', fontSize: '1.2rem' }} />
                  )}
                  <Typography variant="body2" sx={{ fontWeight: 700, color: result.compatible ? '#2e7d32' : '#c62828' }}>
                    {result.compatible ? '端口兼容 ✓' : '端口不兼容 ✗'}
                  </Typography>
                </Box>
              </Paper>

              {/* 四条件详情 */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
                {checks.map(c => (
                  <Paper
                    key={c.label}
                    variant="outlined"
                    sx={{
                      p: 0.5,
                      bgcolor: c.ok ? 'rgba(46,125,50,0.05)' : 'rgba(198,40,40,0.05)',
                      borderColor: c.ok ? '#4CAF50' : '#f44336',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      {c.ok ? (
                        <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: '0.8rem' }} />
                      ) : (
                        <CancelIcon sx={{ color: '#f44336', fontSize: '0.8rem' }} />
                      )}
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                        {c.label}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>
                      {c.desc}
                    </Typography>
                  </Paper>
                ))}
              </Box>

              {/* 详情说明 */}
              {result.details.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    详情
                  </Typography>
                  {result.details.map((d, i) => (
                    <Typography key={i} variant="caption" sx={{ display: 'block', fontSize: '0.6rem', color: 'text.secondary' }}>
                      • {d}
                    </Typography>
                  ))}
                </Box>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default PCTChecker;
