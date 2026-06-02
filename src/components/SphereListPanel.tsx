/**
 * 金灵球列表面板
 * 展示所有金灵球，支持选中
 */

import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Chip,
  Box,
  Divider,
} from '@mui/material';
import type { JinlingSphere, JinlingHeap } from '../types/tmk';

interface SphereListPanelProps {
  heap: JinlingHeap;
  selectedSid: string | null;
  onSelect: (sid: string) => void;
}

const SphereListPanel: React.FC<SphereListPanelProps> = ({ heap, selectedSid, onSelect }) => {
  const spheres = Array.from(heap.V.values());

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" sx={{ px: 1.5, py: 1, fontWeight: 700, color: '#7c4dff' }}>
        金灵球 ({spheres.length})
      </Typography>
      <Divider />
      <List dense sx={{ flex: 1, overflow: 'auto', py: 0 }}>
        {spheres.map(sphere => (
          <ListItem key={sphere.sid} disablePadding>
            <ListItemButton
              selected={selectedSid === sphere.sid}
              onClick={() => onSelect(sphere.sid)}
              sx={{
                py: 0.5,
                '&.Mui-selected': { bgcolor: 'rgba(124,77,255,0.12)', borderLeft: '3px solid #7c4dff' },
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                      {sphere.sid.substring(0, 12)}
                    </Typography>
                    <Chip
                      label={sphere.chi === 1 ? '构' : '消'}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        bgcolor: sphere.chi === 1 ? 'rgba(46,125,50,0.15)' : 'rgba(198,40,40,0.15)',
                        color: sphere.chi === 1 ? '#2e7d32' : '#c62828',
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    m={sphere.mod} θ={sphere.phase.toFixed(2)} ports={sphere.ports.toString(2).padStart(10, '0')}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
        {spheres.length === 0 && (
          <ListItem>
            <ListItemText
              primary={<Typography variant="body2" color="text.secondary" textAlign="center">暂无球体</Typography>}
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default SphereListPanel;
