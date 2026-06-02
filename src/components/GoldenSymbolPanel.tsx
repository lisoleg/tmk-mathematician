/**
 * GoldenSymbolPanel.tsx — 金符 3D 复广数面板
 * 显示选中球的 GoldenSymbol 数值、MNQ8 结果、阴龙积计算器
 */

import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
} from '@mui/material';
import type { JinlingHeap } from '../types/tmk';
import type { MNQ8Result } from '../core/mnq8';
import {
  sphereToGolden,
  yinLongProduct,
  goldenNormSq,
  goldenNorm,
  goldenConjugate,
  goldenToString,
} from '../core/goldenSymbol';

interface GoldenSymbolPanelProps {
  heap: JinlingHeap;
  selectedSid: string | null;
  mnq8Results: Map<string, MNQ8Result>;
}

const GoldenSymbolPanel: React.FC<GoldenSymbolPanelProps> = ({
  heap,
  selectedSid,
  mnq8Results,
}) => {
  // 阴龙积计算器状态
  const [sphere1Sid, setSphere1Sid] = useState<string>('');
  const [sphere2Sid, setSphere2Sid] = useState<string>('');

  // 选中球的 GoldenSymbol
  const selectedGolden = useMemo(() => {
    if (!selectedSid) return null;
    const sphere = heap.V.get(selectedSid);
    if (!sphere) return null;
    return sphereToGolden(sphere);
  }, [heap, selectedSid]);

  // 选中球的 MNQ8 结果
  const selectedMnq8 = useMemo(() => {
    if (!selectedSid) return null;
    return mnq8Results.get(selectedSid) || null;
  }, [mnq8Results, selectedSid]);

  // 阴龙积计算结果
  const yinLongResult = useMemo(() => {
    if (!sphere1Sid || !sphere2Sid) return null;
    const s1 = heap.V.get(sphere1Sid);
    const s2 = heap.V.get(sphere2Sid);
    if (!s1 || !s2) return null;
    const g1 = sphereToGolden(s1);
    const g2 = sphereToGolden(s2);
    const product = yinLongProduct(g1, g2);
    return {
      g1,
      g2,
      product,
      normSq: goldenNormSq(product),
      norm: goldenNorm(product),
      conjugate: goldenConjugate(product),
    };
  }, [heap, sphere1Sid, sphere2Sid]);

  const sphereIds = Array.from(heap.V.keys());

  return (
    <Box sx={{ p: 1.5 }}>
      {/* 选中球的 GoldenSymbol 数值 */}
      <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
        🔮 金符 3D 复广数
      </Typography>

      {selectedGolden ? (
        <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            𝒢_val = a + b·i + c·j
          </Typography>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ py: 0.3, fontSize: '0.75rem' }}>a (流贯幅值)</TableCell>
                <TableCell sx={{ py: 0.3, fontSize: '0.75rem', fontFamily: 'monospace' }} align="right">
                  {selectedGolden.a.toFixed(6)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ py: 0.3, fontSize: '0.75rem' }}>b (波性相位)</TableCell>
                <TableCell sx={{ py: 0.3, fontSize: '0.75rem', fontFamily: 'monospace' }} align="right">
                  {selectedGolden.b.toFixed(6)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ py: 0.3, fontSize: '0.75rem' }}>c (关系耦合)</TableCell>
                <TableCell sx={{ py: 0.3, fontSize: '0.75rem', fontFamily: 'monospace' }} align="right">
                  {selectedGolden.c.toFixed(6)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ py: 0.3, fontSize: '0.75rem' }}>|𝒢|²</TableCell>
                <TableCell sx={{ py: 0.3, fontSize: '0.75rem', fontFamily: 'monospace' }} align="right">
                  {goldenNormSq(selectedGolden).toFixed(6)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ py: 0.3, fontSize: '0.75rem' }}>|𝒢|</TableCell>
                <TableCell sx={{ py: 0.3, fontSize: '0.75rem', fontFamily: 'monospace' }} align="right">
                  {goldenNorm(selectedGolden).toFixed(6)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ py: 0.3, fontSize: '0.75rem' }}>𝒢̄ (共轭)</TableCell>
                <TableCell sx={{ py: 0.3, fontSize: '0.75rem', fontFamily: 'monospace' }} align="right">
                  {goldenToString(goldenConjugate(selectedGolden))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          请选择一个金灵球查看其 GoldenSymbol
        </Typography>
      )}

      {/* MNQ8 结果 */}
      {selectedMnq8 && (
        <>
          <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'secondary.main' }}>
            ⚡ MNQ8 结果
          </Typography>
          <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              <Chip
                label={selectedMnq8.status}
                size="small"
                color={selectedMnq8.status === 'CONFINED' ? 'error' : 'success'}
                variant="outlined"
              />
            </Box>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ py: 0.3, fontSize: '0.75rem' }}>MASS_FACE</TableCell>
                  <TableCell sx={{ py: 0.3, fontSize: '0.75rem', fontFamily: 'monospace' }} align="right">
                    {selectedMnq8.massFace.toFixed(4)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ py: 0.3, fontSize: '0.75rem' }}>EXCESS_LOOP_HOLD</TableCell>
                  <TableCell sx={{ py: 0.3, fontSize: '0.75rem', fontFamily: 'monospace' }} align="right">
                    {selectedMnq8.excessLoopHold.toFixed(4)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ py: 0.3, fontSize: '0.75rem' }}>BOUNDARY_LEAK</TableCell>
                  <TableCell sx={{ py: 0.3, fontSize: '0.75rem', fontFamily: 'monospace' }} align="right">
                    {selectedMnq8.boundaryLeak.toFixed(4)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ py: 0.3, fontSize: '0.75rem' }}>totalFlux ⊙</TableCell>
                  <TableCell sx={{ py: 0.3, fontSize: '0.75rem', fontFamily: 'monospace' }} align="right">
                    {goldenToString(selectedMnq8.totalFlux)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </>
      )}

      <Divider sx={{ my: 1.5 }} />

      {/* 阴龙积计算器 */}
      <Typography variant="subtitle2" sx={{ mb: 1, color: 'warning.main' }}>
        ⊙ 阴龙积计算器
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <FormControl size="small" fullWidth>
          <InputLabel sx={{ fontSize: '0.75rem' }}>𝒢₁</InputLabel>
          <Select
            value={sphere1Sid}
            label="𝒢₁"
            onChange={(e) => setSphere1Sid(e.target.value)}
            sx={{ fontSize: '0.75rem' }}
          >
            {sphereIds.map(sid => (
              <MenuItem key={sid} value={sid} sx={{ fontSize: '0.75rem' }}>
                {sid}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel sx={{ fontSize: '0.75rem' }}>𝒢₂</InputLabel>
          <Select
            value={sphere2Sid}
            label="𝒢₂"
            onChange={(e) => setSphere2Sid(e.target.value)}
            sx={{ fontSize: '0.75rem' }}
          >
            {sphereIds.map(sid => (
              <MenuItem key={sid} value={sid} sx={{ fontSize: '0.75rem' }}>
                {sid}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {yinLongResult && (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            𝒢₁ ⊙ 𝒢₂ 结果
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem' }}>分量</TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem' }} align="right">𝒢₁</TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem' }} align="right">𝒢₂</TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem' }} align="right">𝒢₁⊙𝒢₂</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem' }}>a</TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem', fontFamily: 'monospace' }} align="right">
                  {yinLongResult.g1.a.toFixed(4)}
                </TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem', fontFamily: 'monospace' }} align="right">
                  {yinLongResult.g2.a.toFixed(4)}
                </TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 'bold' }} align="right">
                  {yinLongResult.product.a.toFixed(4)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem' }}>b</TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem', fontFamily: 'monospace' }} align="right">
                  {yinLongResult.g1.b.toFixed(4)}
                </TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem', fontFamily: 'monospace' }} align="right">
                  {yinLongResult.g2.b.toFixed(4)}
                </TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 'bold' }} align="right">
                  {yinLongResult.product.b.toFixed(4)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem' }}>c</TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem', fontFamily: 'monospace' }} align="right">
                  {yinLongResult.g1.c.toFixed(4)}
                </TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem', fontFamily: 'monospace' }} align="right">
                  {yinLongResult.g2.c.toFixed(4)}
                </TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 'bold' }} align="right">
                  {yinLongResult.product.c.toFixed(4)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem' }}>|𝒢|²</TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem', fontFamily: 'monospace' }} align="right">
                  {goldenNormSq(yinLongResult.g1).toFixed(4)}
                </TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem', fontFamily: 'monospace' }} align="right">
                  {goldenNormSq(yinLongResult.g2).toFixed(4)}
                </TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 'bold' }} align="right">
                  {yinLongResult.normSq.toFixed(4)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default GoldenSymbolPanel;
