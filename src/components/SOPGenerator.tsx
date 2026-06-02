/**
 * SOPGenerator.tsx — SOP 自动生成器面板
 * 六体系分析，四个预设场景 + 自定义输入
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  generateSOPReport,
  renderSOPMarkdown,
} from '../core/sopGenerator';
import type { SOPPreset, SOPReport } from '../core/sopGenerator';

const PRESET_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  superconductor: { label: '超导', emoji: '⚡', color: '#2196F3' },
  consensus: { label: '共识', emoji: '🤝', color: '#4CAF50' },
  qualia: { label: '意识', emoji: '👁', color: '#9C27B0' },
  cmb_cold_spot: { label: 'CMB', emoji: '🌌', color: '#FF9800' },
};

const SOPGenerator: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<SOPPreset | null>(null);
  const [customPhenomenon, setCustomPhenomenon] = useState('');
  const [report, setReport] = useState<SOPReport | null>(null);

  const handlePreset = (preset: SOPPreset) => {
    setSelectedPreset(preset);
    const r = generateSOPReport(preset);
    setReport(r);
  };

  const handleCustom = () => {
    if (!customPhenomenon.trim()) return;
    setSelectedPreset('custom');
    const r = generateSOPReport('custom', customPhenomenon);
    setReport(r);
  };

  const handleCopyMarkdown = () => {
    if (!report) return;
    const md = renderSOPMarkdown(report);
    navigator.clipboard.writeText(md);
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* 左侧：预设按钮 + 自定义输入 */}
      <Box sx={{ width: 200, minWidth: 200, p: 1.5, borderRight: '1px solid', borderColor: 'divider', overflow: 'auto' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          预设场景
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {Object.entries(PRESET_LABELS).map(([key, { label, emoji, color }]) => (
            <Button
              key={key}
              variant={selectedPreset === key ? 'contained' : 'outlined'}
                           onClick={() => handlePreset(key as SOPPreset)}
              sx={{
                fontSize: '0.75rem',
                justifyContent: 'flex-start',
                borderColor: color,
                bgcolor: selectedPreset === key ? color : 'transparent',
                color: selectedPreset === key ? '#fff' : color,
                '&:hover': { bgcolor: color, color: '#fff', opacity: 0.9 },
              }}
            >
              {emoji} {label}
            </Button>
          ))}
        </Box>

        <Divider sx={{ my: 1 }} />

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          自定义现象
        </Typography>
        <TextField
                   multiline
          rows={3}
          value={customPhenomenon}
          onChange={(e) => setCustomPhenomenon(e.target.value)}
          placeholder="描述待分析现象..."
          sx={{ fontSize: '0.75rem', mb: 1, '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
          fullWidth
        />
        <Button
          variant="outlined"
                   onClick={handleCustom}
          disabled={!customPhenomenon.trim()}
          sx={{ fontSize: '0.75rem', width: '100%' }}
        >
          生成自定义 SOP
        </Button>
      </Box>

      {/* 右侧：SOP 报告展示 */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        {report ? (
          <>
            <Paper variant="outlined" sx={{ p: 1.5, mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {report.phenomenon}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {report.date} · {report.analyst}
              </Typography>
            </Paper>

            {/* Step 0 */}
            <Accordion defaultExpanded disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 32, '& .MuiAccordionSummary-content': { my: 0 } }}>
                <Typography variant="subtitle2">Step 0: 现象锚定</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ py: 0.5 }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                  <strong>H₁:</strong> {report.step0.h1}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                  <strong>H₂:</strong> {report.step0.h2}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  <strong>H₃:</strong> {report.step0.h3}
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* Step 1 */}
            <Accordion disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 32, '& .MuiAccordionSummary-content': { my: 0 } }}>
                <Typography variant="subtitle2">Step 1: 金灵球赋参</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ py: 0.5 }}>
                {[
                  ['V', report.step1.V],
                  ['E_potential', report.step1.E_potential],
                  ['ρ₀', report.step1.rho0],
                  ['w₀', report.step1.w0],
                  ['θ₀', report.step1.theta0],
                  ['φ_est', report.step1.phi_est],
                  ['PG Rule', report.step1.pg_rule_id],
                ].map(([key, val]) => (
                  <Typography key={key} variant="body2" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
                    <strong>{key}:</strong> {val}
                  </Typography>
                ))}
              </AccordionDetails>
            </Accordion>

            {/* Step 2 */}
            <Accordion disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 32, '& .MuiAccordionSummary-content': { my: 0 } }}>
                <Typography variant="subtitle2">Step 2: FT/EL 时间方向</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ py: 0.5 }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
                  <strong>→ Forward:</strong> {report.step2.ftel_forward}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
                  <strong>← Reverse:</strong> {report.step2.ftel_reverse}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
                  <strong>双向平衡:</strong> {report.step2.bidir_balanced ? '是' : '否'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  <strong>T_bidir:</strong> {report.step2.t_bidir ? '是' : '否'}
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* Step 3 */}
            <Accordion disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 32, '& .MuiAccordionSummary-content': { my: 0 } }}>
                <Typography variant="subtitle2">Step 3: PG 判定</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ py: 0.5 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                  <Chip
                    label={report.step3.pg_type}
                                       color={
                      report.step3.pg_type === 'Confined Soliton (Mass-Face)' ? 'error' :
                      report.step3.pg_type === 'Rupert-Tear' ? 'warning' : 'success'
                    }
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 22 }}
                  />
                </Box>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  <strong>BOUNDARY_LEAK:</strong> {report.step3.boundary_leak}
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* Step 4 */}
            <Accordion disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 32, '& .MuiAccordionSummary-content': { my: 0 } }}>
                <Typography variant="subtitle2">Step 4: 候选与优胜</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ py: 0.5 }}>
                {report.step4.candidates.map((c) => (
                  <Typography key={c.name} variant="body2" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
                    {c.name === report.step4.winner ? '🏆 ' : '   '}
                    <strong>{c.name}</strong> M={c.M} H={c.H} P={c.penalty} S_rel={c.s_rel}
                  </Typography>
                ))}
                <Typography variant="body2" sx={{ fontSize: '0.75rem', mt: 0.5, fontWeight: 'bold' }}>
                  优胜: {report.step4.winner}
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* Step 5 */}
            <Accordion disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 32, '& .MuiAccordionSummary-content': { my: 0 } }}>
                <Typography variant="subtitle2">Step 5: 锁相判定</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ py: 0.5 }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
                  <strong>锁定:</strong> {report.step5.locked ? '🔒 是' : '🔓 否'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
                  <strong>条件:</strong> {report.step5.lock_condition}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  <strong>破坏因素:</strong> {report.step5.break_factors}
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* Step 6 */}
            <Accordion disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 32, '& .MuiAccordionSummary-content': { my: 0 } }}>
                <Typography variant="subtitle2">Step 6: 数值验收</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ py: 0.5 }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
                  <strong>MASS_FACE:</strong> {report.step6.mass_face}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
                  <strong>EXCESS_LOOP_HOLD:</strong> {report.step6.excess_loop_hold}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.3 }}>
                  <strong>BOUNDARY_LEAK:</strong> {report.step6.boundary_leak}
                </Typography>
                <Chip
                  label={report.step6.pass ? '✅ 通过' : '❌ 未通过'}
                                   color={report.step6.pass ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 22 }}
                />
              </AccordionDetails>
            </Accordion>

            {/* Step 7 */}
            <Accordion defaultExpanded disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 32, '& .MuiAccordionSummary-content': { my: 0 } }}>
                <Typography variant="subtitle2">Step 7: 三视角结论</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ py: 0.5 }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                  <strong>🔴 核心:</strong> {report.step7.core_view}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                  <strong>🟣 灵性:</strong> {report.step7.spirit_view}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                  <strong>🟢 物质:</strong> {report.step7.material_view}
                </Typography>
                <Divider sx={{ my: 0.5 }} />
                <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 0.5, fontWeight: 'bold' }}>
                  结论: {report.step7.conclusion}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  <strong>干预:</strong> {report.step7.intervention}
                </Typography>
              </AccordionDetails>
            </Accordion>

            {/* 复制按钮 */}
            <Button
              variant="outlined"
                           onClick={handleCopyMarkdown}
              sx={{ mt: 1.5, fontSize: '0.75rem', width: '100%' }}
            >
              📋 复制报告文本
            </Button>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            请从左侧选择预设场景或输入自定义现象，以生成 SOP 六体系分析报告
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SOPGenerator;
