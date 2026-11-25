import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

/**
 * Lightweight, reusable table.
 *
 * columns: [{ key, label, align?, render?: (row) => node }]
 * rows: array of plain objects, each needs a stable `id`
 */
export default function DataTable({ columns, rows, rowKey = 'id' }) {
  return (
    <TableContainer sx={{ borderRadius: 3, border: '1px solid #EDEFF5' }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key} align={col.align ?? 'left'}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row[rowKey]}
              hover
              sx={{ '&:last-child td': { borderBottom: 0 } }}
            >
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align ?? 'left'}>
                  {col.render ? col.render(row) : row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
