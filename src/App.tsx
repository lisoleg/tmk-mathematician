/**
 * App.tsx — TMK 数学家主应用
 * 太一万有理论数学发现引擎
 */

import React, { useState } from 'react';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Paper,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import TopNavBar from './components/TopNavBar';
import SphereListPanel from './components/SphereListPanel';
import SphereCreateForm from './components/SphereCreateForm';
import HeapCanvas from './components/HeapCanvas';
import SphereDetailPanel from './components/SphereDetailPanel';
import BetaRewirePanel from './components/BetaRewirePanel';
import EmlCalculator from './components/EmlCalculator';
import PCTChecker from './components/PCTChecker';
import DiscoveryLog from './components/DiscoveryLog';
import CHLComparison from './components/CHLComparison';
import GoldenSymbolPanel from './components/GoldenSymbolPanel';
import MNQ8Panel from './components/MNQ8Panel';
import SOPGenerator from './components/SOPGenerator';
import ICEPanel from './components/ICEPanel';
import { useHeap } from './hooks/useHeap';
import type { Layer } from './types/tmk';

/** 亮色主题 */
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#7c4dff' },
    secondary: { main: '#00b0ff' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
  },
  typography: { fontSize: 12 },
});

/** 暗色主题 */
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7c4dff' },
    secondary: { main: '#00b0ff' },
    background: { default: '#121212', paper: '#1e1e2e' },
  },
  typography: { fontSize: 12 },
});

const App: React.FC = () => {
  const {
    heap,
    selectedSid,
    setSelectedSid,
    rewireParams,
    setRewireParams,
    rewireHistory,
    sRelCurve,
    discoveries,
    layer,
    setLayer,
    isRewiring,
    addSphere,
    removeSphere,
    updateSphere,
    addEdge,
    removeEdge,
    addHyperedge,
    runRewireStep,
    runRewire,
    startAutoRewire,
    stopAutoRewire,
    resetHeap,
    loadDemo,
    currentSRel,
    mnq8Results,
    runMNQ8Step,
    runMNQ8Full,
    loadHexRingGap,
    iceState,
    tickICE,
    toggleICE,
    clearICE,
  } = useHeap();

  const [darkMode, setDarkMode] = useState(true);
  const [rightTab, setRightTab] = useState(0);
  const [bottomTab, setBottomTab] = useState(0);

  const selectedSphere = selectedSid ? heap.V.get(selectedSid) || null : null;

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 顶部导航栏 */}
        <TopNavBar
          layer={layer}
          onLayerChange={setLayer}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onReset={resetHeap}
          onLoadDemo={loadDemo}
        />

        {/* 主体区域 */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* 左侧面板 */}
          <Paper
            elevation={2}
            sx={{
              width: 240,
              minWidth: 240,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: 0,
            }}
          >
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <SphereListPanel
                heap={heap}
                selectedSid={selectedSid}
                onSelect={setSelectedSid}
              />
            </Box>
            <Divider />
            <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
              <SphereCreateForm onAdd={addSphere} />
            </Box>
          </Paper>

          {/* 中央画布 */}
          <Box sx={{ flex: 1, position: 'relative', bgcolor: darkMode ? '#0d0d1a' : '#e8e8e8' }}>
            <HeapCanvas
              heap={heap}
              selectedSid={selectedSid}
              onSelectSphere={setSelectedSid}
              newlyBornSpheres={new Set()}
            />
            {/* S_rel 演化小图（叠加在画布右上角） */}
            {sRelCurve.length > 1 && (
              <Paper
                elevation={3}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 200,
                  height: 100,
                  p: 0.5,
                  bgcolor: 'rgba(26,26,46,0.9)',
                  borderRadius: 1,
                }}
              >
                <svg width="196" height="96" viewBox="0 0 196 96">
                  {/* 背景网格 */}
                  <line x1="20" y1="5" x2="20" y2="85" stroke="#333" strokeWidth="0.5" />
                  <line x1="20" y1="85" x2="190" y2="85" stroke="#333" strokeWidth="0.5" />
                  {/* S_rel 曲线 */}
                  {(() => {
                    const data = sRelCurve.slice(-30);
                    if (data.length < 2) return null;
                    const maxS = Math.max(...data.map(d => d.sRel), 0.01);
                    const minS = Math.min(...data.map(d => d.sRel));
                    const range = maxS - minS || 1;
                    const w = 165;
                    const h = 70;
                    const x0 = 25;
                    const y0 = 10;

                    const points = data.map((d, i) => {
                      const x = x0 + (i / (data.length - 1)) * w;
                      const y = y0 + h - ((d.sRel - minS) / range) * h;
                      return `${x},${y}`;
                    }).join(' ');

                    const mPoints = data.map((d, i) => {
                      const x = x0 + (i / (data.length - 1)) * w;
                      const y = y0 + h - ((d.sM - minS) / range) * h;
                      return `${x},${y}`;
                    }).join(' ');

                    const hPoints = data.map((d, i) => {
                      const x = x0 + (i / (data.length - 1)) * w;
                      const y = y0 + h - ((d.sH - minS) / range) * h;
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <>
                        <text x="25" y="10" fill="#aaa" fontSize="7">S_rel</text>
                        <polyline points={points} fill="none" stroke="#00b0ff" strokeWidth="1.5" />
                        <polyline points={mPoints} fill="none" stroke="#4CAF50" strokeWidth="0.8" strokeDasharray="3,2" />
                        <polyline points={hPoints} fill="none" stroke="#FF9800" strokeWidth="0.8" strokeDasharray="3,2" />
                        <text x="190" y="93" fill="#4CAF50" fontSize="6" textAnchor="end">α·M</text>
                        <text x="190" y="85" fill="#FF9800" fontSize="6" textAnchor="end">β·H</text>
                      </>
                    );
                  })()}
                </svg>
              </Paper>
            )}
          </Box>

          {/* 右侧面板 */}
          <Paper
            elevation={2}
            sx={{
              width: 280,
              minWidth: 280,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: 0,
            }}
          >
            <Tabs
              value={rightTab}
              onChange={(_, v) => setRightTab(v)}
              variant="fullWidth"
              sx={{ minHeight: 32, '& .MuiTab-root': { minHeight: 32, py: 0, fontSize: '0.65rem' } }}
            >
              <Tab label="详情" />
              <Tab label="β-rewire" />
              <Tab label="工具" />
              <Tab label="金符 ⊙" />
              <Tab label="MNQ8" />
            </Tabs>
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {rightTab === 0 && (
                <SphereDetailPanel sphere={selectedSphere} onUpdateSphere={updateSphere} />
              )}
              {rightTab === 1 && (
                <BetaRewirePanel
                  params={rewireParams}
                  onParamsChange={setRewireParams}
                  currentSRel={currentSRel}
                  isRewiring={isRewiring}
                  onRunStep={runRewireStep}
                  onRunMulti={runRewire}
                  onStartAuto={startAutoRewire}
                  onStopAuto={stopAutoRewire}
                  historyLength={rewireHistory.length}
                />
              )}
              {rightTab === 2 && (
                <Box>
                  <EmlCalculator />
                  <Divider />
                  <PCTChecker heap={heap} />
                </Box>
              )}
              {rightTab === 3 && (
                <GoldenSymbolPanel
                  heap={heap}
                  selectedSid={selectedSid}
                  mnq8Results={mnq8Results}
                />
              )}
              {rightTab === 4 && (
                <MNQ8Panel
                  heap={heap}
                  mnq8Results={mnq8Results}
                  onRunMNQ8Step={runMNQ8Step}
                  onRunMNQ8Full={runMNQ8Full}
                  onLoadHexRingGap={loadHexRingGap}
                />
              )}
            </Box>
          </Paper>
        </Box>

        {/* 底部面板 */}
        <Paper
          elevation={2}
          sx={{
            height: 180,
            minHeight: 120,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 0,
          }}
        >
          <Tabs
            value={bottomTab}
            onChange={(_, v) => setBottomTab(v)}
            variant="fullWidth"
            sx={{ minHeight: 28, '& .MuiTab-root': { minHeight: 28, py: 0, fontSize: '0.7rem' } }}
          >
            <Tab label="发现日志" />
            <Tab label="CHL 对比" />
            <Tab label="SOP 分析" />
            <Tab label="ICE 自指" />
          </Tabs>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {bottomTab === 0 && <DiscoveryLog discoveries={discoveries} />}
            {bottomTab === 1 && <CHLComparison />}
            {bottomTab === 2 && <SOPGenerator />}
            {bottomTab === 3 && (
              <ICEPanel
                iceState={iceState}
                onTickICE={tickICE}
                onToggleICE={toggleICE}
                onClearICE={clearICE}
              />
            )}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default App;
