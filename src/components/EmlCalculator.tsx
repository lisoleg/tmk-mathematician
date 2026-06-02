/**
 * EML 计算器
 * 输入 x, y 计算 eml(x, y)，展示与经典运算的对应
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import { eml, emlAdd, emlMul, emlComparison } from '../core/eml';

const EmlCalculator: React.FC = () => {
  const [x, setX] = useState<number>(1);
  const [y, setY] = useState<number>(2);

  const comparison = useMemo(() => {
    try {
      return emlComparison(x, y);
    } catch {
      return null;
    }
  }, [x, y]);

  return (
    <Box sx={{ p: 1.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7c4dff', mb: 1 }}>
        <CalculateIcon sx={{ fontSize: '0.9rem', mr: 0.5, verticalAlign: 'middle' }} />
        EML 计算器
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        z = exp(x) − log(y)
      </Typography>

      {/* 输入 */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        <TextField
          label="x"
          type="number"
          value={x}
          onChange={e => setX(Number(e.target.value))}
          size="small"
          sx={{ flex: 1 }}
          inputProps={{ style: { fontSize: '0.8rem' } }}
        />
        <TextField
          label="y"
          type="number"
          value={y}
          onChange={e => setY(Number(e.target.value))}
          size="small"
          sx={{ flex: 1 }}
          inputProps={{ style: { fontSize: '0.8rem' }, min: 0.01 }}
        />
      </Box>

      {/* EML 结果 */}
      {comparison && (
        <>
          <Paper variant="outlined" sx={{ p: 1, mb: 1.5, bgcolor: 'rgba(124,77,255,0.05)' }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700 }}>
              eml({x}, {y}) = {comparison.emlResult.toFixed(6)}
            </Typography>
          </Paper>

          {/* 对比表 */}
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            经典运算 vs EML 运算对比
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 0.5 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ py: 0.3, fontSize: '0.65rem', fontWeight: 700 }}>运算</TableCell>
                  <TableCell sx={{ py: 0.3, fontSize: '0.65rem', fontWeight: 700 }}>经典值</TableCell>
                  <TableCell sx={{ py: 0.3, fontSize: '0.65rem', fontWeight: 700 }}>EML 值</TableCell>
                  <TableCell sx={{ py: 0.3, fontSize: '0.65rem', fontWeight: 700 }}>误差</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ py: 0.2, fontSize: '0.65rem' }}>加法</TableCell>
                  <TableCell sx={{ py: 0.2, fontSize: '0.65rem', fontFamily: 'monospace' }}>
                    {comparison.addition.toFixed(6)}
                  </TableCell>
                  <TableCell sx={{ py: 0.2, fontSize: '0.65rem', fontFamily: 'monospace' }}>
                    {comparison.emlAddResult.toFixed(6)}
                  </TableCell>
                  <TableCell sx={{ py: 0.2, fontSize: '0.65rem' }}>
                    <Chip
                      label={comparison.addError.toFixed(6)}
                      size="small"
                      sx={{ height: 16, fontSize: '0.55rem' }}
                      color={comparison.addError < 1 ? 'success' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ py: 0.2, fontSize: '0.65rem' }}>乘法</TableCell>
                  <TableCell sx={{ py: 0.2, fontSize: '0.65rem', fontFamily: 'monospace' }}>
                    {comparison.multiplication.toFixed(6)}
                  </TableCell>
                  <TableCell sx={{ py: 0.2, fontSize: '0.65rem', fontFamily: 'monospace' }}>
                    {isNaN(comparison.emlMulResult) ? 'N/A' : comparison.emlMulResult.toFixed(6)}
                  </TableCell>
                  <TableCell sx={{ py: 0.2, fontSize: '0.65rem' }}>
                    {isNaN(comparison.mulError) ? (
                      <Chip label="N/A" size="small" sx={{ height: 16, fontSize: '0.55rem' }} />
                    ) : (
                      <Chip
                        label={comparison.mulError.toFixed(6)}
                        size="small"
                        sx={{ height: 16, fontSize: '0.55rem' }}
                        color={comparison.mulError < 0.01 ? 'success' : 'warning'}
                      />
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 1 }} />

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            加法公式: a+b ≈ eml(eml(a,1), eml(b,1))
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            乘法公式: a·b = exp(ln a + ln b) (EML子情况)
          </Typography>
        </>
      )}
    </Box>
  );
};

export default EmlCalculator;
