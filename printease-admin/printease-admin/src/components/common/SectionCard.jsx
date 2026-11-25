import React from 'react';
import { Card, Box, Typography } from '@mui/material';

/**
 * Generic card shell with an optional title / subtitle header and an
 * optional action area (buttons, filters) aligned to the right.
 */
export default function SectionCard({ title, subtitle, action, children, sx }) {
  return (
    <Card sx={{ p: { xs: 2, sm: 3 }, ...sx }}>
      {(title || action) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            mb: 2.5,
          }}
        >
          <Box>
            {title && (
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && <Box>{action}</Box>}
        </Box>
      )}
      {children}
    </Card>
  );
}
