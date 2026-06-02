/**
 * CHL 对比面板
 * 经典 CHL vs TMK 的对照表
 */

import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import type { CHLEntry } from '../types/tmk';

/** CHL 对比数据 */
const CHL_DATA: CHLEntry[] = [
  {
    concept: '基础元素',
    classical: '标量/向量/矩阵',
    tmk: '金灵球 (JinlingSphere)',
  },
  {
    concept: '组合运算',
    classical: '加法/乘法/张量积',
    tmk: 'EML 函数 eml(x,y) = exp(x) - log(y)',
  },
  {
    concept: '代数结构',
    classical: '群/环/域/格',
    tmk: '金陵堆 (JinlingHeap) + 超边',
  },
  {
    concept: '接口协议',
    classical: '函数签名 / API',
    tmk: 'N₈ 端口系统 (8+2 端口)',
  },
  {
    concept: '类型检查',
    classical: '类型系统 / 静态分析',
    tmk: 'PCT 端口兼容匹配定理',
  },
  {
    concept: '优化方法',
    classical: '梯度下降 / 牛顿法',
    tmk: 'β-rewire (S_rel 最小化)',
  },
  {
    concept: '目标函数',
    classical: '损失函数 / 目标泛函',
    tmk: 'S_rel = α·M + β·H',
  },
  {
    concept: '信息度量',
    classical: 'Shannon 熵 / Fisher 信息',
    tmk: '相位 Shannon 熵 H(θ)',
  },
  {
    concept: '动力系统',
    classical: '微分方程 / 流形',
    tmk: 'Liu 机制变分原理 δS_Liu = 0',
  },
  {
    concept: '对偶性',
    classical: '构造 (是) / 否定 (否)',
    tmk: 'χ = +1 构造 / χ = -1 消解',
  },
  {
    concept: '数表示',
    classical: '实数/复数',
    tmk: 'EML 数 z = m ⊗ e^{iθ}',
  },
  {
    concept: '代数运算',
    classical: 'Clifford 代数 / 外代数',
    tmk: 'wedge / meet / gp (几何积)',
  },
  {
    concept: '高阶关系',
    classical: '多元函数 / 算子',
    tmk: '超边 (k-ary Hyperedge)',
  },
  {
    concept: '层级行射',
    classical: '范畴 / 函子 / 自然变换',
    tmk: 'L₁→L₅ 五层截影体系',
  },
];

const CHLComparison: React.FC = () => {
  return (
    <Box sx={{ p: 1.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#7c4dff', mb: 1 }}>
        <CompareArrowsIcon sx={{ fontSize: '0.9rem', mr: 0.5, verticalAlign: 'middle' }} />
        CHL vs TMK 对比
      </Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ py: 0.3, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(124,77,255,0.08)' }}>
                概念
              </TableCell>
              <TableCell sx={{ py: 0.3, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(0,176,255,0.08)' }}>
                经典 CHL
              </TableCell>
              <TableCell sx={{ py: 0.3, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(124,77,255,0.08)' }}>
                TMK
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {CHL_DATA.map((row, i) => (
              <TableRow key={i} hover>
                <TableCell sx={{ py: 0.2, fontSize: '0.6rem', fontWeight: 600 }}>
                  {row.concept}
                </TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.6rem', color: '#0288d1' }}>
                  {row.classical}
                </TableCell>
                <TableCell sx={{ py: 0.2, fontSize: '0.6rem', color: '#7c4dff' }}>
                  {row.tmk}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CHLComparison;
