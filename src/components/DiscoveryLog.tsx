/**
 * 发现日志组件
 * 记录每次 β-rewire 的发现
 */

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import type { DiscoveryEntry } from '../types/tmk';

interface DiscoveryLogProps {
  discoveries: DiscoveryEntry[];
}

const typeIcons: Record<DiscoveryEntry['type'], React.ReactNode> = {
  new_sphere: <AutoAwesomeIcon sx={{ color: '#7c4dff', fontSize: '1rem' }} />,
  new_edge: <AddCircleIcon sx={{ color: '#4CAF50', fontSize: '1rem' }} />,
  del_edge: <RemoveCircleIcon sx={{ color: '#f44336', fontSize: '1rem' }} />,
  new_hyperedge: <AutoAwesomeIcon sx={{ color: '#00b0ff', fontSize: '1rem' }} />,
  phase_lock: <AutoAwesomeIcon sx={{ color: '#FF9800', fontSize: '1rem' }} />,
  grade_conserve: <AutoAwesomeIcon sx={{ color: '#9C27B0', fontSize: '1rem' }} />,
};

const typeLabels: Record<DiscoveryEntry['type'], string> = {
  new_sphere: '新球',
  new_edge: '加边',
  del_edge: '删边',
  new_hyperedge: '超边',
  phase_lock: '相锁',
  grade_conserve: '阶守恒',
};

const DiscoveryLog: React.FC<DiscoveryLogProps> = ({ discoveries }) => {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" sx={{ px: 1.5, py: 0.5, fontWeight: 700, color: '#7c4dff' }}>
        发现日志 ({discoveries.length})
      </Typography>
      <Divider />
      <List dense sx={{ flex: 1, overflow: 'auto', py: 0 }}>
        {discoveries.slice().reverse().map((d, i) => (
          <ListItem key={i} sx={{ py: 0.3, px: 1 }}>
            <ListItemIcon sx={{ minWidth: 24 }}>
              {typeIcons[d.type]}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Chip
                    label={typeLabels[d.type]}
                    size="small"
                    sx={{ height: 16, fontSize: '0.55rem' }}
                    color={
                      d.type === 'new_sphere' ? 'primary' :
                      d.type === 'new_edge' ? 'success' :
                      d.type === 'del_edge' ? 'error' : 'info'
                    }
                  />
                  <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                    {d.description}
                  </Typography>
                </Box>
              }
              secondary={
                <Typography variant="caption" sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>
                  {new Date(d.timestamp).toLocaleTimeString()} | 球体: {d.spheres.join(', ')}
                </Typography>
              }
            />
          </ListItem>
        ))}
        {discoveries.length === 0 && (
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ fontSize: '0.75rem' }}>
                  运行 β-rewire 以发现新结构
                </Typography>
              }
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default DiscoveryLog;
